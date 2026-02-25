---
description: 检查移动端跨平台兼容性问题，输出修复建议
argument-hint: <文件路径，如 src/pages/player/index.vue，不填则检查整个 apps/mobile>
---

检查 UniApp 移动端代码的跨平台兼容性问题。

## 检查范围

$ARGUMENTS 或 apps/mobile/src/

## 检查项目

1. **CSS 兼容性**：不支持的 CSS 属性（如 position:fixed 在小程序中的限制）
2. **API 兼容性**：使用了 H5 专有 API 但未加条件编译
3. **组件兼容性**：使用了不支持的 HTML 标签（div/span 应改为 view/text）
4. **路由兼容性**：vue-router 不可用，需用 uni.navigateTo
5. **网络请求**：axios 不可用，需用 uni.request 封装

## 输出格式

- 问题列表（文件:行号 — 问题描述）
- 修复代码示例
- 优先级（高/中/低）
