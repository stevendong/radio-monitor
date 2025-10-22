# 无线电考试监控

自动监控广东省无线电协会网站的考试报名通知，支持自定义筛选条件（考试类型、地点、关键词等）。

---

## ✨ 特性

- ✅ **智能抓取** - 两阶段抓取（列表+详情页），信息更准确
- ✅ **灵活筛选** - 支持考试类型、地点、关键词等多维度筛选
- ✅ **自动过滤** - 只保留未来的考试，自动忽略过期通知
- ✅ **微信推送** - 发现新考试自动推送到微信（支持Server酱/PushPlus）
- ✅ **智能去重** - 同一考试只通知一次，避免重复打扰
- ✅ **结构化数据** - JSON格式输出，易于查询和分析
- ✅ **云端运行** - GitHub Actions自动化，无需本地运行
- ✅ **零成本** - 完全免费，公开仓库无限制使用

---

## 🚀 快速开始

### 方式一：GitHub Actions部署（推荐）

#### 1. 推送代码到GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/radio-monitor.git
git push -u origin main
```

#### 2. 配置筛选条件

访问：`Settings` → `Secrets and variables` → `Variables` → `New variable`

```
Name: MONITOR_CONFIG
Value:
{
  "exam_types": ["B类"],
  "locations": ["广州", "深圳", "东莞"]
}
```

#### 3. 启用GitHub Actions

- `Actions` 标签 → 启用 Workflows
- `Settings` → `Actions` → `General` → `Workflow permissions`
  - 选择 "Read and write permissions"
  - 勾选 "Allow GitHub Actions to create and approve pull requests"

#### 4. 配置通知（可选）

**启用微信推送通知：**

访问：`Settings` → `Secrets and variables` → `Secrets` → `New secret`

```
Name: NOTIFICATION_TOKEN
Value: 你的Server酱SendKey 或 PushPlus Token
```

访问：`Settings` → `Secrets and variables` → `Variables` → `New variable`

```
Name: NOTIFICATION_TYPE
Value: serverchan 或 pushplus
```

详细配置教程：查看 [通知配置.md](通知配置.md)

#### 5. 手动触发测试

`Actions` → `考试监控` → `Run workflow`

---

### 方式二：本地运行

#### 安装依赖

```bash
npm install
npx playwright install chromium
```

#### 配置筛选条件（可选）

```bash
export MONITOR_CONFIG='{
  "exam_types": ["B类"],
  "locations": ["广州", "深圳", "东莞"],
  "exclude_keywords": ["取消", "推迟"]
}'
```

#### 运行

```bash
npm start
```

---

## ⚙️ 配置说明

### 配置格式（JSON）

```json
{
  "exam_types": ["B类"],
  "locations": ["广州", "深圳", "东莞"],
  "exclude_keywords": ["取消", "推迟"],
  "include_keywords": ["报名通知"],
  "max_recent_notifications": 3,
  "timeout": 30000,
  "concurrency": 3
}
```

### 配置项说明

| 配置项 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `exam_types` | 数组 | 考试类型筛选 | `["B类"]` 或 `["A类", "B类"]` |
| `locations` | 数组 | 地点筛选 | `["广州", "深圳"]` |
| `exclude_keywords` | 数组 | 排除包含这些关键词的通知 | `["取消", "推迟"]` |
| `include_keywords` | 数组 | 只保留包含这些关键词的通知 | `["报名通知"]` |
| `max_recent_notifications` | 数字 | 只抓取最新N条通知（性能优化） | `3`（默认值） |
| `timeout` | 数字 | 页面加载超时（毫秒） | `30000` |
| `concurrency` | 数字 | 并发抓取数量 | `3` |

### 配置示例

**只关注B类考试：**
```json
{
  "exam_types": ["B类"]
}
```

**广州、深圳的B类考试：**
```json
{
  "exam_types": ["B类"],
  "locations": ["广州", "深圳"]
}
```

**排除取消/推迟的通知：**
```json
{
  "exam_types": ["B类"],
  "exclude_keywords": ["取消", "推迟", "延期"]
}
```

**不设置任何筛选（获取所有考试）：**
```json
{}
```

---

## 📊 输出数据格式

`exams.json` 文件结构：

```json
{
  "lastUpdated": "2025-10-21T12:00:00.000Z",
  "config": {
    "examTypes": ["B类"],
    "locations": ["广州", "深圳", "东莞"]
  },
  "summary": {
    "totalFound": 17,
    "matched": 3,
    "futureExams": 5
  },
  "exams": [
    {
      "id": "8789915",
      "url": "http://www.ragd.org.cn/newsinfo/8789915.html",
      "title": "（11月8日广州）广东省A、B类业余电台操作技能考试报名通知",
      "publishDate": "2025-10-16",
      "examDate": "2025-11-08",
      "examDateRaw": "11月8日",
      "signupPeriod": {
        "raw": "2025年10月20日至2025年10月30日",
        "start": "2025-10-20",
        "end": "2025-10-30"
      },
      "locations": ["广州"],
      "venue": "广州市天河区东莞庄路2号",
      "examTypes": ["A类", "B类"],
      "matchedReasons": "类型: B类; 地点: 广州",
      "contentPreview": "...",
      "fullContent": "..."
    }
  ]
}
```

---

## 🔄 运行频率

### 默认设置

- **运行时间**：每天早上9点到晚上8点，每小时运行一次
- **夜间静默**：晚上8点后不运行，避免打扰
- 修改频率：编辑 `.github/workflows/monitor.yml` 第6行

```yaml
# 当前配置：北京时间9:00-20:00每小时运行（UTC 1:00-12:00）
- cron: '0 1-12 * * *'

