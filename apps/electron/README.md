# Sonic Music Electron 应用

Sonic Music 的主要 Electron 桌面应用程序。

## 特性

- 🎨 现代化毛玻璃 UI 设计
- 🎵 多音源支持（酷狗音乐、网易云音乐、本地文件）
- 📝 智能歌词，支持逐字高亮
- 💾 本地音乐库管理
- 🎧 高品质音频播放
- 🌍 多语言支持
- ⌨️ 全局快捷键
- 📻 桌面歌词窗口

## 开发

```bash
# 安装依赖
pnpm install
cd api && pnpm install

# 启动开发模式（API + Web + Electron）
pnpm dev

# 仅启动 Web 版本（不启动 Electron）
pnpm dev:web

# 构建 Web 版本
pnpm build:web

# 构建 Electron 应用
pnpm electron:build:win    # Windows
pnpm electron:build:macos  # macOS
pnpm electron:build:linux  # Linux
```

## 项目结构

```
apps/electron/
├── src/                 # Vue 3 源代码
│   ├── components/      # UI 组件
│   ├── views/          # 页面视图
│   ├── stores/         # Pinia 状态管理
│   ├── router/         # Vue Router 路由
│   ├── utils/          # 工具函数
│   └── language/       # 国际化翻译
├── electron/           # Electron 主进程
├── api/                # 音乐 API 服务器
├── public/             # 静态资源
└── build/              # 构建资源（图标等）
```

## 技术栈

- **前端框架**: Vue 3 + Pinia + Vue Router + Vue i18n
- **构建工具**: Vite 7
- **桌面端**: Electron 39
- **API 服务**: Node.js + Express
- **样式**: CSS + 动态主题

## 🙏 致谢

本项目基于以下优秀的开源音乐播放器构建和启发：

- **[MoeKoeMusic](https://github.com/Kaidesuyo/MoeKoeMusic)** - 本项目的原始基础
- **[VutronMusic](https://github.com/jooy2/vutron)** - Electron + Vue 3 + Vite 集成
- **[AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer)** - 架构灵感
- **[YesPlayMusic](https://github.com/qier222/YesPlayMusic)** - UI/UX 灵感
- **[lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)** - 桌面播放器最佳实践

特别感谢所有这些优秀项目的贡献者！

## 许可证

MIT © oliver-xie666
