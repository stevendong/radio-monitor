// src/tracker.js
// 考试去重追踪模块

import fs from 'fs/promises';
import path from 'path';

export class ExamTracker {
  constructor() {
    this.historyFile = 'notified_exams.json';
    this.notifiedIds = new Set();
  }

  /**
   * 加载历史记录
   */
  async load() {
    try {
      const content = await fs.readFile(this.historyFile, 'utf-8');
      const data = JSON.parse(content);
      this.notifiedIds = new Set(data.notifiedIds || []);
      console.log(`📚 已加载 ${this.notifiedIds.size} 条历史推送记录`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 首次运行,创建新的追踪记录');
        this.notifiedIds = new Set();
      } else {
        console.error('⚠️  加载历史记录失败:', error.message);
        this.notifiedIds = new Set();
      }
    }
  }

  /**
   * 保存历史记录
   */
  async save() {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        notifiedIds: Array.from(this.notifiedIds),
        count: this.notifiedIds.size,
      };
      await fs.writeFile(
        this.historyFile,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
      console.log(`💾 已保存 ${this.notifiedIds.size} 条推送记录`);
    } catch (error) {
      console.error('❌ 保存历史记录失败:', error.message);
    }
  }

  /**
   * 筛选出新考试（未推送过的）
   */
  filterNewExams(exams) {
    const newExams = exams.filter(exam => !this.notifiedIds.has(exam.id));

    if (newExams.length === 0) {
      console.log('✅ 没有新的考试（所有考试都已推送过）');
    } else {
      console.log(`🆕 发现 ${newExams.length} 个新考试:`);
      newExams.forEach(exam => {
        console.log(`   - ${exam.title} (ID: ${exam.id})`);
      });
    }

    return newExams;
  }

  /**
   * 标记考试为已推送
   */
  markAsNotified(exams) {
    exams.forEach(exam => {
      this.notifiedIds.add(exam.id);
    });
  }

  /**
   * 清理过期记录（可选）
   * 删除超过N天的考试记录，避免文件无限增长
   */
  async cleanup(daysToKeep = 90) {
    const examsData = await this.loadExamsData();
    if (!examsData || !examsData.exams) return;

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysToKeep * 24 * 60 * 60 * 1000);

    // 找出所有仍然有效的考试ID
    const validIds = new Set();
    examsData.exams.forEach(exam => {
      if (exam.examDate) {
        const examDate = new Date(exam.examDate);
        if (examDate >= cutoffDate) {
          validIds.add(exam.id);
        }
      } else {
        // 没有日期的保留
        validIds.add(exam.id);
      }
    });

    // 只保留有效的ID
    const originalSize = this.notifiedIds.size;
    this.notifiedIds = new Set(
      Array.from(this.notifiedIds).filter(id => validIds.has(id))
    );

    const removed = originalSize - this.notifiedIds.size;
    if (removed > 0) {
      console.log(`🧹 清理了 ${removed} 条过期记录`);
    }
  }

  /**
   * 加载exams.json数据（用于清理）
   */
  async loadExamsData() {
    try {
      const content = await fs.readFile('exams.json', 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
}
