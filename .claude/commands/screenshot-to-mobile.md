---
description: 截取当前桌面端页面截图，分析 UI 设计，生成对应的移动端 UniApp 组件代码
argument-hint: <页面路径或URL，如 http://localhost:5173/player>
---

使用 Playwright MCP 截取指定页面的截图，然后分析其 UI 设计语言，输出对应的 UniApp + uView UI 移动端组件。

## 步骤

1. 用 Playwright 打开并截取页面：`$ARGUMENTS`
2. 分析截图中的：
   - 色彩系统（主色、背景色、文字色）
   - 布局结构（导航、内容区、操作区）
   - 交互元素（按钮、列表、卡片）
3. 读取 `apps/electron/src/styles/` 获取现有设计 token
4. 输出 UniApp Vue3 + uView UI 组件代码，适配移动端屏幕

## 输出格式

- 组件文件路径建议
- 完整的 `.vue` 组件代码
- 需要的 uView UI 组件列表
- 与桌面端的设计差异说明
