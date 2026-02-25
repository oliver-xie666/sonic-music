---
description: 分析桌面端现有功能，规划移动端实现方案，输出开发任务清单
---

分析 sonic-music 桌面端（apps/electron）的功能模块，规划移动端（apps/mobile）的实现方案。

## 步骤

1. 读取 `apps/electron/src/views/` 列出所有页面
2. 读取 `apps/electron/src/stores/` 列出所有状态
3. 读取 `apps/electron/src/api/` 或 `apps/api/` 了解接口
4. 对比 `apps/mobile/src/pages/` 已完成的页面
5. 输出差距分析和优先级排序的任务清单

## 输出格式

### 已完成
- [ ] 页面名称 — 完成度

### 待开发（按优先级）
- [ ] P0: 核心功能
- [ ] P1: 重要功能
- [ ] P2: 增强功能

### 技术风险
- 需要特别注意的跨平台问题
