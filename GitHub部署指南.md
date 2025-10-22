# GitHub Actions 部署指南

5分钟部署B类考试监控到GitHub，实现24/7自动运行

---

## 🎯 优势

- ✅ **完全免费** - 公开仓库无限制
- ✅ **零维护** - 自动运行
- ✅ **自动通知** - GitHub Issue通知
- ✅ **数据备份** - 自动保存到仓库

---

## 🚀 部署步骤

### 1. 创建GitHub仓库

访问：https://github.com/new

```
Repository name: radio-monitor
Description: B类无线电考试自动监控
Public (必须选择公开)
```

点击 "Create repository"

### 2. 推送代码

```bash
cd /Users/dadong/codebuddy/radio

git init
git add .
git commit -m "Initial commit"

# 替换成你的用户名
git remote add origin https://github.com/你的用户名/radio-monitor.git
git branch -M main
git push -u origin main
```

**如果推送要求登录**：
1. 访问：https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 `repo` 和 `workflow`
4. 复制token作为密码使用

### 3. 配置权限

仓库页面 → Settings → Actions → General

找到 "Workflow permissions"，选择：
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

点击 Save

### 4. 启用Actions

1. 点击仓库的 "Actions" 标签
2. 点击 "I understand my workflows, go ahead and enable them"
3. 点击 "B类无线电考试监控"
4. 点击右侧 "Run workflow" → "Run workflow" 测试

### 5. 验证运行

点击运行记录，展开各步骤查看日志，应该看到：

```
📋 找到 XX 个考试通知
✅ 监控完成
```

---

## ⏰ 自动运行

### 默认配置

每30分钟自动运行（在 `.github/workflows/monitor.yml` 中配置）

### 修改频率

编辑 `.github/workflows/monitor.yml` 第6行：

```yaml
# 每10分钟
- cron: '*/10 * * * *'

# 每小时
- cron: '0 * * * *'

# 每6小时
- cron: '0 */6 * * *'
```

**注意**：使用UTC时间（北京时间-8小时）

---

## 🔔 接收通知

### GitHub Issue通知

新的B类考试会自动创建Issue，包含：
- 考试标题
- 发布日期
- 考试日期
- 考试地点
- 报名链接

### 开启通知

1. **Web端**：访问仓库的Issues标签

2. **邮件通知**：
   - https://github.com/settings/notifications
   - 确保 "Issues" 已勾选

3. **手机通知**：
   - 下载GitHub App
   - 登录后自动接收

---

## 📊 查看结果

### 方式一：Issues标签

新考试 → 自动创建Issue → 收到通知

### 方式二：查看数据文件

```
https://github.com/你的用户名/radio-monitor/blob/main/b_class_exams.json
```

### 方式三：Actions日志

Actions → 点击运行记录 → 查看详细日志

---

## 🐛 故障排查

### Q: Workflow运行失败？

**检查**：
1. 点击失败的运行 → 查看错误日志
2. Settings → Actions → General → 确认权限已开启

**常见错误**：

#### playwright安装失败
```
解决：重新运行workflow（网络问题导致）
```

#### 权限错误
```
解决：Settings → Actions → 选择 "Read and write permissions"
```

### Q: 没有收到通知？

**检查**：
1. GitHub通知设置是否开启
2. Issue是否成功创建（查看Issues标签）
3. 邮箱垃圾邮件文件夹

### Q: 如何停止监控？

**方法一**：Actions → 工作流 → "..." → Disable workflow

**方法二**：删除 `.github/workflows/monitor.yml`

---

## 💰 费用

**公开仓库**：完全免费，无限制

**私有仓库**：每月2000分钟免费（通常够用）

---

## 🔄 更新代码

修改本地代码后：

```bash
git add .
git commit -m "更新"
git push

# GitHub Actions自动使用新代码
```

---

## ✅ 检查清单

- [ ] 代码已推送到GitHub
- [ ] Actions已启用
- [ ] 权限已配置（Read and write）
- [ ] 手动测试成功
- [ ] GitHub通知已开启

---

## 🎬 完成！

现在你有了一个24/7自动运行的监控系统：

- ✅ 自动检查新考试
- ✅ 自动创建Issue通知
- ✅ 自动保存数据
- ✅ 零维护成本

**享受自动化监控的便利！** 🎊
