// src/index.js
// 主入口文件

import fs from 'fs/promises';
import { Scraper } from './scraper.js';
import { Parser } from './parser.js';
import { Filter } from './filter.js';
import { Notifier } from './notifier.js';
import { ExamTracker } from './tracker.js';
import { loadConfig } from './config.js';

async function main() {
  console.log('🎯 B类无线电考试监控');
  console.log('='.repeat(70));

  const config = loadConfig();

  console.log('📋 配置信息:');
  console.log(`   监控URL: ${config.url}`);
  if (config.notificationEnabled) {
    console.log(`   🔔 通知已启用: ${config.notificationType}`);
  }
  if (config.examTypes.length > 0) {
    console.log(`   考试类型: ${config.examTypes.join(', ')}`);
  }
  if (config.locations.length > 0) {
    console.log(`   关注地区: ${config.locations.join(', ')}`);
  }
  if (config.excludeKeywords.length > 0) {
    console.log(`   排除关键词: ${config.excludeKeywords.join(', ')}`);
  }
  console.log('');

  const scraper = new Scraper(config);
  const filter = new Filter(config);
  const notifier = new Notifier(config);
  const tracker = new ExamTracker();

  try {
    // 0. 加载历史推送记录
    await tracker.load();
    // 1. 初始化浏览器
    console.log('🌐 初始化浏览器...');
    await scraper.init();

    // 2. 获取列表页链接
    const links = await scraper.getExamLinks();

    if (links.length === 0) {
      console.log('⚠️  未找到任何考试通知');
      return;
    }

    // 3. 并发抓取详情页
    const details = await scraper.getAllDetails(links);

    if (details.length === 0) {
      console.log('⚠️  未能抓取到任何详情');
      return;
    }

    // 4. 解析所有考试信息
    console.log('');
    console.log('🔧 解析考试信息...');
    const exams = details.map(detail => Parser.parseExam(detail));

    // 5. 筛选匹配的考试
    console.log('🔍 筛选匹配的考试...');
    console.log('');
    const matchedExams = [];

    for (const exam of exams) {
      const result = filter.match(exam);

      if (result.matched) {
        console.log(`  ✅ ${exam.title}`);
        if (result.reasons) {
          console.log(`     匹配: ${result.reasons}`);
        }
        console.log(`     考试日期: ${exam.examDate || '未知'}`);
        console.log(`     链接: ${exam.url}`);
        console.log('');

        matchedExams.push({
          ...exam,
          matchedReasons: result.reasons,
        });
      }
    }

    // 6. 筛选出新考试（未推送过的）
    console.log('');
    console.log('🔍 检查新考试...');
    const newExams = tracker.filterNewExams(matchedExams);

    // 7. 推送通知
    if (newExams.length > 0) {
      console.log('');
      const notificationSent = await notifier.send(newExams);

      if (notificationSent) {
        // 标记为已推送
        tracker.markAsNotified(newExams);
        await tracker.save();
      }
    }

    // 8. 生成输出数据
    const output = {
      lastUpdated: new Date().toISOString(),
      config: {
        examTypes: config.examTypes,
        locations: config.locations,
        excludeKeywords: config.excludeKeywords,
        includeKeywords: config.includeKeywords,
      },
      summary: {
        totalFound: exams.length,
        matched: matchedExams.length,
        futureExams: exams.filter(e => filter.isFutureExam(e)).length,
        newExams: newExams.length, // 新增：本次发现的新考试
      },
      exams: matchedExams,
    };

    // 9. 保存到文件
    await fs.writeFile(
      'exams.json',
      JSON.stringify(output, null, 2),
      'utf-8'
    );

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ 监控完成！');
    console.log('');
    console.log(`   📊 总共找到: ${exams.length} 条通知`);
    console.log(`   🔮 未来考试: ${output.summary.futureExams} 条`);
    console.log(`   ✅ 匹配条件: ${matchedExams.length} 条`);
    console.log(`   🆕 新增考试: ${newExams.length} 条`);
    console.log('');
    console.log(`   💾 数据已保存到: exams.json`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

// 运行主函数
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
