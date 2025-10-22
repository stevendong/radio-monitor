// src/notifier.js
// 推送通知模块

export class Notifier {
  constructor(config) {
    this.config = config;
    this.enabled = config.notificationEnabled;
    this.type = config.notificationType; // 'serverchan' or 'pushplus'
    this.token = config.notificationToken;
  }

  /**
   * 发送通知
   */
  async send(exams) {
    if (!this.enabled || !this.token) {
      console.log('⚠️  通知未启用或未配置Token');
      return false;
    }

    if (exams.length === 0) {
      console.log('📭 没有需要推送的考试');
      return true;
    }

    console.log(`📤 准备推送 ${exams.length} 条考试通知...`);

    try {
      if (this.type === 'serverchan') {
        return await this.sendViaServerChan(exams);
      } else if (this.type === 'pushplus') {
        return await this.sendViaPushPlus(exams);
      } else {
        console.error('❌ 不支持的通知类型:', this.type);
        return false;
      }
    } catch (error) {
      console.error('❌ 推送失败:', error.message);
      return false;
    }
  }

  /**
   * Server酱推送
   * 文档: https://sct.ftqq.com/
   */
  async sendViaServerChan(exams) {
    const title = this.formatTitle(exams);
    const content = this.formatMarkdown(exams);

    const url = `https://sctapi.ftqq.com/${this.token}.send`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        desp: content,
      }),
    });

    const result = await response.json();

    if (result.code === 0) {
      console.log('✅ Server酱推送成功');
      return true;
    } else {
      console.error('❌ Server酱推送失败:', result.message);
      return false;
    }
  }

  /**
   * PushPlus推送
   * 文档: https://www.pushplus.plus/
   */
  async sendViaPushPlus(exams) {
    const title = this.formatTitle(exams);
    const content = this.formatMarkdown(exams);

    const url = 'https://www.pushplus.plus/send';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: this.token,
        title,
        content,
        template: 'markdown',
      }),
    });

    const result = await response.json();

    if (result.code === 200) {
      console.log('✅ PushPlus推送成功');
      return true;
    } else {
      console.error('❌ PushPlus推送失败:', result.msg);
      return false;
    }
  }

  /**
   * 格式化标题
   */
  formatTitle(exams) {
    if (exams.length === 1) {
      const exam = exams[0];
      const location = exam.locations[0] || '未知地点';
      const type = exam.examTypes[0] || '考试';
      return `🔔 ${location}${type}报名通知`;
    } else {
      return `🔔 发现 ${exams.length} 个新考试`;
    }
  }

  /**
   * 格式化Markdown内容
   */
  formatMarkdown(exams) {
    let content = `## 📻 无线电考试监控\n\n`;
    content += `发现 **${exams.length}** 个符合条件的考试：\n\n`;
    content += `---\n\n`;

    exams.forEach((exam, index) => {
      content += `### ${index + 1}. ${exam.title}\n\n`;
      content += `- 📅 **考试日期**: ${exam.examDate || '未知'}\n`;
      content += `- 📍 **考试地点**: ${exam.locations.join('、') || '未知'}\n`;
      content += `- 📝 **考试类型**: ${exam.examTypes.join('、') || '未知'}\n`;

      if (exam.venue) {
        content += `- 🏢 **考试场地**: ${exam.venue}\n`;
      }

      if (exam.signupPeriod) {
        content += `- 📆 **报名时间**: ${exam.signupPeriod.raw}\n`;
      }

      content += `- 🔗 **查看详情**: [点击查看](${exam.url})\n`;
      content += `\n---\n\n`;
    });

    content += `\n\n> 🤖 此消息由自动监控系统发送`;
    return content;
  }
}
