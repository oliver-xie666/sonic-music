# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-12-11

### ✨ 新增功能 (Features)

#### UI/UX 改进
- **播放器界面重构**: 重构播放列表样式，参考 AlgerMusicPlayer 设计
- **播放控制栏**: 重构播放器底部控制栏布局和交互
- **响应式布局**: 实现完整的响应式布局，支持移动端适配
- **首页优化**: 优化首页响应式布局并新增周杰伦歌单推荐
- **动画效果**: 新增页面切换和交互动画效果
- **用户界面**: 优化用户头像菜单和关闭确认对话框
- **侧边栏导航**: 重新设计侧边栏和顶部导航栏

#### Electron 功能
- **应用图标**: 更新应用图标为 Sonic Music 品牌图标
- **关闭确认**: 添加关闭按钮确认弹窗功能
- **开发环境**: 优化开发环境启动流程，支持端口自动检测
- **构建配置**: 添加构建资源文件和安装程序配置

#### API 服务
- **端口管理**: 新增端口占用自动顺延功能

### 🐛 问题修复 (Bug Fixes)

- **登录问题**: 修复二维码登录和会员歌曲播放问题
- **播放器**: 修复登录提示重复和播放失败问题
- **启动配置**: 修复启动配置读取时机问题
- **关闭弹窗**: 优化关闭确认弹窗 UI 和国际化
- **API 服务**: 修复打包后 API 服务启动失败的问题
- **跨平台**: 修复 Windows 下启动脚本无法并行执行的问题

### 🔨 重构 (Refactor)

- **项目结构**: 重构项目结构，迁移 API 到独立目录
- **Monorepo**: 采用 Monorepo 架构，使用 Turborepo 管理
- **包管理**: 从 npm 迁移到 pnpm

### 📦 项目初始化

- 基于 MoeKoeMusic 创建 Sonic Music 项目
- 移除动漫元素和彩蛋，打造全新品牌形象
- 完成项目名称和引用的全面迁移
- 添加国际化 README 文件（英文、日文、韩文、繁体中文）
- 添加致谢说明

### 🎯 技术栈

- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **桌面应用**: Electron
- **包管理**: pnpm
- **Monorepo**: Turborepo
- **API 服务**: NeteaseCloudMusicApi

### 📝 说明

这是 Sonic Music 的首个版本，基于 MoeKoeMusic 项目进行重构和优化。主要特性包括：

- 🎵 支持网易云音乐
- 🎨 现代化的用户界面
- 📱 响应式设计，支持多种屏幕尺寸
- 🖥️ 跨平台支持（Windows、macOS、Linux）
- 🔐 支持二维码登录
- 🎧 完整的音乐播放功能
- 📋 播放列表管理
- 🔍 音乐搜索功能

### 🙏 致谢

感谢以下项目的启发和参考：
- [MoeKoeMusic](https://github.com/iAJue/MoeKoeMusic) - 原始项目基础
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) - 网易云音乐 API
- [AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer) - UI 设计参考
- [YesPlayMusic](https://github.com/qier222/YesPlayMusic) - 功能参考

---

**完整更新日志**: https://github.com/oliver-xie666/sonic-music/commits/v0.0.1
