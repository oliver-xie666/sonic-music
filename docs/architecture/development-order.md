# Sonic Music Mobile - 模块编写顺序与开发逻辑

> 适用版本：v0.0.3-dev
> 技术栈：Vue3 `<script setup>` + 纯 JavaScript + 原生 CSS（scoped）+ CSS 变量
> 目标：UniApp 移动端（H5 / iOS / Android / 微信小程序）

---

## 目录

1. [总体原则](#1-总体原则)
2. [依赖关系图](#2-依赖关系图)
3. [Phase 1 - 基础设施](#3-phase-1---基础设施)
4. [Phase 2 - 核心播放功能](#4-phase-2---核心播放功能)
5. [Phase 3 - 主要页面](#5-phase-3---主要页面)
6. [Phase 4 - 完善功能](#6-phase-4---完善功能)
7. [各模块详细说明](#7-各模块详细说明)
8. [文件创建顺序速查表](#8-文件创建顺序速查表)

---

## 1. 总体原则

### 为什么要按顺序编写

移动端项目各模块之间存在严格的依赖关系，必须按照"被依赖的先写"的原则：

```
packages/shared（工具函数 + stores）
    ↓ 被依赖
apps/mobile/api/client.js（HTTP 客户端）
    ↓ 被依赖
apps/mobile/api/*.js（各业务 API 模块）
    ↓ 被依赖
apps/mobile/stores/（状态管理）
    ↓ 被依赖
apps/mobile/composables/（业务逻辑）
    ↓ 被依赖
apps/mobile/components/（UI 组件）
    ↓ 被依赖
apps/mobile/pages/（页面）
```

### 核心约束

1. **shared 先于 mobile**：mobile 依赖 shared 的工具函数和 stores
2. **client 先于 API 模块**：所有 API 模块依赖 client.js 的 get/post 函数
3. **stores 先于 composables**：composables 读写 store 状态
4. **composables 先于 pages**：页面使用 composables 封装的业务逻辑
5. **公共组件先于页面**：页面引用公共组件（SongListItem、PlaylistCard 等）
6. **播放器先于其他页面**：MiniPlayer 挂载在 App.vue，所有页面都依赖它


---

## 2. 依赖关系图

```
sonic-music/
├── packages/
│   └── shared/                    ← 第一步：无任何依赖，纯函数和 store
│       ├── src/utils/cover.js     ← 从 electron/utils/utils.js 提取
│       ├── src/utils/time.js      ← 从 electron/utils/utils.js 提取
│       ├── src/utils/lyrics.js    ← 从 electron/components/player/LyricsHandler.js 提取
│       ├── src/utils/quality.js   ← 从 electron/utils/utils.js 提取
│       ├── src/constants/index.js ← QUALITY_MAP, THEME_COLORS
│       ├── src/stores/auth.js     ← 依赖 pinia（无平台 API）
│       ├── src/stores/musicQueue.js ← 依赖 pinia（无平台 API）
│       └── src/stores/settings.js ← 依赖 pinia（无平台 API）
│
└── apps/
    └── mobile/
        ├── manifest.json          ← 第二步：UniApp 配置（无代码依赖）
        ├── pages.json             ← 第二步：路由配置（无代码依赖）
        ├── uni.scss               ← 第二步：设计 Token（无代码依赖）
        ├── App.vue                ← 最后挂载 MiniPlayer（依赖 MiniPlayer）
        ├── main.js                ← 依赖 pinia、i18n
        │
        ├── api/
        │   ├── client.js          ← 第三步：依赖 stores/auth、stores/settings
        │   ├── song.js            ← 依赖 client.js
        │   ├── search.js          ← 依赖 client.js
        │   ├── playlist.js        ← 依赖 client.js
        │   ├── lyric.js           ← 依赖 client.js
        │   ├── artist.js          ← 依赖 client.js
        │   ├── album.js           ← 依赖 client.js
        │   ├── user.js            ← 依赖 client.js
        │   └── ranking.js         ← 依赖 client.js
        │
        ├── stores/
        │   ├── player.js          ← 第四步：依赖 shared/musicQueue（移动端专用播放状态）
        │   ├── ui.js              ← 第四步：依赖 pinia（MiniPlayer 可见性）
        │   └── download.js        ← Phase 4：依赖 pinia + uni.downloadFile
        │
        ├── composables/
        │   ├── useAudioPlayer.js  ← 第五步：依赖 stores/player（核心播放逻辑）
        │   ├── usePlaybackMode.js ← 第五步：依赖 stores/player
        │   ├── useQueue.js        ← 第五步：依赖 shared/musicQueue
        │   ├── useLyrics.js       ← 第五步：依赖 api/lyric + shared/utils/lyrics
        │   ├── useSearch.js       ← Phase 3：依赖 api/search
        │   ├── usePullRefresh.js  ← Phase 3：通用下拉刷新逻辑
        │   └── useInfiniteScroll.js ← Phase 3：通用上拉加载逻辑
        │
        ├── components/
        │   ├── player/
        │   │   ├── ProgressSlider.vue ← 第六步：依赖 stores/player（无其他组件依赖）
        │   │   ├── PlayerControls.vue ← 第六步：依赖 useAudioPlayer、usePlaybackMode
        │   │   ├── CoverVinyl.vue     ← 第六步：依赖 stores/player（封面旋转动画）
        │   │   ├── LyricsView.vue     ← 第六步：依赖 useLyrics
        │   │   ├── QueueDrawer.vue    ← 第六步：依赖 useQueue、SongListItem
        │   │   └── MiniPlayer.vue     ← 第六步：依赖所有 player 子组件
        │   └── common/
        │       ├── EmptyState.vue     ← Phase 3：无依赖（纯展示）
        │       ├── NavBar.vue         ← Phase 3：无依赖（纯展示）
        │       ├── SongListItem.vue   ← Phase 3：依赖 shared/utils/cover、time
        │       ├── PlaylistCard.vue   ← Phase 3：依赖 shared/utils/cover
        │       ├── ArtistCard.vue     ← Phase 3：依赖 shared/utils/cover
        │       ├── AlbumCard.vue      ← Phase 3：依赖 shared/utils/cover
        │       └── SearchBar.vue      ← Phase 3：无依赖（纯 UI）
        │
        └── pages/
            ├── player/index.vue       ← 第七步：依赖所有 player 组件
            ├── home/index.vue         ← Phase 3：依赖 api/song、PlaylistCard、SongListItem
            ├── search/index.vue       ← Phase 3：依赖 SearchBar
            ├── search/result.vue      ← Phase 3：依赖 useSearch、SongListItem
            ├── playlist/detail.vue    ← Phase 3：依赖 api/playlist、SongListItem
            ├── library/index.vue      ← Phase 3：依赖 api/user、PlaylistCard
            ├── settings/index.vue     ← Phase 3：依赖 shared/stores/settings
            ├── discover/index.vue     ← Phase 4：依赖 api/artist、AlbumCard
            ├── artist/detail.vue      ← Phase 4：依赖 api/artist、SongListItem
            ├── album/detail.vue       ← Phase 4：依赖 api/album、SongListItem
            ├── ranking/index.vue      ← Phase 4：依赖 api/ranking
            ├── ranking/detail.vue     ← Phase 4：依赖 api/ranking、SongListItem
            └── login/index.vue        ← Phase 4：依赖 api/user、shared/stores/auth
```


---

## 3. Phase 1 - 基础设施

> 目标：搭建整个项目的底层支撑，不涉及任何 UI 开发

### 3.1 初始化 packages/shared

**为什么先做 shared？**
shared 是纯 JavaScript 工具函数和 Pinia stores，不依赖任何平台 API（不用 `uni.*`、不用 `window.*`、不用 `document.*`）。mobile 和 electron 都会依赖它，所以必须最先建立。

**步骤：**

```
packages/shared/
├── package.json          ← 第一个文件，定义包名和导出
└── src/
    ├── utils/
    │   ├── cover.js      ← 从 electron/utils/utils.js 提取 getCoverUrl()
    │   ├── time.js       ← 从 electron/utils/utils.js 提取 formatMilliseconds()
    │   ├── quality.js    ← 从 electron/utils/utils.js 提取 getQualityHash()
    │   └── lyrics.js     ← 从 electron/components/player/LyricsHandler.js 提取 parseLyrics()
    ├── constants/
    │   └── index.js      ← QUALITY_MAP、THEME_COLORS、DEFAULT_API_URL
    ├── stores/
    │   ├── auth.js       ← 从 electron/stores/store.js 提取（去掉 axios 依赖）
    │   ├── musicQueue.js ← 从 electron/stores/musicQueue.js 直接复用
    │   └── settings.js   ← 从 electron/stores/settings.js 提取（新增 apiBaseUrl、quality）
    └── index.js          ← barrel export，统一导出所有内容
```

**提取规则：**
- 只提取纯函数（输入 → 输出，无副作用）
- stores 中去掉所有 `localStorage` 调用（由各平台自己实现持久化）
- `getQualityHash()` 原来读 `localStorage.getItem('quality')`，改为接收 `quality` 参数传入

**package.json 关键配置：**
```json
{
  "name": "@sonic-music/shared",
  "version": "0.0.3",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./utils/*": "./src/utils/*.js",
    "./stores/*": "./src/stores/*.js",
    "./constants": "./src/constants/index.js"
  }
}
```

---

### 3.2 初始化 apps/mobile 脚手架

**为什么在 shared 之后？**
mobile 的 `package.json` 需要声明对 `@sonic-music/shared` 的依赖，所以 shared 的 `package.json` 必须先存在。

**步骤：**

```
apps/mobile/
├── package.json          ← 声明依赖 @sonic-music/shared
├── manifest.json         ← UniApp 应用 ID、名称、权限配置
├── pages.json            ← 路由注册 + Tab Bar 配置
├── uni.scss              ← 全局设计 Token（CSS 变量 + SCSS 变量）
└── main.js               ← 入口：注册 pinia、i18n、uView UI
```

**pages.json 配置顺序（Tab Bar 4 个 + 子页面）：**
```json
{
  "pages": [
    { "path": "pages/home/index" },
    { "path": "pages/discover/index" },
    { "path": "pages/search/index" },
    { "path": "pages/library/index" },
    { "path": "pages/search/result" },
    { "path": "pages/playlist/detail" },
    { "path": "pages/player/index", "style": { "navigationStyle": "custom" } },
    { "path": "pages/settings/index" },
    { "path": "pages/login/index" }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/home/index", "text": "首页" },
      { "pagePath": "pages/discover/index", "text": "发现" },
      { "pagePath": "pages/search/index", "text": "搜索" },
      { "pagePath": "pages/library/index", "text": "我的" }
    ]
  }
}
```

**注意：** `pages/player/index` 必须设置 `navigationStyle: custom`，因为全屏播放器需要自定义导航栏。

---

### 3.3 实现 api/client.js

**为什么在脚手架之后？**
client.js 需要读取 `useSettingsStore().apiBaseUrl`（来自 shared）和 `MoeAuthStore().UserInfo`（来自 shared），所以 shared 必须先就绪。

**文件：** `apps/mobile/src/api/client.js`

**核心逻辑：**
1. 从 `useSettingsStore` 读取 `apiBaseUrl`（用户在设置页配置的服务器地址）
2. 从 `MoeAuthStore` 读取 `UserInfo`，构建 `Authorization` header
3. 用 `uni.request` 发起请求，返回 Promise
4. 导出 `get(url, params)` 和 `post(url, data)` 两个快捷方法

**H5 开发代理配置（manifest.json）：**
```json
{
  "h5": {
    "devServer": {
      "proxy": {
        "/api": {
          "target": "http://127.0.0.1:6521",
          "changeOrigin": true,
          "rewrite": "path => path.replace(/^\/api/, '')"
        }
      }
    }
  }
}
```

---

### 3.4 实现各 API 模块

**为什么在 client.js 之后？**
所有 API 模块都 `import { get, post } from './client'`，client.js 必须先存在。

**编写顺序（按 Phase 2/3 的使用顺序）：**

| 顺序 | 文件 | 原因 |
|---|---|---|
| 1 | `api/song.js` | Phase 2 播放器需要 `getSongUrl()` |
| 2 | `api/lyric.js` | Phase 2 歌词组件需要 `getLyric()` |
| 3 | `api/playlist.js` | Phase 3 首页和歌单详情需要 |
| 4 | `api/search.js` | Phase 3 搜索页需要 |
| 5 | `api/user.js` | Phase 3 我的页面需要 |
| 6 | `api/artist.js` | Phase 4 歌手详情需要 |
| 7 | `api/album.js` | Phase 4 专辑详情需要 |
| 8 | `api/ranking.js` | Phase 4 排行榜需要 |


---

## 4. Phase 2 - 核心播放功能

> 目标：实现完整的音频播放链路，这是整个 App 的核心功能

### 4.1 stores/player.js

**为什么先做 player store？**
`useAudioPlayer.js` composable 需要读写播放状态（currentSong、playing、currentTime 等），store 必须先定义好。

**文件：** `apps/mobile/src/stores/player.js`

**与 shared/stores/musicQueue.js 的关系：**
- `musicQueue` 管理播放队列（歌曲列表、当前索引）→ 来自 shared，两端共用
- `player` 管理播放状态（playing、currentTime、duration）→ mobile 专用，因为音频 API 不同

**stores/ui.js 同步创建：**
```javascript
// stores/ui.js - MiniPlayer 可见性、抽屉状态
export const useUIStore = defineStore('ui', {
  state: () => ({
    showMiniPlayer: false,   // 是否显示迷你播放器
    showQueueDrawer: false,  // 是否显示播放队列抽屉
  })
})
```

---

### 4.2 composables/useAudioPlayer.js

**为什么在 stores 之后？**
useAudioPlayer 需要调用 `playerStore.setPlaying()`、`playerStore.updateProgress()` 等 action，store 必须先存在。

**文件：** `apps/mobile/src/composables/useAudioPlayer.js`

**平台差异处理（条件编译）：**
```javascript
// App 端 / 微信小程序：后台播放 + 锁屏控制
// #ifdef APP-PLUS || MP-WEIXIN
let bgAudio = null
const initBgAudio = () => {
  bgAudio = uni.getBackgroundAudioManager()
  bgAudio.onPlay(() => { playerStore.setPlaying(true) })
  bgAudio.onPause(() => { playerStore.setPlaying(false) })
  bgAudio.onTimeUpdate(() => {
    playerStore.updateProgress(bgAudio.currentTime, bgAudio.duration)
  })
  bgAudio.onEnded(() => { onSongEnd && onSongEnd() })
}
// #endif

// H5 端：浏览器内播放（无后台播放）
// #ifdef H5
let innerAudio = null
const initInnerAudio = () => {
  innerAudio = uni.createInnerAudioContext()
  innerAudio.onPlay(() => { playerStore.setPlaying(true) })
  innerAudio.onPause(() => { playerStore.setPlaying(false) })
  innerAudio.onTimeUpdate(() => {
    playerStore.updateProgress(innerAudio.currentTime, innerAudio.duration)
  })
  innerAudio.onEnded(() => { onSongEnd && onSongEnd() })
}
// #endif
```

**返回的接口（与 Electron 的 AudioController 保持一致的命名）：**
```javascript
return {
  playSong,        // (song, url) => void
  togglePlayPause, // () => void
  seek,            // (time) => void
  destroy,         // () => void（页面卸载时调用）
}
```

---

### 4.3 composables/usePlaybackMode.js 和 useQueue.js

**为什么同步开发？**
这两个 composable 共同支撑"播放下一首"逻辑：
- `usePlaybackMode` 决定下一首的选取策略（顺序/随机/单曲循环）
- `useQueue` 执行实际的队列导航（获取下一首歌、触发播放）

**useQueue.js 核心逻辑：**
```javascript
const playNext = () => {
  const nextSong = usePlaybackMode().getNextSong()
  if (nextSong) {
    playSong(nextSong)
  }
}
```

---

### 4.4 composables/useLyrics.js

**为什么在 API 模块之后？**
useLyrics 需要调用 `api/lyric.js` 的 `getLyric()` 接口，lyric.js 必须先存在。

**文件：** `apps/mobile/src/composables/useLyrics.js`

**依赖链：**
```
useLyrics.js
  → api/lyric.js（获取歌词文本）
  → shared/utils/lyrics.js（parseLyrics 解析歌词格式）
  → stores/player.js（监听 currentTime 更新当前行）
```

---

### 4.5 player 组件（从叶子节点到根节点）

**为什么按这个顺序？**
组件之间有引用关系，被引用的组件必须先写。

```
第一批（无组件依赖，只依赖 store/composable）：
├── ProgressSlider.vue   ← 只依赖 stores/player（进度条）
├── CoverVinyl.vue       ← 只依赖 stores/player（封面旋转）
└── PlayerControls.vue   ← 依赖 useAudioPlayer、usePlaybackMode

第二批（依赖第一批组件）：
├── LyricsView.vue       ← 依赖 useLyrics（歌词滚动）
└── QueueDrawer.vue      ← 依赖 useQueue + SongListItem（需要先写 SongListItem）

第三批（依赖所有 player 子组件）：
└── MiniPlayer.vue       ← 依赖 PlayerControls、ProgressSlider、CoverVinyl
```

**注意：** `QueueDrawer.vue` 依赖 `SongListItem.vue`，但 SongListItem 属于 common 组件，应在 Phase 3 开始时先写 SongListItem，再回来完成 QueueDrawer。

---

### 4.6 pages/player/index.vue（全屏播放器）

**为什么在所有 player 组件之后？**
全屏播放器页面是所有 player 组件的组装容器，必须等所有子组件就绪。

**特殊配置：**
- `pages.json` 中该页面设置 `"navigationStyle": "custom"`（隐藏系统导航栏）
- 需要处理 iOS 状态栏高度：`uni.getSystemInfoSync().statusBarHeight`

---

### 4.7 App.vue 挂载 MiniPlayer

**为什么最后做？**
MiniPlayer 是全局悬浮组件，挂载在根组件 App.vue 中。必须等 MiniPlayer.vue 完成后才能挂载。

**App.vue 职责：**
1. 初始化主题（读取 `useSettingsStore().theme`，调用 `utils/theme.js` 的 `applyTheme()`）
2. 挂载 `<MiniPlayer />` 组件（全局悬浮，所有页面可见）
3. 监听 `playerStore.showMiniPlayer` 控制显示/隐藏


---

## 5. Phase 3 - 主要页面

> 目标：开发用户最常用的 4 个 Tab 页面及其子页面

### 5.1 公共组件（先于所有页面）

**为什么先写公共组件？**
首页、搜索结果、歌单详情等多个页面都会用到 `SongListItem`、`PlaylistCard` 等组件，必须先写好。

**编写顺序（从简单到复杂）：**

| 顺序 | 组件 | 依赖 | 说明 |
|---|---|---|---|
| 1 | `EmptyState.vue` | 无 | 纯展示，显示空状态图标和文字 |
| 2 | `NavBar.vue` | 无 | 自定义导航栏，返回按钮 + 标题 |
| 3 | `SongListItem.vue` | `shared/utils/cover`、`shared/utils/time` | 歌曲列表行，最常用组件 |
| 4 | `PlaylistCard.vue` | `shared/utils/cover` | 歌单卡片（封面 + 名称 + 播放数） |
| 5 | `ArtistCard.vue` | `shared/utils/cover` | 歌手卡片（头像 + 名称） |
| 6 | `AlbumCard.vue` | `shared/utils/cover` | 专辑卡片（封面 + 名称 + 歌手） |
| 7 | `SearchBar.vue` | 无 | 搜索输入框（封装 u-search） |

**SongListItem.vue 是最重要的公共组件**，几乎所有列表页都用它，需要支持：
- 显示封面、歌名、歌手、时长
- 点击触发播放（emit play 事件）
- 长按或点击更多按钮触发菜单（emit menu 事件）
- 高亮当前播放中的歌曲（通过 `playerStore.currentSong.hash` 对比）

---

### 5.2 截图 Electron 桌面端（UI 参考）

**为什么在写页面之前截图？**
移动端页面的 UI 设计参考桌面端，截图后可以分析设计语言（颜色、间距、组件布局），再转换为移动端适配的设计。

**截图命令（使用 Playwright MCP）：**
```javascript
// 先启动 Electron web 模式：pnpm dev:web
await page.goto('http://localhost:8080')
await page.screenshot({ path: 'docs/design/screenshots/home.png', fullPage: true })
await page.goto('http://localhost:8080/#/search')
await page.screenshot({ path: 'docs/design/screenshots/search.png' })
await page.click('.song-item:first-child')
await page.waitForTimeout(500)
await page.screenshot({ path: 'docs/design/screenshots/player-bar.png' })
```

**截图优先级：**
1. PlayerControl（底部播放栏）→ 对应 MiniPlayer
2. Home（首页推荐）→ 对应首页
3. PlaylistDetail（歌单详情）→ 对应歌单详情页
4. Search（搜索）→ 对应搜索页
5. Library（我的音乐）→ 对应我的页面
6. Settings（设置）→ 对应设置页

---

### 5.3 composables/useSearch.js 和 usePullRefresh.js

**为什么在页面之前写这两个 composable？**
搜索页和首页都需要这两个通用逻辑，提前封装好可以让页面代码更简洁。

**useSearch.js 核心逻辑：**
```javascript
// 防抖搜索 + 分页加载
const keyword = ref('')
const results = ref([])
const page = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)

const search = debounce(async () => {
  if (!keyword.value.trim()) return
  page.value = 1
  results.value = []
  await loadMore()
}, 300)

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true
  const res = await searchAPI({ keyword: keyword.value, page: page.value })
  if (res.status === 1) {
    results.value.push(...res.data.lists)
    hasMore.value = res.data.lists.length > 0
    page.value++
  }
  isLoading.value = false
}
```

---

### 5.4 页面编写顺序

**为什么按这个顺序？**
按照用户使用频率和功能依赖关系排序：

#### 5.4.1 pages/home/index.vue（首页）

**依赖：**
- `api/song.js` → `getRecommend()`（每日推荐）
- `api/playlist.js` → `getPlaylistList()`（歌单列表）
- `components/common/PlaylistCard.vue`
- `components/common/SongListItem.vue`

**页面结构：**
```
首页
├── 轮播图（u-swiper）
├── 每日推荐歌曲（横向滚动，SongListItem）
└── 推荐歌单（网格布局，PlaylistCard）
```

**下拉刷新：** 使用 `onPullDownRefresh` + `uni.stopPullDownRefresh()`

---

#### 5.4.2 pages/search/index.vue（搜索入口）

**依赖：**
- `components/common/SearchBar.vue`
- `uni.getStorageSync('search_history')`（搜索历史）

**页面结构：**
```
搜索入口
├── SearchBar（输入框）
├── 热搜词（从 api/search.js 获取）
└── 搜索历史（本地存储）
```

**跳转逻辑：** 输入关键词后跳转到 `pages/search/result?keyword=xxx`

---

#### 5.4.3 pages/search/result.vue（搜索结果）

**依赖：**
- `composables/useSearch.js`
- `api/search.js`
- `components/common/SongListItem.vue`
- `components/common/PlaylistCard.vue`
- `components/common/ArtistCard.vue`
- `components/common/AlbumCard.vue`

**页面结构：**
```
搜索结果
├── u-tabs（歌曲 / 专辑 / 歌手 / 歌单）
└── 对应 Tab 的列表（SongListItem / AlbumCard / ArtistCard / PlaylistCard）
```

**接收参数：** `onLoad((options) => { keyword.value = options.keyword })`

---

#### 5.4.4 pages/playlist/detail.vue（歌单详情）

**依赖：**
- `api/playlist.js` → `getPlaylistDetail()`、`getPlaylistTracks()`
- `components/common/SongListItem.vue`
- `components/common/NavBar.vue`

**页面结构：**
```
歌单详情
├── NavBar（返回 + 标题）
├── 歌单封面 + 信息（名称、创建者、描述）
├── 播放全部按钮
└── 歌曲列表（SongListItem，支持上拉加载更多）
```

**通用性：** 该页面同时用于歌单、专辑、排行榜详情（通过 `type` 参数区分）

---

#### 5.4.5 pages/library/index.vue（我的音乐）

**依赖：**
- `shared/stores/auth.js`（判断是否登录）
- `api/user.js` → `getUserPlaylists()`
- `components/common/PlaylistCard.vue`

**页面结构：**
```
我的音乐
├── 未登录：显示登录引导
└── 已登录：
    ├── 用户信息（头像、昵称）
    ├── 我创建的歌单
    └── 我收藏的歌单
```

---

#### 5.4.6 pages/settings/index.vue（设置）

**依赖：**
- `shared/stores/settings.js`（读写设置）
- `utils/theme.js`（切换主题）

**页面结构：**
```
设置
├── 服务器地址（输入框，存入 settingsStore.apiBaseUrl）
├── 音质选择（u-radio-group：标准/高品/无损）
├── 主题选择（4 个颜色块：Pink/Blue/Green/Orange）
└── 语言选择（u-radio-group：中文/English）
```

**服务器地址配置是移动端特有的**，因为真机无法访问 `127.0.0.1:6521`，需要用户手动输入局域网 IP。


---

## 6. Phase 4 - 完善功能

> 目标：补全次要页面和高级功能

### 6.1 pages/discover/index.vue（发现）

**依赖：**
- `api/artist.js` → `getHotArtists()`
- `api/album.js` → `getNewAlbums()`
- `components/common/ArtistCard.vue`
- `components/common/AlbumCard.vue`

**页面结构：**
```
发现
├── 分类标签（流行/摇滚/电子/民谣等）
├── 新碟上架（横向滚动，AlbumCard）
└── 热门歌手（网格布局，ArtistCard）
```

---

### 6.2 pages/artist/detail.vue（歌手详情）

**依赖：**
- `api/artist.js` → `getArtistDetail()`、`getArtistSongs()`、`getArtistAlbums()`
- `components/common/SongListItem.vue`
- `components/common/AlbumCard.vue`
- `components/common/NavBar.vue`

**页面结构：**
```
歌手详情
├── NavBar（返回 + 歌手名）
├── 歌手头像 + 简介
├── u-tabs（热门歌曲 / 专辑）
└── 对应 Tab 内容
```

---

### 6.3 pages/album/detail.vue（专辑详情）

**依赖：**
- `api/album.js` → `getAlbumDetail()`、`getAlbumSongs()`
- `components/common/SongListItem.vue`
- `components/common/NavBar.vue`

**复用 playlist/detail.vue 的结构**，通过 `type=album` 参数区分，或直接复用同一个页面。

---

### 6.4 pages/ranking/index.vue 和 ranking/detail.vue（排行榜）

**依赖：**
- `api/ranking.js` → `getRankingList()`、`getRankingDetail()`
- `components/common/SongListItem.vue`

**ranking/detail.vue 可复用 playlist/detail.vue**，通过 `type=ranking` 参数区分。

---

### 6.5 pages/login/index.vue（登录）

**依赖：**
- `api/user.js` → `login()`
- `shared/stores/auth.js`（存储登录信息）

**登录方式：** 与 Electron 保持一致（手机号 + 验证码，或账号密码）

**登录后跳转：** `uni.navigateBack()` 返回上一页，或 `uni.switchTab({ url: '/pages/library/index' })`

---

### 6.6 stores/download.js 和下载功能

**依赖：**
- `uni.downloadFile`（UniApp 原生下载 API）
- `uni.saveFile`（保存到本地）
- `api/song.js` → `getSongUrl()`（获取下载链接）

**与 Electron 的区别：**
- Electron 使用 `window.electronAPI.downloadSong()`（IPC 调用）
- Mobile 使用 `uni.downloadFile()` + `uni.saveFile()`

---

### 6.7 CI/CD 配置

**文件：** `.github/workflows/release-mobile.yml`

**三个 Job：**

| Job | Runner | 触发条件 | 产物 |
|---|---|---|---|
| build-h5 | ubuntu-latest | push to main | 部署到 GitHub Pages |
| build-android | ubuntu-latest | tag v*.*.* | APK → GitHub Release |
| build-ios | macos-latest | tag v*.*.* | IPA → GitHub Release |

**Android 构建需要：**
- Java 17
- Android SDK
- HBuilderX CLI 或 uni-app CLI


---

## 7. 各模块详细说明

### 7.1 packages/shared 各文件说明

#### src/utils/cover.js

**来源：** `apps/electron/src/utils/utils.js` 中的 `getCover()` 函数

**功能：** 将歌曲封面 URL 转换为指定尺寸的缩略图 URL

```javascript
// 原 Electron 代码（直接复用，无需修改）
export function getCoverUrl(url, size = 240) {
  if (!url) return ''
  return url.replace('{size}', size)
}
```

**使用场景：**
- `SongListItem.vue`：`getCoverUrl(song.img, 120)`（列表小图）
- `PlaylistCard.vue`：`getCoverUrl(playlist.img, 240)`（卡片中图）
- `pages/player/index.vue`：`getCoverUrl(song.img, 480)`（全屏大图）

---

#### src/utils/time.js

**来源：** `apps/electron/src/utils/utils.js` 中的 `formatMilliseconds()` 函数

```javascript
// 毫秒 → "mm:ss" 格式
export function formatMilliseconds(ms) {
  if (!ms) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 秒 → "mm:ss" 格式（播放器进度用）
export function formatSeconds(s) {
  if (!s) return '00:00'
  const minutes = Math.floor(s / 60)
  const seconds = Math.floor(s % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
```

---

#### src/utils/lyrics.js

**来源：** `apps/electron/src/components/player/LyricsHandler.js` 中的解析逻辑

**提取规则：** 只保留纯解析逻辑，去掉所有 DOM 操作（滚动、高亮 class 等）

```javascript
// 解析 LRC 格式歌词
export function parseLyrics(lrcText) {
  if (!lrcText) return []
  const lines = lrcText.split('\n')
  const result = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g
  lines.forEach(line => {
    let match
    while ((match = timeRegex.exec(line)) !== null) {
      const time = parseInt(match[1]) * 60 + parseFloat(match[2] + '.' + match[3])
      const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim()
      if (text) result.push({ time, text })
    }
  })
  return result.sort((a, b) => a.time - b.time)
}

// 根据当前播放时间获取当前歌词行索引
export function getCurrentLineIndex(lyrics, currentTime) {
  if (!lyrics.length) return -1
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) return i
  }
  return 0
}
```

---

#### src/utils/quality.js

**来源：** `apps/electron/src/utils/utils.js` 中的 `getQuality()` 函数

**关键改动：** 原版直接读 `localStorage.getItem('quality')`，改为接收 `quality` 参数

```javascript
// 原 Electron 版本（有 localStorage 依赖，不能放 shared）
// const quality = localStorage.getItem('quality') || 'standard'

// shared 版本（纯函数，quality 由调用方传入）
export function getQualityHash(song, quality) {
  const qualityMap = {
    standard: song.hash,
    high: song.hq_hash || song.hash,
    lossless: song.sq_hash || song.hq_hash || song.hash,
  }
  return qualityMap[quality] || song.hash
}
```

**调用方式（在 mobile 中）：**
```javascript
import { getQualityHash } from '@sonic-music/shared/utils/quality'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'

const settingsStore = useSettingsStore()
const hash = getQualityHash(song, settingsStore.quality)
```

---

#### src/constants/index.js

```javascript
export const QUALITY_MAP = {
  standard: '标准',
  high: '高品质',
  lossless: '无损',
}

export const THEME_COLORS = {
  pink: {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    background: '#FFF0F5',
    backgroundSecondary: '#FFE6F0',
    border: '#FFD9E6',
  },
  blue: {
    primary: '#4A90E2',
    secondary: '#AEDFF7',
    background: '#E8F4FA',
    backgroundSecondary: '#D0E8F5',
    border: '#B8D9F0',
  },
  green: {
    primary: '#34C759',
    secondary: '#A7F3D0',
    background: '#E5F9F0',
    backgroundSecondary: '#D0F5E5',
    border: '#B0EDD0',
  },
  orange: {
    primary: '#ff6b6b',
    secondary: '#FFB6C1',
    background: '#FFF0F5',
    backgroundSecondary: '#FFE6F0',
    border: '#FFD9E6',
  },
}

export const DEFAULT_API_URL = 'http://127.0.0.1:6521'
```

---

### 7.2 apps/mobile 关键文件说明

#### src/utils/theme.js

**功能：** 将主题色应用到 CSS 变量和 UniApp 导航栏

```javascript
import { THEME_COLORS } from '@sonic-music/shared/constants'

export function applyTheme(themeName) {
  const theme = THEME_COLORS[themeName] || THEME_COLORS.pink
  // 设置 CSS 变量（H5 和 App 都支持）
  const root = document.documentElement  // H5
  // #ifdef H5
  root.style.setProperty('--primary-color', theme.primary)
  root.style.setProperty('--secondary-color', theme.secondary)
  root.style.setProperty('--background-color', theme.background)
  root.style.setProperty('--background-color-secondary', theme.backgroundSecondary)
  root.style.setProperty('--border-color', theme.border)
  // #endif

  // App 端设置导航栏颜色
  // #ifdef APP-PLUS
  uni.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: theme.background,
  })
  // #endif
}
```

---

#### src/utils/storage.js

**功能：** 封装 `uni.getStorageSync`，提供与 `localStorage` 相似的 API

```javascript
export const storage = {
  get(key, defaultValue = null) {
    try {
      const val = uni.getStorageSync(key)
      return val !== '' ? val : defaultValue
    } catch {
      return defaultValue
    }
  },
  set(key, value) {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('[storage.set]', e)
    }
  },
  remove(key) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('[storage.remove]', e)
    }
  },
}
```


---

## 8. 文件创建顺序速查表

> 按照此顺序创建文件，可以保证每个文件在创建时其依赖都已就绪

### Phase 1 - 基础设施

| 序号 | 文件路径 | 说明 |
|---|---|---|
| 1 | `packages/shared/package.json` | shared 包定义 |
| 2 | `packages/shared/src/constants/index.js` | 常量（无依赖） |
| 3 | `packages/shared/src/utils/cover.js` | 封面 URL 工具 |
| 4 | `packages/shared/src/utils/time.js` | 时间格式化工具 |
| 5 | `packages/shared/src/utils/lyrics.js` | 歌词解析工具 |
| 6 | `packages/shared/src/utils/quality.js` | 音质 hash 工具 |
| 7 | `packages/shared/src/stores/settings.js` | 设置 store（新增 apiBaseUrl、quality） |
| 8 | `packages/shared/src/stores/auth.js` | 认证 store |
| 9 | `packages/shared/src/stores/musicQueue.js` | 播放队列 store |
| 10 | `packages/shared/src/index.js` | barrel export |
| 11 | `apps/mobile/package.json` | mobile 包定义（依赖 shared） |
| 12 | `apps/mobile/manifest.json` | UniApp 应用配置 |
| 13 | `apps/mobile/pages.json` | 路由 + Tab Bar |
| 14 | `apps/mobile/uni.scss` | 全局设计 Token |
| 15 | `apps/mobile/main.js` | 入口文件 |
| 16 | `apps/mobile/src/api/client.js` | HTTP 客户端（依赖 shared stores） |
| 17 | `apps/mobile/src/api/song.js` | 歌曲 API |
| 18 | `apps/mobile/src/api/lyric.js` | 歌词 API |
| 19 | `apps/mobile/src/api/playlist.js` | 歌单 API |
| 20 | `apps/mobile/src/api/search.js` | 搜索 API |
| 21 | `apps/mobile/src/api/user.js` | 用户 API |
| 22 | `apps/mobile/src/utils/storage.js` | 本地存储封装 |
| 23 | `apps/mobile/src/utils/theme.js` | 主题切换工具 |

### Phase 2 - 核心播放功能

| 序号 | 文件路径 | 说明 |
|---|---|---|
| 24 | `apps/mobile/src/stores/ui.js` | UI 状态 store |
| 25 | `apps/mobile/src/stores/player.js` | 播放状态 store |
| 26 | `apps/mobile/src/composables/useAudioPlayer.js` | 音频播放核心逻辑 |
| 27 | `apps/mobile/src/composables/usePlaybackMode.js` | 播放模式逻辑 |
| 28 | `apps/mobile/src/composables/useQueue.js` | 队列导航逻辑 |
| 29 | `apps/mobile/src/composables/useLyrics.js` | 歌词获取 + 解析 |
| 30 | `apps/mobile/src/components/player/ProgressSlider.vue` | 进度条组件 |
| 31 | `apps/mobile/src/components/player/CoverVinyl.vue` | 封面旋转组件 |
| 32 | `apps/mobile/src/components/player/PlayerControls.vue` | 播放控制按钮 |
| 33 | `apps/mobile/src/components/player/LyricsView.vue` | 歌词滚动组件 |
| 34 | `apps/mobile/src/components/player/QueueDrawer.vue` | 播放队列抽屉（依赖 SongListItem，先写骨架） |
| 35 | `apps/mobile/src/components/player/MiniPlayer.vue` | 迷你播放器 |
| 36 | `apps/mobile/src/pages/player/index.vue` | 全屏播放器页面 |
| 37 | `apps/mobile/App.vue` | 根组件（挂载 MiniPlayer） |

### Phase 3 - 主要页面

| 序号 | 文件路径 | 说明 |
|---|---|---|
| 38 | `apps/mobile/src/components/common/EmptyState.vue` | 空状态组件 |
| 39 | `apps/mobile/src/components/common/NavBar.vue` | 自定义导航栏 |
| 40 | `apps/mobile/src/components/common/SongListItem.vue` | 歌曲列表行（最重要） |
| 41 | `apps/mobile/src/components/common/PlaylistCard.vue` | 歌单卡片 |
| 42 | `apps/mobile/src/components/common/ArtistCard.vue` | 歌手卡片 |
| 43 | `apps/mobile/src/components/common/AlbumCard.vue` | 专辑卡片 |
| 44 | `apps/mobile/src/components/common/SearchBar.vue` | 搜索输入框 |
| 45 | `apps/mobile/src/components/player/QueueDrawer.vue` | 补全（现在 SongListItem 已就绪） |
| 46 | `apps/mobile/src/composables/useSearch.js` | 搜索逻辑 |
| 47 | `apps/mobile/src/composables/usePullRefresh.js` | 下拉刷新逻辑 |
| 48 | `apps/mobile/src/composables/useInfiniteScroll.js` | 上拉加载逻辑 |
| 49 | `apps/mobile/src/pages/home/index.vue` | 首页 |
| 50 | `apps/mobile/src/pages/search/index.vue` | 搜索入口页 |
| 51 | `apps/mobile/src/pages/search/result.vue` | 搜索结果页 |
| 52 | `apps/mobile/src/pages/playlist/detail.vue` | 歌单详情页 |
| 53 | `apps/mobile/src/pages/library/index.vue` | 我的音乐页 |
| 54 | `apps/mobile/src/pages/settings/index.vue` | 设置页 |

### Phase 4 - 完善功能

| 序号 | 文件路径 | 说明 |
|---|---|---|
| 55 | `apps/mobile/src/api/artist.js` | 歌手 API |
| 56 | `apps/mobile/src/api/album.js` | 专辑 API |
| 57 | `apps/mobile/src/api/ranking.js` | 排行榜 API |
| 58 | `apps/mobile/src/pages/login/index.vue` | 登录页 |
| 59 | `apps/mobile/src/pages/discover/index.vue` | 发现页 |
| 60 | `apps/mobile/src/pages/artist/detail.vue` | 歌手详情页 |
| 61 | `apps/mobile/src/pages/album/detail.vue` | 专辑详情页 |
| 62 | `apps/mobile/src/pages/ranking/index.vue` | 排行榜列表页 |
| 63 | `apps/mobile/src/pages/ranking/detail.vue` | 排行榜详情页 |
| 64 | `apps/mobile/src/stores/download.js` | 下载 store |
| 65 | `.github/workflows/release-mobile.yml` | CI/CD 配置 |

---

## 附录：Monorepo 根目录配置更新

在开始 Phase 1 之前，需要更新根目录的配置文件：

### pnpm-workspace.yaml

确认包含 `packages/*` 和 `apps/*`：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

新增 mobile 相关任务：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev:h5": {
      "dependsOn": ["^build"],
      "persistent": true
    }
  }
}
```

### 根 package.json 新增脚本

```json
{
  "scripts": {
    "dev:mobile": "pnpm --filter @sonic-music/mobile dev:h5",
    "build:mobile:h5": "pnpm --filter @sonic-music/mobile build:h5",
    "build:shared": "pnpm --filter @sonic-music/shared build"
  }
}
```
