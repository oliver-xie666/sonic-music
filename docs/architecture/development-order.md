# Sonic Music Mobile - 模块开发顺序

> 版本：v0.0.3-dev
> 技术栈：Vue3 `<script setup>` + 纯 JavaScript + 原生 CSS（scoped）+ CSS 变量
> 目标：UniApp 移动端（H5 / iOS / Android / 微信小程序）
> 开发节奏：**一次一个模块，完成后 commit 再继续**

---

## 总体依赖关系

```
packages/shared（utils/stores/composables）
    ↓
apps/mobile/api/client.js（HTTP 客户端）
    ↓
apps/mobile/api/*.js（各业务 API 模块）
    ↓
apps/mobile/stores/player.js（播放器状态）
    ↓
apps/mobile/composables/（useAudioPlayer 等）
    ↓
apps/mobile/components/（MiniPlayer 等）
    ↓
apps/mobile/pages/（各页面）
```

---

## 模块 0 - packages/shared 基础 ✅

**状态**：已完成

**文件清单**：
```
packages/shared/src/
├── constants/index.js         # QUALITY_MAP、THEME_COLORS、DEFAULT_API_URL
├── utils/cover.js             # getCover(url, size)
├── utils/time.js              # formatMilliseconds、formatSeconds
├── utils/lyrics.js            # parseLyrics、getCurrentLineIndex
├── utils/quality.js           # getQuality(song, quality)
├── utils/format.js            # formatPlayCount(count)
├── stores/auth.js             # MoeAuthStore
├── stores/musicQueue.js       # useMusicQueueStore
├── stores/settings.js         # useSettingsStore
├── composables/usePlaybackMode.js
├── composables/useQueue.js
└── index.js                   # barrel export
```

---

## 模块 1 - mobile 脚手架 + API 层 ✅

**状态**：已完成

**文件清单**：
```
apps/mobile/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js
    ├── App.vue
    ├── manifest.json
    ├── pages.json
    ├── uni.scss
    ├── api/client.js
    ├── api/song.js
    ├── api/playlist.js
    ├── api/search.js
    ├── api/ranking.js
    ├── api/user.js
    └── utils/theme.js
```

---

## 模块 2 - 播放器核心 ✅

**状态**：已完成

**文件清单**：
```
apps/mobile/src/
├── stores/player.js
├── composables/useAudioPlayer.js
├── composables/useLyrics.js
├── components/player/MiniPlayer.vue
├── components/player/PlayerControls.vue
├── components/player/ProgressSlider.vue
└── pages/player/index.vue
```

**完成标准**：
- MiniPlayer 固定在 Tab Bar 上方
- 点击 MiniPlayer 进入全屏播放器
- 播放/暂停/上一首/下一首正常工作
- 进度条可拖动

---

## 模块 3 - 主要页面 ✅

**状态**：已完成

**文件清单**：
```
apps/mobile/src/pages/
├── home/index.vue
├── search/index.vue
├── search/result.vue
├── discover/index.vue
├── library/index.vue
└── settings/index.vue
```

---

## 模块 4 - 歌单详情页 ⬜

**状态**：待开发（下一个）

### 开发步骤

1. **截图参考**：用 Playwright 截图 Electron PlaylistDetail 页面
2. **分析设计**：封面布局、歌曲列表样式、播放全部按钮
3. **实现页面**

**文件清单**：
```
apps/mobile/src/pages/playlist/detail.vue
```

**接收参数**：`?id=xxx`（歌单 ID）

**功能要求**：
- 顶部：封面图 + 歌单名 + 歌曲数量
- "播放全部"按钮 → 加载全部歌曲到队列并播放
- 歌曲列表（支持上拉加载更多）
- 点击歌曲 → 播放并加入队列
- 骨架屏加载状态

**API**：
```javascript
import { getPlaylistDetail, getPlaylistSongs } from '@/api/playlist'
```

**完成标准**：
- 歌单封面、名称、歌曲数正确显示
- 歌曲列表可滚动加载
- 播放全部功能正常
- commit 信息：`feat(mobile): 歌单详情页`

---

## 模块 5 - 排行榜页 ⬜

**状态**：待开发

### 开发步骤

1. **截图参考**：截图 Electron 排行榜相关页面
2. **实现页面**

**文件清单**：
```
apps/mobile/src/pages/ranking/index.vue
```

**功能要求**：
- 排行榜列表（热歌榜/飙升榜/新歌榜等）
- 点击排行榜 → 跳转歌单详情页（复用 playlist/detail.vue）

**API**：
```javascript
import { getRankingList } from '@/api/ranking'
```

**完成标准**：
- 排行榜列表正确显示
- 点击跳转到歌单详情页
- commit 信息：`feat(mobile): 排行榜页`

---

## 模块 6 - 登录页 ⬜

**状态**：待开发

**文件清单**：
```
apps/mobile/src/pages/login/index.vue
```

**功能要求**：
- 手机号 + 密码登录
- 登录成功 → 写入 MoeAuthStore → 返回上一页
- 错误提示

**API**：
```javascript
import { login } from '@/api/user'
```

**完成标准**：
- 登录成功后 library 页面显示用户信息
- commit 信息：`feat(mobile): 登录页`

---

## 模块 7 - 歌手详情页 ⬜

**状态**：待开发

**文件清单**：
```
apps/mobile/src/pages/artist/detail.vue
```

**功能要求**：
- 歌手头像 + 名称
- 热门歌曲列表
- 点击歌曲播放

**完成标准**：
- 歌手信息正确显示
- commit 信息：`feat(mobile): 歌手详情页`

---

## 模块 8 - 下载功能 ⬜

**状态**：待开发

**文件清单**：
```
apps/mobile/src/stores/download.js
```

**功能要求**：
- 使用 `uni.downloadFile` 下载音频
- 下载进度显示
- 已下载列表（持久化）

**完成标准**：
- 可下载歌曲到本地
- commit 信息：`feat(mobile): 下载功能`

---

## 文件创建速查

每次开发新模块前，确认以下顺序：

1. 查看 Electron 对应页面（Playwright 截图）
2. 确认需要的 API 接口（查看 apps/api/routes/）
3. 先写 API 模块（如果还没有）
4. 再写页面
5. 测试：`pnpm dev:mobile` + `pnpm dev:api`
6. commit：`feat(mobile): xxx`