# 其他配置示例：

# 全天24小时每小时运行
- cron: '0 * * * *'

# 仅工作日白天运行（周一到周五 9:00-18:00）
- cron: '0 1-10 * * 1-5'

# 每2小时运行（9:00-20:00）
- cron: '0 1,3,5,7,9,11 * * *'

# 每天固定时间运行（9:00, 12:00, 18:00）
- cron: '0 1,4,10 * * *'
```

**注意：** GitHub Actions使用UTC时间，北京时间需要减8小时
- 北京时间 09:00 = UTC 01:00
- 北京时间 20:00 = UTC 12:00

---

## 📁 项目结构

```
radio-monitor/
├── .github/
│   └── workflows/
│       └── monitor.yml      # GitHub Actions配置
├── src/
│   ├── config.js           # 配置管理
│   ├── scraper.js          # 网页爬虫
│   ├── parser.js           # 数据解析
│   ├── filter.js           # 条件筛选
│   └── index.js            # 主入口
├── package.json            # 项目配置
├── exams.json             # 输出数据（自动生成）
└── README.md
```

---

## 🐛 故障排查

### Q: GitHub Actions运行失败？

**检查步骤：**
1. Actions → 点击失败的运行 → 查看日志
2. Settings → Actions → 确认权限已设置为 "Read and write"
3. 重新运行 Workflow

### Q: 没有找到匹配的考试？

**可能原因：**
1. 筛选条件太严格
2. 当前没有符合条件的未来考试
3. 网站结构变化

**解决方法：**
1. 放宽筛选条件（如删除 `locations`）
2. 查看 Actions 日志中的 "总共找到" 数量
3. 检查 `exams.json` 中的原始数据

### Q: 如何修改配置？

访问：`Settings` → `Variables` → 编辑 `MONITOR_CONFIG`

修改后下次运行自动生效，无需重新部署。

---

## 📖 详细文档

- [快速开始.md](快速开始.md) - 5分钟快速部署指南
- [通知配置.md](通知配置.md) - 微信推送通知配置教程
- [GitHub部署指南.md](GitHub部署指南.md) - 完整部署指南

---

## 💡 使用建议

1. **首次运行**：不设置任何筛选条件，先看看能抓到什么数据
2. **逐步细化**：根据实际需求逐步添加筛选条件
3. **定期检查**：每周查看一次 `exams.json` 或 Actions 运行结果
4. **及时报名**：发现匹配的考试后尽快访问链接查看详情

---

## ⚠️ 注意事项

1. 仓库必须是**公开**才能免费使用GitHub Actions
2. 检查间隔建议不低于1小时
3. GitHub Actions使用UTC时间（北京时间-8小时）
4. 监控到考试后请访问官网确认详情

---

## 📞 问题反馈

如有问题，请创建 Issue。

---

**祝考试顺利！📻**
