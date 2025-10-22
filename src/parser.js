// src/parser.js
// 考试信息解析模块

export class Parser {
  /**
   * 解析考试信息
   */
  static parseExam(exam) {
    const { url, title, publishDate, fullText } = exam;

    const parsed = {
      id: this.extractId(url),
      url,
      title,
      publishDate,

      // 解析考试日期
      examDate: this.extractExamDate(fullText),
      examDateRaw: this.extractExamDateRaw(fullText),

      // 解析报名时间
      signupPeriod: this.extractSignupPeriod(fullText),

      // 解析地点
      locations: this.extractLocations(fullText),
      venue: this.extractVenue(fullText),

      // 解析考试类型
      examTypes: this.extractExamTypes(fullText),

      // 完整内容
      contentPreview: fullText.substring(0, 200).replace(/\s+/g, ' '),
      fullContent: fullText,
    };

    return parsed;
  }

  /**
   * 从URL提取ID
   */
  static extractId(url) {
    const match = url.match(/\/(\d+)\.html/);
    return match ? match[1] : null;
  }

  /**
   * 提取考试日期（标准化格式 YYYY-MM-DD）
   */
  static extractExamDate(text) {
    // 尝试完整日期: 2025年11月8日
    let match = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // 尝试月日: 11月8日
    match = text.match(/(\d{1,2})月(\d{1,2})日/);
    if (match) {
      const [, month, day] = match;
      const year = this.inferYear(parseInt(month));
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
  }

  /**
   * 提取原始日期文本
   */
  static extractExamDateRaw(text) {
    const match = text.match(/(\d{4}年)?\d{1,2}月\d{1,2}日/);
    return match ? match[0] : null;
  }

  /**
   * 智能推断年份
   */
  static inferYear(month) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 如果月份 >= 当前月份，是今年；否则是明年
    return month >= currentMonth ? currentYear : currentYear + 1;
  }

  /**
   * 提取报名时间段
   */
  static extractSignupPeriod(text) {
    const patterns = [
      /报名时间[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日).*?[至到].*?(\d{4}年\d{1,2}月\d{1,2}日)/,
      /(\d{4}年\d{1,2}月\d{1,2}日)\s*[至到]\s*(\d{4}年\d{1,2}月\d{1,2}日)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          raw: match[0],
          start: this.parseChineseDate(match[1]),
          end: this.parseChineseDate(match[2]),
        };
      }
    }

    return null;
  }

  /**
   * 解析中文日期
   */
  static parseChineseDate(dateStr) {
    const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return null;
  }

  /**
   * 提取地点
   */
  static extractLocations(text) {
    const cities = [
      '广州', '深圳', '东莞', '佛山', '惠州', '珠海',
      '中山', '江门', '肇庆', '汕头', '潮州', '揭阳',
      '汕尾', '湛江', '茂名', '阳江', '云浮', '韶关',
      '清远', '梅州', '河源'
    ];

    const found = [];
    for (const city of cities) {
      if (text.includes(city)) {
        found.push(city);
      }
    }

    return [...new Set(found)]; // 去重
  }

  /**
   * 提取详细地址
   */
  static extractVenue(text) {
    const patterns = [
      /考试地点[：:]\s*([^\n。；]{5,100})/,
      /地\s*点[：:]\s*([^\n。；]{5,100})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * 提取考试类型
   */
  static extractExamTypes(text) {
    const types = [];

    if (text.includes('A类') || text.includes('A級')) {
      types.push('A类');
    }
    if (text.includes('B类') || text.includes('B級')) {
      types.push('B类');
    }
    if (text.includes('C类') || text.includes('C級')) {
      types.push('C类');
    }

    return types;
  }
}
