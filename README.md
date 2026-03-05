# 🎧 悦听吧 (DreamListenBar) Web App

移动端友好的有声小说播放应用 - Glassmorphism 设计风格

## ✨ 功能特性

- 🏠 **首页分类** - 最新更新、玄幻奇幻、武侠修真等10个分类
- 🔍 **智能搜索** - 支持书名、作者、主播搜索
- 📖 **书籍详情** - 封面展示、章节列表、分页浏览
- 🎵 **全局播放器** - 切换页面不中断播放
- ⏯️ **播放控制** - 上/下一曲、快进/快退、倍速播放
- 📱 **PWA支持** - 可添加到主屏幕，像原生App一样使用
- 🌙 **深色模式** - Glassmorphism 玻璃拟物化设计

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Node.js + Playwright (音频解析)
- **数据源**: yuetingba.cn

## 🚀 部署到 Vercel

1. 点击下方按钮一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dreamlistenbar-web)

2. 设置环境变量：
   - `BACKEND_URL`: 你的后端服务地址（用于音频解析）

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 查看

## 📋 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| BACKEND_URL | Playwright 后端服务地址 | http://localhost:3001 |

## 📱 PWA 配置

在手机浏览器中打开后，点击"添加到主屏幕"即可像原生App一样使用。

---

Made with 💙 by DreamHomeGTA
