# Sonic Music v0.0.3 - Mobile App 系统架构设计

> 版本：v0.0.3-dev
> 分支：v0.0.3-dev
> 状态：设计阶段

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [产品设计部分](#2-产品设计部分)
3. [代码架构部分](#3-代码架构部分)
4. [其他配置部分](#4-其他配置部分)
5. [实施顺序](#5-实施顺序)
6. [验证方式](#6-验证方式)

---

## 1. 背景与目标

### 现状

| 模块 | 技术栈 | 状态 |
|---|---|---|
| `apps/electron` | Vue3 + Vite + Pinia + Electron | ✅ 已完成 v0.0.2 |
| `apps/api` | Express + Kugou API（150+ 接口） | ✅ 已完成 |
| `apps/mobile` | - | ❌ 仅有 README |
| `packages/shared` | - | ❌ 空目录 |
| `packages/ui` | - | ❌ 空目录 |
| `packages/api` | - | ❌ 空目录 |

### v0.0.3 目标

1. 开发 UniApp 移动端（iOS / Android / H5 / 微信小程序）
2. 提取公共代码到 `packages/shared`，实现 Electron 与 Mobile 共享类型、状态、工具函数
3. 建立完整的移动端开发工作流（设计 → 开发 → 构建 → 发布）

---

## 2. 产品设计部分

### 2.1 UI/UX 设计工作流

**工具链**：Playwright MCP → 截图 Electron 桌面端 → 分析设计语言 → 输出 UniApp + uView UI 移动端代码

**截图优先级**（按页面重要性排序）：

| 优先级 | Electron 页面 | 对应移动端 |
|---|---|---|
| 1 | PlayerControl（底部播放栏） | MiniPlayer + 全屏播放器 |
| 2 | Home（首页推荐） | 首页 |
| 3 | PlaylistDetail（歌单详情） | 歌单/专辑/排行榜详情 |
| 4 | Search（搜索） | 搜索页 |
| 5 | Lyrics（全屏歌词） | 全屏播放器歌词区 |
| 6 | Library（我的音乐） | 我的页面 |
| 7 | Settings（设置） | 设置页 |

**Playwright 截图命令示例**：

```javascript
// 先启动 Electron web 模式：pnpm dev:web
await page.goto('http://localhost:8080')
await page.screenshot({ path: 'docs/design/screenshots/home.png', fullPage: true })

await page.goto('http://localhost:8080/#/search')
await page.screenshot({ path: 'docs/design/screenshots/search.png' })

// 点击歌曲触发播放器
await page.click('.song-item:first-child')
await page.waitForTimeout(500)
await page.screenshot({ path: 'docs/design/screenshots/player-bar.png' })
```

### 2.2 布局转换原则

```
Electron（侧边栏布局）              Mobile（底部导航布局）
┌──────────────────────┐            ┌──────────────────┐
│  Sidebar  │  Content │     →      │     Content      │
│  (46px)   │          │            │                  │
│           │          │            ├──────────────────┤
├───────────┴──────────┤            │   MiniPlayer     │
│     PlayerControl    │            ├──────────────────┤
└──────────────────────┘            │    Tab Bar       │
                                    └──────────────────┘
```

### 2.3 设计 Token 映射

Electron CSS 变量 → `apps/mobile/uni.scss` SCSS 变量：

```scss
// apps/mobile/uni.scss
// 默认 Pink 主题（与 Electron 保持一致）
$primary-color: #FF69B4;
$secondary-color: #FFB6C1;
$bg-color: #FFF0F5;
$bg-color-secondary: #FFE6F0;
$color-primary: #ea33e4;
$border-color: #FFD9E6;
$hover-color: #FFE9F2;
$text-primary: #333333;
$text-secondary: #999999;
$tab-bar-height: 50px;
$mini-player-height: 60px;
```

**4 套主题色**（与 Electron 完全一致）：

| 主题 | Primary | Secondary | Background |
|---|---|---|---|
| Pink（默认） | #FF69B4 | #FFB6C1 | #FFF0F5 |
| Blue | #4A90E2 | #AEDFF7 | #E8F4FA |
| Green | #34C759 | #A7F3D0 | #E5F9F0 |
| Orange | #ff6b6b | #FFB6C1 | #FFF0F5 |

### 2.4 uView UI 组件映射

| Electron 自定义组件 | uView 2.x 组件 | 备注 |
|---|---|---|
| 自定义进度条 | `u-slider` | 播放进度、音量 |
| 自定义 Modal | `u-modal` | 确认弹窗 |
| Toast/Message | `u-toast` | 操作反馈 |
| 歌曲列表行 | 自定义 `SongListItem.vue` | 需要滑动操作 |
| 搜索类型 Tab | `u-tabs` | 歌曲/专辑/歌手/歌单 |
| 下拉刷新 | `u-refresh` | 首页、歌单 |
| 加载更多 | `u-loadmore` | 搜索结果、歌单 |
| 骨架屏 | `u-skeleton` | 加载状态 |
| 滑动操作 | `u-swipe-action` | 歌曲列表删除/收藏 |
| 底部抽屉（队列） | `u-popup mode="bottom"` | 播放队列 |
| 设置开关 | `u-switch` | 设置页 |
| 设置单选 | `u-radio-group` | 音质、主题选择 |
| 搜索输入框 | `u-search` | 搜索页 |
| 头像/封面 | `u-avatar` | 歌手头像 |

### 2.5 页面规划（4 Tab + 子页面）

**Tab Bar**：首页 / 发现 / 搜索 / 我的

**完整页面列表**：

```
pages/
├── home/index          首页：每日推荐 + 歌单网格 + 轮播
├── discover/index      发现：分类 + 新碟上架 + 热门歌手
├── search/
│   ├── index           搜索入口（热搜词 + 历史记录）
│   └── result          搜索结果（歌曲/专辑/歌手/歌单 Tab）
├── ranking/
│   ├── index           排行榜列表
│   └── detail          排行榜详情（歌曲列表）
├── library/index       我的音乐（需登录）：歌单/收藏/下载
├── playlist/detail     歌单详情（通用：歌单/专辑/排行榜）
├── artist/detail       歌手详情（歌曲/专辑/MV）
├── album/detail        专辑详情
├── player/index        全屏播放器（自定义导航栏）
├── login/index         登录页
└── settings/index      设置（主题/音质/语言/服务器地址）
```

---

## 3. 代码架构部分

### 3.1 Monorepo 整体结构

```
sonic-music/
├── apps/
│   ├── api/              # 不变（Express + Kugou API，150+ 接口）
│   ├── electron/         # 不变（Vue3 + Vite + Pinia + Electron）
│   └── mobile/           # 新增（UniApp Vue3 + TypeScript）
├── packages/
│   ├── shared/           # 新增：共享类型 + 工具函数 + Pinia stores
│   ├── ui/               # 暂缓（UI 组件差异大，后续再提取）
│   └── api/              # 暂缓（HTTP 客户端差异大，各自实现）
├── docs/
│   └── architecture/     # 架构文档
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 3.2 packages/shared 结构

```
packages/shared/
├── package.json          # name: @sonic-music/shared
├── tsconfig.json
└── src/
    ├── types/
    │   ├── song.ts       # Song, QueueItem, Album, Artist, Playlist
    │   ├── player.ts     # PlaybackMode enum, PlayerState
    │   ├── settings.ts   # AppSettings, ThemeColor, AudioQuality
    │   ├── search.ts     # SearchType enum, SearchResult<T>
    │   └── user.ts       # UserInfo
    ├── constants/
    │   └── index.ts      # QUALITY_MAP, THEME_COLORS, DEFAULT_API_URL
    ├── utils/
    │   ├── cover.ts      # getCoverUrl(url, size)
    │   ├── quality.ts    # getQualityHash(song, quality)
    │   ├── time.ts       # formatMilliseconds(), formatSeconds()
    │   └── lyrics.ts     # parseLyrics(), getCurrentLineIndex()
    ├── stores/
    │   ├── auth.ts       # MoeAuthStore
    │   ├── musicQueue.ts # useMusicQueueStore
    │   └── settings.ts   # useSettingsStore（新增 apiBaseUrl, quality）
    └── index.ts          # barrel export
```

**从 Electron 提取到 shared 的映射**：

| Electron 源文件 | 提取到 shared | 说明 |
|---|---|---|
| `stores/store.js` | `stores/auth.ts` | 去掉 axios 依赖，initDfid 改为注入 request 函数 |
| `stores/musicQueue.js` | `stores/musicQueue.ts` | 直接复用，无平台依赖 |
| `stores/settings.js` | `stores/settings.ts` | 新增 `apiBaseUrl`, `quality` 字段 |
| `utils/utils.js getCover()` | `utils/cover.ts` | 纯函数，无 DOM |
| `utils/utils.js getQuality()` | `utils/quality.ts` | 替换 localStorage 为参数传入 |
| `utils/utils.js formatMilliseconds()` | `utils/time.ts` | 纯函数 |
| `components/player/LyricsHandler.js parseLyrics()` | `utils/lyrics.ts` | 去掉 DOM 滚动逻辑 |

**保留在 Electron 的代码**（有平台依赖，不提取）：

| 文件 | 原因 |
|---|---|
| `AudioController.js` | 使用 `new Audio()` Web Audio API |
| `MediaSession.js` | 使用 `navigator.mediaSession` |
| `ProgressBar.js` | DOM 鼠标事件 |
| `Helpers.js` | Electron IPC |
| `stores/download.js` | 使用 `window.electronAPI` |


### 3.3 apps/mobile 目录结构

```
apps/mobile/
├── package.json
├── manifest.json         # UniApp 应用配置
├── pages.json            # 路由 + Tab Bar
├── uni.scss              # 全局 SCSS 变量（设计 Token）
├── App.vue               # 根组件：主题初始化 + MiniPlayer 挂载
├── main.ts
└── src/
    ├── pages/
    │   ├── home/index.vue
    │   ├── discover/index.vue
    │   ├── search/index.vue
    │   ├── search/result.vue
    │   ├── ranking/index.vue
    │   ├── ranking/detail.vue
    │   ├── library/index.vue
    │   ├── playlist/detail.vue
    │   ├── artist/detail.vue
    │   ├── album/detail.vue
    │   ├── player/index.vue      # 全屏播放器（navigationStyle: custom）
    │   ├── login/index.vue
    │   └── settings/index.vue
    ├── components/
    │   ├── player/
    │   │   ├── MiniPlayer.vue    # fixed 定位，悬浮在 Tab Bar 上方
    │   │   ├── PlayerControls.vue
    │   │   ├── ProgressSlider.vue
    │   │   ├── LyricsView.vue
    │   │   ├── QueueDrawer.vue   # u-popup mode="bottom"
    │   │   └── CoverVinyl.vue
    │   └── common/
    │       ├── SongListItem.vue
    │       ├── PlaylistCard.vue
    │       ├── ArtistCard.vue
    │       ├── AlbumCard.vue
    │       ├── SearchBar.vue
    │       ├── EmptyState.vue
    │       └── NavBar.vue
    ├── stores/
    │   ├── player.ts     # usePlayerStore（移动端专用）
    │   ├── download.ts   # useDownloadStore（uni.downloadFile）
    │   └── ui.ts         # useUIStore（MiniPlayer 可见性）
    ├── composables/
    │   ├── useAudioPlayer.ts
    │   ├── useLyrics.ts
    │   ├── usePlaybackMode.ts
    │   ├── useQueue.ts
    │   ├── useSearch.ts
    │   ├── usePullRefresh.ts
    │   └── useInfiniteScroll.ts
    ├── api/
    │   ├── client.ts     # uni.request 适配器 + 认证拦截器
    │   ├── song.ts
    │   ├── search.ts
    │   ├── playlist.ts
    │   ├── artist.ts
    │   ├── album.ts
    │   ├── user.ts
    │   ├── lyric.ts
    │   └── ranking.ts
    ├── utils/
    │   ├── storage.ts
    │   ├── theme.ts
    │   └── permission.ts
    └── static/
        ├── images/
        └── icons/        # Tab Bar 图标（8 张：4 Tab × active/inactive）
```

### 3.4 关键架构决策

#### 音频播放（核心差异）

```typescript
// apps/mobile/src/composables/useAudioPlayer.ts

// App 端 / 微信小程序：BackgroundAudioManager（支持后台播放、锁屏控制）
// #ifdef APP-PLUS || MP-WEIXIN
const bgAudio = uni.getBackgroundAudioManager()
bgAudio.title = song.name
bgAudio.singer = song.author
bgAudio.coverImgUrl = song.img
bgAudio.src = url  // 赋值即触发播放
// #endif

// H5 端：InnerAudioContext（浏览器限制，无后台播放）
// #ifdef H5
const innerAudio = uni.createInnerAudioContext()
innerAudio.src = url
innerAudio.play()
// #endif
```

#### API 连接策略

| 场景 | 方案 |
|---|---|
| H5 开发（同机） | `manifest.json` h5.devServer.proxy 代理 `/api/*` → `127.0.0.1:6521` |
| App 真机调试 | Settings 页面输入局域网 IP，存入 `useSettingsStore.apiBaseUrl` |
| 生产环境 | `VITE_APP_API_URL` 环境变量指向部署的 API 服务器 |

#### MiniPlayer 层级与定位

```scss
.mini-player {
  position: fixed;
  bottom: calc(#{$tab-bar-height} + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  z-index: 999;
  height: $mini-player-height; // 60px
}
```

### 3.5 Monorepo 集成

**root package.json 新增脚本**：

```json
{
  "dev:mobile": "pnpm --filter @sonic-music/mobile dev:h5",
  "build:mobile:h5": "pnpm --filter @sonic-music/mobile build:h5",
  "build:mobile:android": "pnpm --filter @sonic-music/mobile build:android",
  "build:mobile:ios": "pnpm --filter @sonic-music/mobile build:ios",
  "build:shared": "pnpm --filter @sonic-music/shared build"
}
```

**apps/mobile/package.json 核心依赖**：

```json
{
  "name": "@sonic-music/mobile",
  "dependencies": {
    "@sonic-music/shared": "workspace:*",
    "pinia": "^2.1.0",
    "pinia-plugin-persistedstate": "^3.2.0"
  }
}
```

---

## 4. 其他配置部分

### 4.1 CI/CD 扩展

新增 `.github/workflows/release-mobile.yml`：

| Job | Runner | 产物 |
|---|---|---|
| build-h5 | ubuntu-latest | 部署到 GitHub Pages（预览） |
| build-android | ubuntu-latest | APK → GitHub Release |
| build-ios | macos-latest | IPA → GitHub Release |

### 4.2 开发环境启动

```bash
# 终端 1：启动 API 服务
pnpm dev:api       # http://127.0.0.1:6521

# 终端 2：启动 Mobile H5
pnpm dev:mobile    # http://localhost:5174

# App 真机调试：用 HBuilderX 打开 apps/mobile，运行到模拟器或真机
```

### 4.3 代码规范

| 规范 | 说明 |
|---|---|
| **与 Electron 完全一致** | Vue3 `<script setup>` + 纯 JavaScript + 原生 CSS（scoped）+ CSS 变量 |
| **不使用 TypeScript** | 与 Electron 保持一致，plain JS |
| **不使用 UnoCSS/LESS/SCSS** | 原生 CSS + CSS 变量，与 Electron 一致 |
| ESLint + Prettier | 沿用已有配置 |
| 条件编译 | 平台差异用 `#ifdef` 处理，不用运行时 if/else |
| 详细规范 | 见 `docs/architecture/coding-standards.md` |

---

## 5. 实施顺序

> 详细的模块编写顺序与依赖关系见 `docs/architecture/development-order.md`

### Phase 1 - 基础设施

| 步骤 | 任务 | 产出文件 |
|---|---|---|
| 1.1 | 初始化 `packages/shared`（package.json + 目录结构） | `packages/shared/package.json` |
| 1.2 | 提取共享工具函数（cover / time / lyrics） | `packages/shared/src/utils/*.js` |
| 1.3 | 提取共享 Pinia stores（auth / musicQueue / settings） | `packages/shared/src/stores/*.js` |
| 1.4 | 提取共享常量（quality map / theme colors） | `packages/shared/src/constants/index.js` |
| 1.5 | 初始化 `apps/mobile`（UniApp Vue3 脚手架） | `apps/mobile/package.json` + `manifest.json` |
| 1.6 | 配置 `pages.json`（路由 + Tab Bar） | `apps/mobile/pages.json` |
| 1.7 | 配置 `uni.scss`（设计 Token） | `apps/mobile/uni.scss` |
| 1.8 | 实现 `api/client.js`（uni.request 适配器） | `apps/mobile/src/api/client.js` |
| 1.9 | 实现各 API 模块（song / search / playlist 等） | `apps/mobile/src/api/*.js` |
| 1.10 | 配置主题系统（App.vue + theme.js） | `apps/mobile/App.vue` |

### Phase 2 - 核心播放功能

| 步骤 | 任务 | 产出文件 |
|---|---|---|
| 2.1 | 实现 `useAudioPlayer.js`（BackgroundAudioManager + InnerAudioContext） | `composables/useAudioPlayer.js` |
| 2.2 | 实现 `usePlayerStore`（播放状态管理） | `stores/player.js` |
| 2.3 | 实现 `usePlaybackMode.js`（顺序/随机/单曲循环） | `composables/usePlaybackMode.js` |
| 2.4 | 实现 `useQueue.js`（队列导航逻辑） | `composables/useQueue.js` |
| 2.5 | 实现 `useLyrics.js`（歌词获取 + 解析） | `composables/useLyrics.js` |
| 2.6 | 开发全屏播放器页面 | `pages/player/index.vue` |
| 2.7 | 开发 `MiniPlayer.vue`（悬浮迷你播放器） | `components/player/MiniPlayer.vue` |
| 2.8 | 在 `App.vue` 挂载 MiniPlayer | `App.vue` |

### Phase 3 - 主要页面

| 步骤 | 任务 | 产出文件 |
|---|---|---|
| 3.1 | 截图 Electron 各页面（Playwright MCP） | `docs/design/screenshots/*.png` |
| 3.2 | 开发公共组件（SongListItem / PlaylistCard 等） | `components/common/*.vue` |
| 3.3 | 开发首页 | `pages/home/index.vue` |
| 3.4 | 开发搜索入口页 + 搜索结果页 | `pages/search/*.vue` |
| 3.5 | 开发歌单详情页 | `pages/playlist/detail.vue` |
| 3.6 | 开发我的音乐页 | `pages/library/index.vue` |
| 3.7 | 开发设置页（含服务器地址配置） | `pages/settings/index.vue` |

### Phase 4 - 完善

| 步骤 | 任务 | 产出文件 |
|---|---|---|
| 4.1 | 开发登录页 | `pages/login/index.vue` |
| 4.2 | 开发发现页 | `pages/discover/index.vue` |
| 4.3 | 开发歌手详情页 | `pages/artist/detail.vue` |
| 4.4 | 开发专辑详情页 | `pages/album/detail.vue` |
| 4.5 | 开发排行榜列表 + 详情页 | `pages/ranking/*.vue` |
| 4.6 | 实现下载功能（uni.downloadFile） | `stores/download.js` |
| 4.7 | 配置 CI/CD（GitHub Actions） | `.github/workflows/release-mobile.yml` |

---

## 6. 验证方式

```bash
# 验证 shared 包类型
pnpm build:shared

# 验证 mobile H5
pnpm dev:api & pnpm dev:mobile
# 浏览器打开 http://localhost:5174

# 验证 shared 类型在 Electron 中兼容
pnpm --filter @sonic-music/electron tsc --noEmit
```
