# Sonic Music Demo Plugin

一个简单的 Sonic Music 演示插件，用于展示插件系统的基本功能。

## 功能特性

- ✅ 基于 Chrome Extension Manifest V3
- 🎨 精美的渐变 UI 界面
- 💾 使用 Chrome Storage API 存储数据
- 📡 Background Script 和 Popup 通信
- 🔄 实时数据统计和显示

## 插件结构

```
sonic-demo-plugin/
├── manifest.json    # 插件清单文件
├── background.js    # 后台服务脚本
├── popup.html       # 弹窗页面
├── popup.js         # 弹窗脚本
├── icon.png         # 插件图标
└── README.md        # 说明文档
```

## 功能说明

### 1. 测试功能
点击"测试功能"按钮会：
- 保存测试数据到本地存储
- 记录点击次数
- 发送消息到 background script
- 显示成功提示

### 2. 清除数据
点击"清除数据"按钮会：
- 清空所有本地存储数据
- 重置点击计数
- 显示清除成功提示

### 3. 后台监控
Background script 会：
- 监听插件安装和更新事件
- 接收来自 popup 的消息
- 监听存储变化
- 每30秒输出统计日志

## 安装方法

### 方法一：直接放入插件目录（开发模式）
1. 将整个 `sonic-demo-plugin` 文件夹复制到：
   ```
   apps/electron/plugins/extensions/
   ```
2. 重启 Sonic Music 应用
3. 插件会自动加载

### 方法二：通过 ZIP 安装
1. 将插件文件夹打包为 ZIP 文件
2. 在 Sonic Music 中打开"设置" → "插件管理"
3. 点击"安装插件"按钮
4. 选择 ZIP 文件进行安装

## 使用方法

1. 启动 Sonic Music 应用
2. 进入"设置" → "插件管理"
3. 找到"Sonic Music Demo Plugin"
4. 点击"打开弹窗"按钮
5. 在弹窗中测试各项功能

## 开发说明

### Manifest V3 特性
- 使用 `service_worker` 替代 `background.page`
- 使用 `action` 替代 `browser_action`
- 支持 `host_permissions` 权限声明

### 权限说明
- `storage`: 用于本地数据存储
- `host_permissions`: 允许访问本地主机（用于开发测试）

### 调试方法
1. 打开 Chrome DevTools
2. 查看 Console 输出
3. 检查 Storage 数据
4. 监控 Network 请求

## 技术栈

- HTML5 + CSS3
- Vanilla JavaScript
- Chrome Extension API
- Chrome Storage API

## 版本历史

### v1.0.0 (2025-12-11)
- ✨ 初始版本发布
- 🎨 实现渐变 UI 界面
- 💾 实现数据存储功能
- 📡 实现消息通信机制

## 作者

oliver-xie666

## 许可证

MIT License

## 相关链接

- [Sonic Music GitHub](https://github.com/oliver-xie666/sonic-music)
- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
