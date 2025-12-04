# Sonic Music 🎵

English | [简体中文](./README.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

A modern cross-platform music player with multi-source support.

![Sonic Music](./assets/icons/icon.svg)

## ✨ Features

- 🎨 Modern glassmorphism UI design
- 🎵 Multi-source music support (Kugou, NetEase Cloud Music, Local files, etc.)
- 📱 Cross-platform: Web, Desktop (Electron), Mobile (uni-app x)
- 🌈 Dynamic theme colors based on album artwork
- 📝 Smart lyrics with character-level highlighting
- 💾 Local music library management
- 🎧 High-quality audio playback
- 🌍 Multi-language support (English, Chinese, Japanese, Korean)
- ⌨️ Global shortcuts
- 📻 Desktop lyrics window
- 🔄 Playback modes (shuffle, repeat, etc.)

## 📦 Installation

### Desktop App

Download the latest release from [Releases](https://github.com/oliver-xie666/sonic-music/releases) page.

### Web Version

Visit [Sonic Music Web](https://sonic-music.app) (Coming soon)

## 🛠️ Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/oliver-xie666/sonic-music.git
cd sonic-music

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development mode (Electron + Web + API)
pnpm dev

# Start web only
pnpm dev:web

# Start electron only
pnpm dev:electron
```

### Build

```bash
# Build web version
pnpm build:web

# Build Electron app for Windows
pnpm build:electron:win

# Build Electron app for macOS
pnpm build:electron:macos

# Build Electron app for Linux
pnpm build:electron:linux
```

## 📁 Project Structure

```
sonic-music/
├── src/                  # Vue 3 source code
│   ├── components/       # UI components
│   ├── views/           # Page views
│   ├── stores/          # Pinia stores
│   ├── router/          # Vue Router
│   ├── utils/           # Utilities
│   └── language/        # i18n translations
├── electron/            # Electron main process
├── api/                 # Music API server
├── public/              # Static assets
├── build/               # Build resources (icons, etc.)
├── apps/
│   └── mobile/         # uni-app x mobile app (Coming soon)
└── packages/           # Shared packages (Coming soon)
```

## 🎯 Tech Stack

- **Frontend**: Vue 3 + Pinia + Vue Router + Vue i18n
- **Build Tool**: Vite 7
- **Desktop**: Electron 39
- **Mobile**: uni-app x (Coming soon)
- **API**: Node.js + Express
- **Styling**: CSS + Dynamic Themes

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## ⚠️ Disclaimer

This project is for educational purposes only. Please respect copyright and support official music platforms.

## 🙏 Acknowledgments

This project is built upon and inspired by several excellent open-source music players:

- **[MoeKoeMusic](https://github.com/Kaidesuyo/MoeKoeMusic)** - The original foundation of this project, providing the core architecture and UI design
- **[VutronMusic](https://github.com/jooy2/vutron)** - Electron + Vue 3 + Vite integration patterns
- **[AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer)** - Music player architecture and features inspiration
- **[YesPlayMusic](https://github.com/qier222/YesPlayMusic)** - Beautiful UI design and user experience inspiration
- **[lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)** - Desktop music player best practices

Special thanks to:
- **[KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)** - Music API integration

We are grateful to these projects and their contributors for making open-source music players better!

## 📧 Contact

- Author: oliver-xie666
- Email: 153884673@qq.com
- GitHub: [@oliver-xie666](https://github.com/oliver-xie666)
