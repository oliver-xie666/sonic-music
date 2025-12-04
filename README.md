# Sonic Music 🎵

[English](./README.en.md) | 简体中文 | [日本語](./README.ja.md) | [한국어](./README.ko.md)

一个现代化的跨平台音乐播放器，支持多音源。

![Sonic Music](./assets/icons/icon.svg)

## ✨ 特性

- 🎨 现代化毛玻璃 UI 设计
- 🎵 多音源支持（酷狗音乐、网易云音乐、本地文件等）
- 📱 跨平台：Web、桌面端（Electron）、移动端（uni-app x）
- 🌈 基于专辑封面的动态主题色
- 📝 智能歌词，支持逐字高亮
- 💾 本地音乐库管理
- 🎧 高品质音频播放
- 🌍 多语言支持（英语、中文、日语、韩语）
- ⌨️ 全局快捷键
- 📻 桌面歌词窗口
- 🔄 多种播放模式（随机、循环等）

## 📦 安装

### 桌面应用

从 [Releases](https://github.com/oliver-xie666/sonic-music/releases) 页面下载最新版本。

### Web 版本

访问 [Sonic Music Web](https://sonic-music.app)（即将推出）

## 🛠️ 开发

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/oliver-xie666/sonic-music.git
cd sonic-music

# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装依赖
pnpm install

# 启动开发模式（Electron + Web + API）
pnpm dev

# 仅启动 Web 版本
pnpm dev:web

# 仅启动 Electron
pnpm dev:electron
```

### 构建

```bash
# 构建 Web 版本
pnpm build:web

# 构建 Windows 应用
pnpm build:electron:win

# 构建 macOS 应用
pnpm build:electron:macos

# 构建 Linux 应用
pnpm build:electron:linux
```

## 📁 项目结构

```
sonic-music/
├── src/                  # Vue 3 源代码
│   ├── components/       # UI 组件
│   ├── views/           # 页面视图
│   ├── stores/          # Pinia 状态管理
│   ├── router/          # Vue Router 路由
│   ├── utils/           # 工具函数
│   └── language/        # 国际化翻译
├── electron/            # Electron 主进程
├── api/                 # 音乐 API 服务器
├── public/              # 静态资源
├── build/               # 构建资源（图标等）
├── apps/
│   ├── electron/        # Electron 桌面应用
│   └── mobile/          # uni-app x 移动应用（开发中）
└── packages/            # 共享包（开发中）
```

## 🎯 技术栈

- **前端框架**: Vue 3 + Pinia + Vue Router + Vue i18n
- **构建工具**: Vite 7
- **桌面端**: Electron 39
- **移动端**: uni-app x（开发中）
- **API 服务**: Node.js + Express
- **样式**: CSS + 动态主题

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## ⚠️ 免责声明

本项目仅供学习交流使用，请尊重版权，支持正版音乐平台。

## 🙏 致谢

本项目基于以下优秀的开源音乐播放器构建和启发：

- **[MoeKoeMusic](https://github.com/Kaidesuyo/MoeKoeMusic)** - 本项目的原始基础，提供核心架构和 UI 设计
- **[VutronMusic](https://github.com/jooy2/vutron)** - Electron + Vue 3 + Vite 集成模式
- **[AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer)** - 音乐播放器架构和功能灵感
- **[YesPlayMusic](https://github.com/qier222/YesPlayMusic)** - 精美的 UI 设计和用户体验灵感
- **[lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)** - 桌面音乐播放器最佳实践

特别感谢：
- **[KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)** - 音乐 API 集成

感谢这些项目及其贡献者让开源音乐播放器变得更好！

## 📧 联系方式

- 作者：oliver-xie666
- 邮箱：153884673@qq.com
- GitHub：[@oliver-xie666](https://github.com/oliver-xie666)
