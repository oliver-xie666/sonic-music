---
description: 为移动端创建新页面，包含路由配置、页面组件、store 和 API 对接
argument-hint: <页面名称，如 player 或 search>
---

在 apps/mobile/src/pages/$ARGUMENTS/ 下创建完整的页面结构。

## 步骤

1. 读取 `apps/mobile/pages.json` 了解现有路由结构
2. 读取 `apps/electron/src/views/` 中对应的桌面端页面作为参考
3. 创建以下文件：
   - `apps/mobile/src/pages/$ARGUMENTS/index.vue` — 页面主组件
   - `apps/mobile/src/stores/$ARGUMENTS.ts` — Pinia store（如需要）
   - `apps/mobile/src/api/$ARGUMENTS.ts` — API 请求（如需要）
4. 更新 `apps/mobile/pages.json` 添加路由

## 规范

- Vue3 `<script setup lang="ts">`
- uView UI 组件优先
- 复用桌面端已有的 store 逻辑
- 处理加载状态、空状态、错误状态
