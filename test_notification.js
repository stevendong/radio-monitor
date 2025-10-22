// 本地测试推送功能
import { Notifier } from './src/notifier.js';

const testExams = [
  {
    id: "8789915",
    url: "http://www.ragd.org.cn/newsinfo/8789915.html",
    title: "（11月8日广州）广东省A、B类业余电台操作技能考试报名通知",
    publishDate: "2025-10-16",
    examDate: "2025-11-08",
    examDateRaw: "11月8日",
    signupPeriod: {
      raw: "2025年10月20日至2025年10月30日",
      start: "2025-10-20",
      end: "2025-10-30"
    },
    locations: ["广州", "东莞"],
    venue: "广州市花都区森林消防大队",
    examTypes: ["A类", "B类"],
    matchedReasons: "类型: B类; 地点: 广州"
  },
  {
    id: "8789916",
    url: "http://www.ragd.org.cn/newsinfo/8789916.html",
    title: "（11月22日深圳）广东省A类业余电台操作技能考试报名通知",
    publishDate: "2025-10-17",
    examDate: "2025-11-22",
    examDateRaw: "11月22日",
    signupPeriod: null,
    locations: ["深圳"],
    venue: "深圳市罗湖区无线电协会",
    examTypes: ["A类"],
    matchedReasons: "类型: A类; 地点: 深圳"
  }
];

async function testNotification() {
  console.log('='.repeat(70));
  console.log('📡 本地推送测试工具');
  console.log('='.repeat(70));
  console.log('');

  // 从环境变量读取配置
  const token = process.env.NOTIFICATION_TOKEN;
  const type = process.env.NOTIFICATION_TYPE || 'serverchan';

  if (!token) {
    console.log('❌ 未设置 NOTIFICATION_TOKEN 环境变量');
    console.log('');
    console.log('使用方法:');
    console.log('');
    console.log('# Server酱测试');
    console.log('export NOTIFICATION_TOKEN="你的Server酱SendKey"');
    console.log('export NOTIFICATION_TYPE="serverchan"');
    console.log('node test_notification.js');
    console.log('');
    console.log('# PushPlus测试');
    console.log('export NOTIFICATION_TOKEN="你的PushPlus Token"');
    console.log('export NOTIFICATION_TYPE="pushplus"');
    console.log('node test_notification.js');
    console.log('');
    console.log('='.repeat(70));
    return;
  }

  const config = {
    notificationEnabled: true,
    notificationType: type,
    notificationToken: token,
  };

  console.log('📋 配置信息:');
  console.log(`   通知类型: ${type}`);
  console.log(`   Token: ${token.substring(0, 10)}...`);
  console.log('');

  const notifier = new Notifier(config);

  // 显示将要发送的内容
  console.log('='.repeat(70));
  console.log('📝 推送内容预览:');
  console.log('='.repeat(70));
  console.log('');
  console.log('标题:');
  console.log(notifier.formatTitle(testExams));
  console.log('');
  console.log('-'.repeat(70));
  console.log('');
  console.log('内容:');
  console.log(notifier.formatMarkdown(testExams));
  console.log('');
  console.log('='.repeat(70));
  console.log('');

  // 测试单条消息
  console.log('🧪 测试 1: 发送单条考试通知...');
  console.log('');
  const result1 = await notifier.send([testExams[0]]);
  console.log('');

  if (result1) {
    console.log('✅ 单条通知发送成功！请检查微信是否收到消息');
  } else {
    console.log('❌ 单条通知发送失败，请检查Token是否正确');
  }
  console.log('');
  console.log('-'.repeat(70));
  console.log('');

  // 等待3秒
  console.log('⏳ 等待3秒后发送第二条测试...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('');

  // 测试多条消息
  console.log('🧪 测试 2: 发送多条考试通知...');
  console.log('');
  const result2 = await notifier.send(testExams);
  console.log('');

  if (result2) {
    console.log('✅ 多条通知发送成功！请检查微信是否收到消息');
  } else {
    console.log('❌ 多条通知发送失败，请检查Token是否正确');
  }
  console.log('');
  console.log('='.repeat(70));
  console.log('');
  console.log('✅ 测试完成！');
  console.log('');
  console.log('如果收到微信推送，说明配置正确！');
  console.log('='.repeat(70));
}

// 运行测试
testNotification().catch(error => {
  console.error('');
  console.error('❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
});
