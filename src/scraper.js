// src/scraper.js
// 网页爬虫模块

import { chromium } from 'playwright';

export class Scraper {
  constructor(config) {
    this.config = config;
    this.browser = null;
  }

  async init() {
    this.browser = await chromium.launch({
      headless: true,
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * 获取列表页的所有考试链接
   */
  async getExamLinks() {
    const context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    try {
      console.log('📡 访问列表页:', this.config.url);
      await page.goto(this.config.url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // 等待内容加载
      await page.waitForTimeout(2000);

      // 提取所有考试链接并按发布日期排序
      const links = await page.evaluate(() => {
        const items = document.querySelectorAll('.w-al-unit.w-list-item');
        const results = [];

        items.forEach(item => {
          const titleElem = item.querySelector('.w-al-title');
          const dateElem = item.querySelector('.w-al-date');

          if (titleElem) {
            const href = titleElem.getAttribute('href');
            const title = titleElem.innerText.trim();
            const publishDate = dateElem ? dateElem.innerText.trim() : null;

            results.push({
              url: href,
              title,
              publishDate,
            });
          }
        });

        return results;
      });

      console.log(`✅ 找到 ${links.length} 条考试通知`);

      // 按发布日期排序（最新的在前）
      const sortedLinks = links.sort((a, b) => {
        if (!a.publishDate || !b.publishDate) return 0;
        return b.publishDate.localeCompare(a.publishDate);
      });

      // 只保留最新的N条（可配置）
      const maxRecent = this.config.maxRecentNotifications || 3;
      const recentLinks = sortedLinks.slice(0, maxRecent);
      console.log(`📌 只抓取最新的 ${recentLinks.length} 条通知（优化性能）`);

      // 转换为完整URL
      const baseUrl = new URL(this.config.url);
      return recentLinks.map(link => ({
        ...link,
        url: link.url.startsWith('http')
          ? link.url
          : `${baseUrl.protocol}//${baseUrl.host}${link.url}`,
      }));

    } finally {
      await context.close();
    }
  }

  /**
   * 获取详情页内容
   */
  async getExamDetail(link) {
    const context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    try {
      console.log(`📄 抓取: ${link.title.substring(0, 40)}...`);

      await page.goto(link.url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      await page.waitForTimeout(1000);

      // 提取详情页内容
      const detail = await page.evaluate(() => {
        // 尝试多种常见的内容选择器
        const selectors = [
          '.content',
          '.article-content',
          '.detail-content',
          'article',
          '.main-content',
          'body'
        ];

        let contentElem = null;
        for (const selector of selectors) {
          contentElem = document.querySelector(selector);
          if (contentElem) break;
        }

        const fullText = contentElem ? contentElem.innerText : document.body.innerText;

        return {
          fullText: fullText.trim(),
          html: contentElem ? contentElem.innerHTML : '',
        };
      });

      return {
        ...link,
        ...detail,
      };

    } catch (error) {
      console.error(`❌ 抓取失败 ${link.url}:`, error.message);
      return null;
    } finally {
      await context.close();
    }
  }

  /**
   * 并发抓取所有详情页
   */
  async getAllDetails(links) {
    const results = [];
    const concurrency = this.config.concurrency;

    console.log(`📥 开始抓取详情页 (并发数: ${concurrency})...`);

    // 分批并发处理
    for (let i = 0; i < links.length; i += concurrency) {
      const batch = links.slice(i, i + concurrency);
      console.log(`   批次 ${Math.floor(i / concurrency) + 1}/${Math.ceil(links.length / concurrency)}`);

      const batchResults = await Promise.all(
        batch.map(link => this.getExamDetail(link))
      );

      results.push(...batchResults.filter(r => r !== null));

      // 避免请求过快
      if (i + concurrency < links.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
