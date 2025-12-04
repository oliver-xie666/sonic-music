# Sonic Music 🎵

[English](./README.en.md) | [简体中文](./README.md) | 日本語 | [한국어](./README.ko.md)

マルチソース対応のモダンなクロスプラットフォーム音楽プレーヤー。

![Sonic Music](./assets/icons/icon.svg)

## ✨ 機能

- 🎨 モダンなグラスモーフィズム UI デザイン
- 🎵 マルチソース対応（Kugou、NetEase Cloud Music、ローカルファイルなど）
- 📱 クロスプラットフォーム：Web、デスクトップ（Electron）、モバイル（uni-app x）
- 🌈 アルバムアートワークに基づく動的テーマカラー
- 📝 文字レベルのハイライト付きスマート歌詞
- 💾 ローカル音楽ライブラリ管理
- 🎧 高品質オーディオ再生
- 🌍 多言語サポート（英語、中国語、日本語、韓国語）
- ⌨️ グローバルショートカット
- 📻 デスクトップ歌詞ウィンドウ
- 🔄 再生モード（シャッフル、リピートなど）

## 📦 インストール

### デスクトップアプリ

[Releases](https://github.com/oliver-xie666/sonic-music/releases) ページから最新版をダウンロードしてください。

### Web 版

[Sonic Music Web](https://sonic-music.app) にアクセス（近日公開）

## 🛠️ 開発

### 前提条件

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/oliver-xie666/sonic-music.git
cd sonic-music

# pnpm をインストール（まだインストールしていない場合）
npm install -g pnpm

# 依存関係をインストール
pnpm install

# 開発モードを起動（Electron + Web + API）
pnpm dev

# Web のみを起動
pnpm dev:web

# Electron のみを起動
pnpm dev:electron
```

### ビルド

```bash
# Web 版をビルド
pnpm build:web

# Windows アプリをビルド
pnpm build:electron:win

# macOS アプリをビルド
pnpm build:electron:macos

# Linux アプリをビルド
pnpm build:electron:linux
```

## 📁 プロジェクト構造

```
sonic-music/
├── src/                  # Vue 3 ソースコード
│   ├── components/       # UI コンポーネント
│   ├── views/           # ページビュー
│   ├── stores/          # Pinia ストア
│   ├── router/          # Vue Router
│   ├── utils/           # ユーティリティ
│   └── language/        # i18n 翻訳
├── electron/            # Electron メインプロセス
├── api/                 # 音楽 API サーバー
├── public/              # 静的アセット
├── build/               # ビルドリソース（アイコンなど）
├── apps/
│   ├── electron/        # Electron デスクトップアプリ
│   └── mobile/          # uni-app x モバイルアプリ（開発中）
└── packages/            # 共有パッケージ（開発中）
```

## 🎯 技術スタック

- **フロントエンド**: Vue 3 + Pinia + Vue Router + Vue i18n
- **ビルドツール**: Vite 7
- **デスクトップ**: Electron 39
- **モバイル**: uni-app x（開発中）
- **API**: Node.js + Express
- **スタイリング**: CSS + 動的テーマ

## 🤝 コントリビューション

コントリビューションを歓迎します！詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をお読みください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は [LICENSE](./LICENSE) ファイルを参照してください。

## ⚠️ 免責事項

このプロジェクトは教育目的のみです。著作権を尊重し、公式音楽プラットフォームをサポートしてください。

## 🙏 謝辞

このプロジェクトは、いくつかの優れたオープンソース音楽プレーヤーに基づいて構築され、インスピレーションを受けています：

- **[MoeKoeMusic](https://github.com/Kaidesuyo/MoeKoeMusic)** - このプロジェクトの元の基盤、コアアーキテクチャと UI デザインを提供
- **[VutronMusic](https://github.com/jooy2/vutron)** - Electron + Vue 3 + Vite 統合パターン
- **[AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer)** - 音楽プレーヤーのアーキテクチャと機能のインスピレーション
- **[YesPlayMusic](https://github.com/qier222/YesPlayMusic)** - 美しい UI デザインとユーザーエクスペリエンスのインスピレーション
- **[lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)** - デスクトップ音楽プレーヤーのベストプラクティス

特別な感謝：
- **[KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)** - 音楽 API 統合

これらのプロジェクトとその貢献者に感謝します！

## 📧 連絡先

- 作者：oliver-xie666
- メール：153884673@qq.com
- GitHub：[@oliver-xie666](https://github.com/oliver-xie666)
