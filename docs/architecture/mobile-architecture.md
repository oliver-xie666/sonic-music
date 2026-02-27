# Sonic Music v0.0.3 - Mobile App 系统架构设计

> 版本：v0.0.3-dev
> 分支：v0.0.3-dev
> 状态：开发中（Phase 3 已完成，Phase 4 进行中）

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [当前状态](#2-当前状态)
3. [代码架构](#3-代码架构)
4. [UI 对齐流程](#4-ui-对齐流程)
5. [模块开发顺序](#5-模块开发顺序)
6. [关键架构决策](#6-关键架构决策)

---

## 1. 背景与目标

### 现状

| 模块 | 技术栈 | 状态 |
|---|---|---|
| `apps/electron` | Vue3 + Vite 7 + Pinia + Electron | ✅ 已完成 v0.0.2 |
| `apps/api` | Express + Kugou API（150+ 接口） | ✅ 已完成 |
| `apps/mobile` | UniApp Vue3 + 纯 JS + 原生 CSS | 🔄 v0.0.3 开发中 |
| `packages/shared` | 纯 JS utils/stores/composables | 🔄 基础已完成，持续扩充 |

### v0.0.3 目标

1. 开发 UniApp 移动端（H5 / iOS / Android / 微信小程序）
2. 提取公共 JS 逻辑到 `packages/shared`（utils/stores/composables，不含 CSS/组件）
3. Mobile UI 风格对齐 Electron，通过 Playwright 截图参考

---

## 2. 当前状态

### packages/shared（已完成）

```
packages/shared/src/
├── constants/index.js         # QUALITY_MAP、THEME_COLORS、DEFAULT_API_URL
├── utils/
│   ├── cover.js               # getCover(url, size)
│   ├── time.js                # formatMilliseconds(ms)、formatSeconds(s)
│   ├── lyrics.js              # parseLyrics(lrc)、getCurrentLineIndex(lyrics, time)
│   ├── quality.js             # getQuality(song, quality)
│   └── format.js              # formatPlayCount(count) → "1.2万"/"3.4亿"
├── stores/
│   ├── auth.js                # MoeAuthStore（登录态、用户信息）
│   ├── musicQueue.js          # useMusicQueueStore（播放队列）
│   └── settings.js            # useSettingsStore（apiBaseUrl、quality、theme）
└── composables/
    ├── usePlaybackMode.js     # 播放模式切换（顺序/随机/单曲循环）
    └── useQueue.js            # 队列操作（上一首/下一首）
```

### apps/mobile 页面状态

| 页面 | 文件 | 状态 |
|------|------|------|
| 首页 | pages/home/index.vue | ✅ 完成 |
| 搜索入口 | pages/search/index.vue | ✅ 完成 |
| 搜索结果 | pages/search/result.vue | ✅ 完成 |
| 发现 | pages/discover/index.vue | ✅ 完成 |
| 我的 | pages/library/index.vue | ✅ 完成 |
| 设置 | pages/settings/index.vue | ✅ 完成 |
| 全屏播放器 | pages/player/index.vue | ✅ 完成 |
| 歌单详情 | pages/playlist/detail.vue | ⬜ 待开发 |
| 排行榜 | pages/ranking/index.vue | ⬜ 待开发 |
| 登录 | pages/login/index.vue | ⬜ 待开发 |
| 歌手详情 | pages/artist/detail.vue | ⬜ 待开发 |

---

## 3. 代码架构

### Monorepo 结构

```
sonic-music/
├── apps/
│   ├── api/              # Express + Kugou API（不变）
│   ├── electron/         # Vue3 + Vite 7 + Pinia + Electron（不变）
│   └── mobile/           # UniApp Vue3（开发中）
├── packages/
│   └── shared/           # 共享 JS 逻辑（utils/stores/composables）
│                         # 注意：CSS/组件各平台自己维护，不放 shared
├── docs/architecture/
├── pnpm-workspace.yaml
└── package.json
```

### apps/mobile 完整目录

```
apps/mobile/
├── index.html            # Vite 入口（必须在根目录）
├── vite.config.js
├── package.json
└── src/
    ├── App.vue           # 主题初始化 + MiniPlayer 挂载
    ├── main.js
    ├── manifest.json
    ├── pages.json        # 路由 + Tab Bar（首页/发现/搜索/我的）
    ├── uni.scss
    ├── api/
    │   ├── client.js     # uni.request 封装（get/post + baseURL 动态读取）
    │   ├── song.js
    │   ├── playlist.js
    │   ├── search.js
    │   ├── ranking.js
    │   └── user.js
    ├── components/
    │   ├── player/
    │   │   ├── MiniPlayer.vue      # fixed 定位，悬浮在 Tab Bar 上方
    │   │   ├── PlayerControls.vue
    │   │   └── ProgressSlider.vue
    │   └── common/                 # SongListItem、PlaylistCard 等
    ├── composables/
    │   ├── useAudioPlayer.js       # 音频播放核心
    │   └── useLyrics.js            # 歌词滚动
    ├── pages/（见上方状态表）
    ├── stores/
    │   └── player.js               # mobile 专用播放器状态
    └── utils/
        ├── storage.js
        └── theme.js                # applyTheme(theme)
```

### shared 与 mobile 的边界

| 放 shared | 放 mobile |
|-----------|-----------|
| 纯 JS 工具函数（cover/time/lyrics/format） | CSS 样式、组件 |
| 跨平台 Pinia stores（auth/settings/queue） | 平台专用 store（player.js） |
| 平台无关 composables（playbackMode/queue） | 音频播放 composable（useAudioPlayer） |
| 常量（QUALITY_MAP/THEME_COLORS） | API client（uni.request 专用） |

---

## 4. UI 对齐流程

每个新模块开发前，先截图 Electron 对应页面作为设计参考：

```bash
# 1. 启动服务
pnpm dev:api      # → http://127.0.0.1:6521
pnpm dev:mobile   # → http://localhost:5174/

# 2. 用 Playwright MCP 截图 Electron 页面
# 3. 分析设计语言（颜色/间距/组件）
# 4. 实现 Mobile 版本（rpx 单位 + CSS 变量）
```

截图优先级（按待开发顺序）：

| 优先级 | Electron 页面 | 对应 Mobile 页面 |
|--------|--------------|-----------------|
| 1 | PlaylistDetail | pages/playlist/detail.vue |
| 2 | Ranking | pages/ranking/index.vue |
| 3 | Login | pages/login/index.vue |
| 4 | Artist | pages/artist/detail.vue |

### 布局转换原则

```
Electron（侧边栏）              Mobile（底部导航）
┌──────────────────────┐       ┌──────────────────┐
│  Sidebar  │  Content │  →    │     Content      │
├───────────┴──────────┤       ├──────────────────┤
│     PlayerControl    │       │   MiniPlayer     │
└──────────────────────┘       ├──────────────────┤
                               │    Tab Bar       │
                               └──────────────────┘
```

---

## 5. 模块开发顺序

> 开发节奏：**一次一个模块，完成后 commit 再继续**

| 模块 | 状态 | 关键文件 |
|------|------|---------|
| 0. packages/shared 基础 | ✅ 完成 | utils/stores/composables |
| 1. mobile 脚手架 + API 层 | ✅ 完成 | api/client.js + api/*.js |
| 2. 播放器核心 | ✅ 完成 | stores/player + useAudioPlayer + MiniPlayer |
| 3. 主要页面 | ✅ 完成 | home/search/discover/library/settings/player |
| 4. 歌单详情页 | ⬜ 下一个 | pages/playlist/detail.vue |
| 5. 排行榜页 | ⬜ | pages/ranking/index.vue |
| 6. 登录页 | ⬜ | pages/login/index.vue |
| 7. 歌手详情页 | ⬜ | pages/artist/detail.vue |
| 8. 下载功能 | ⬜ | stores/download.js |

---

## 6. 关键架构决策

### 音频播放（平台差异）

```javascript
// composables/useAudioPlayer.js

// App 端 / 微信小程序：BackgroundAudioManager（支持后台播放）
// #ifdef APP-PLUS || MP-WEIXIN
const bgAudio = uni.getBackgroundAudioManager()
bgAudio.src = url  // 赋值即触发播放
// #endif

// H5 端：InnerAudioContext
// #ifdef H5
const innerAudio = uni.createInnerAudioContext()
innerAudio.src = url
innerAudio.play()
// #endif
```

### API 连接策略

| 场景 | 方案 |
|------|------|
| H5 开发（同机） | vite.config.js proxy 代理 `/api/*` → `127.0.0.1:6521` |
| App 真机调试 | Settings 页面输入局域网 IP，存入 `useSettingsStore.apiBaseUrl` |
| 生产环境 | `VITE_APP_API_URL` 环境变量 |

### MiniPlayer 定位

```css
.mini-player {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0; right: 0;
  z-index: 999;
}
```

### Vite 7 兼容问题

electron 使用 Vite 7（ESM-only），uni-h5-vite 依赖 Vite 5。解决方案：
- `.npmrc` 中 `hoist-pattern[]=!vite` 阻止 vite 提升
- 为 `@dcloudio/uni-h5-vite` 创建指向 Vite 5 的 junction（`pnpm install` 后需重建）
