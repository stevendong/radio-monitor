// src/config.js
// 配置管理模块

export function loadConfig() {
  // 从 GitHub Variables 读取配置
  const configStr = process.env.MONITOR_CONFIG || '{}';

  let config = {};
  try {
    config = JSON.parse(configStr);
  } catch (error) {
    console.warn('⚠️  配置解析失败，使用默认配置');
  }

  // 从环境变量读取通知配置
  const notificationToken = process.env.NOTIFICATION_TOKEN || '';
  const notificationType = process.env.NOTIFICATION_TYPE || 'serverchan';

  return {
    // 监控URL
    url: 'http://www.ragd.org.cn/kstz',

    // 筛选条件
    examTypes: config.exam_types || [],
    locations: config.locations || [],
    excludeKeywords: config.exclude_keywords || [],
    includeKeywords: config.include_keywords || [],

    // 超时设置
    timeout: config.timeout || 30000,
    retries: config.retries || 3,

    // 并发设置
    concurrency: config.concurrency || 3,

    // 抓取数量限制（只抓取最新的N条通知）
    maxRecentNotifications: config.max_recent_notifications || 3,

    // 通知配置
    notificationEnabled: !!notificationToken, // 有Token就启用
    notificationType: notificationType, // 'serverchan' or 'pushplus'
    notificationToken: notificationToken,
  };
}
