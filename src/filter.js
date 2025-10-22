// src/filter.js
// 考试筛选模块

export class Filter {
  constructor(config) {
    this.config = config;
  }

  /**
   * 判断考试是否匹配筛选条件
   */
  match(exam) {
    const reasons = [];

    // 1. 必须是未来的考试
    if (!this.isFutureExam(exam)) {
      return { matched: false, reason: '考试已过期' };
    }

    // 2. 考试类型匹配
    if (this.config.examTypes.length > 0) {
      const hasMatchingType = exam.examTypes.some(type =>
        this.config.examTypes.includes(type)
      );

      if (!hasMatchingType) {
        return { matched: false, reason: '考试类型不匹配' };
      }

      const matchedTypes = exam.examTypes.filter(type =>
        this.config.examTypes.includes(type)
      );
      reasons.push(`类型: ${matchedTypes.join(',')}`);
    }

    // 3. 地点匹配
    if (this.config.locations.length > 0) {
      const hasMatchingLocation = exam.locations.some(loc =>
        this.config.locations.includes(loc)
      );

      if (!hasMatchingLocation) {
        return { matched: false, reason: '地点不匹配' };
      }

      const matchedLocs = exam.locations.filter(loc =>
        this.config.locations.includes(loc)
      );
      reasons.push(`地点: ${matchedLocs.join(',')}`);
    }

    // 4. 排除关键词
    if (this.config.excludeKeywords.length > 0) {
      const fullText = exam.title + exam.fullContent;
      const excludedKeyword = this.config.excludeKeywords.find(kw =>
        fullText.includes(kw)
      );

      if (excludedKeyword) {
        return { matched: false, reason: `包含排除关键词: ${excludedKeyword}` };
      }
    }

    // 5. 包含关键词（可选）
    if (this.config.includeKeywords.length > 0) {
      const fullText = exam.title + exam.fullContent;
      const hasIncludedKeyword = this.config.includeKeywords.some(kw =>
        fullText.includes(kw)
      );

      if (!hasIncludedKeyword) {
        return { matched: false, reason: '不包含必需关键词' };
      }

      const matchedKeywords = this.config.includeKeywords.filter(kw =>
        fullText.includes(kw)
      );
      reasons.push(`关键词: ${matchedKeywords.join(',')}`);
    }

    return {
      matched: true,
      reasons: reasons.join('; ')
    };
  }

  /**
   * 判断是否未来的考试
   */
  isFutureExam(exam) {
    if (!exam.examDate) {
      return false;
    }

    const examDate = new Date(exam.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return examDate >= today;
  }
}
