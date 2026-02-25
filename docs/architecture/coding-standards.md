# Sonic Music Mobile - 代码编写规范

> 适用范围：`apps/mobile/` 所有代码
> 原则：与 `apps/electron/` 保持完全一致的技术栈和编码风格
> 技术栈：Vue3 `<script setup>` + 纯 JavaScript + 原生 CSS（scoped）+ CSS 变量

---

## 目录

1. [技术栈约定](#1-技术栈约定)
2. [文件命名规范](#2-文件命名规范)
3. [SFC 组件结构规范](#3-sfc-组件结构规范)
4. [Script 编写规范](#4-script-编写规范)
5. [Template 编写规范](#5-template-编写规范)
6. [Style 编写规范](#6-style-编写规范)
7. [状态管理规范（Pinia）](#7-状态管理规范pinia)
8. [API 调用规范](#8-api-调用规范)
9. [Composables 规范](#9-composables-规范)
10. [UniApp 条件编译规范](#10-uniapp-条件编译规范)
11. [UniApp API 使用规范](#11-uniapp-api-使用规范)
12. [路由导航规范](#12-路由导航规范)
13. [国际化规范](#13-国际化规范)
14. [错误处理规范](#14-错误处理规范)
15. [禁止事项](#15-禁止事项)

---

## 1. 技术栈约定

### ✅ 使用

| 技术 | 版本 | 说明 |
|---|---|---|
| Vue 3 Composition API | `<script setup>` | 与 Electron 完全一致 |
| 纯 JavaScript | ES2020+ | 不使用 TypeScript |
| 原生 CSS | scoped | 不使用 SCSS/LESS/UnoCSS |
| CSS 变量 | `var(--xxx)` | 主题系统 |
| Pinia | ^2.x | 状态管理，与 Electron 一致 |
| pinia-plugin-persistedstate | ^3.x | 持久化 |
| uView UI | 2.x | 移动端组件库 |
| uni-app API | - | 跨平台原生能力 |

### ❌ 禁止使用

- TypeScript（`.ts` 文件、类型注解、interface、enum）
- UnoCSS / Tailwind CSS / Windi CSS
- SCSS / LESS / Stylus
- Element Plus / Naive UI / Vant（已有 uView UI）
- axios（使用 `uni.request` 替代）
- `storeToRefs`（直接访问 store 属性，与 Electron 一致）

---

## 2. 文件命名规范

### 组件文件

```
PascalCase（大驼峰）
✅ MiniPlayer.vue
✅ SongListItem.vue
✅ PlaylistCard.vue
❌ mini-player.vue
❌ songListItem.vue
```

### 页面文件

```
index.vue（主页面统一用 index）
✅ pages/home/index.vue
✅ pages/search/result.vue
✅ pages/player/index.vue
```

### Composables 文件

```
camelCase，以 use 开头
✅ useAudioPlayer.js
✅ useLyrics.js
✅ usePlaybackMode.js
❌ AudioPlayer.js
❌ audio-player.js
```

### Store 文件

```
camelCase
✅ player.js
✅ musicQueue.js
✅ settings.js
```

### API 文件

```
camelCase，按业务模块命名
✅ song.js
✅ playlist.js
✅ client.js
```

### 工具函数文件

```
camelCase
✅ storage.js
✅ theme.js
✅ permission.js
```

---

## 3. SFC 组件结构规范

### 标准结构顺序：template → script → style

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 逻辑代码
</script>

<style scoped>
/* 样式 */
</style>
```

### 完整示例（SongListItem.vue）

```vue
<template>
  <view class="song-item" @click="handlePlay">
    <image class="song-cover" :src="getCoverUrl(song.img, 120)" mode="aspectFill" />
    <view class="song-info">
      <text class="song-name">{{ song.name }}</text>
      <text class="song-author">{{ song.author }}</text>
    </view>
    <view class="song-actions">
      <text class="song-duration">{{ formatTime(song.timeLength) }}</text>
      <view class="more-btn" @click.stop="showContextMenu">
        <text class="icon">⋯</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getCoverUrl, formatMilliseconds } from '@/utils/utils'

const props = defineProps({
  song: Object,
  index: Number
})

const emit = defineEmits(['play', 'menu'])

const formatTime = (ms) => {
  return formatMilliseconds(ms)
}

const handlePlay = () => {
  emit('play', props.song, props.index)
}

const showContextMenu = () => {
  emit('menu', props.song)
}
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--background-color);
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
  margin: 0 12px;
  overflow: hidden;
}

.song-name {
  font-size: 15px;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.song-author {
  font-size: 13px;
  color: var(--text-secondary, #999);
  margin-top: 4px;
  display: block;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.song-duration {
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.more-btn {
  padding: 4px 8px;
}
</style>
```

---

## 4. Script 编写规范

### 4.1 导入顺序

```javascript
<script setup>
// 1. Vue 核心
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 2. UniApp 生命周期（如需要）
import { onLoad, onShow, onHide, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'

// 3. 第三方库
import { useMusicQueueStore } from '@/stores/musicQueue'
import { MoeAuthStore } from '@/stores/auth'

// 4. 本地组件
import SongListItem from '@/components/common/SongListItem.vue'
import MiniPlayer from '@/components/player/MiniPlayer.vue'

// 5. API 函数
import { getRecommend } from '@/api/song'
import { getPlaylistDetail } from '@/api/playlist'

// 6. 工具函数
import { getCoverUrl, formatMilliseconds } from '@/utils/utils'
</script>
```

### 4.2 响应式数据声明

```javascript
// ✅ 使用 ref() 声明响应式数据
const songs = ref([])
const isLoading = ref(true)
const currentPage = ref(1)
const searchQuery = ref('')

// ✅ 使用 computed() 声明计算属性
const hasMore = computed(() => songs.value.length < total.value)
const isEmpty = computed(() => !isLoading.value && songs.value.length === 0)

// ❌ 不要用 reactive()（与 Electron 保持一致，统一用 ref）
```

### 4.3 Props 定义

```javascript
// ✅ 简单对象形式（与 Electron 一致）
const props = defineProps({
  song: Object,
  index: Number,
  isPlaying: Boolean,
  playlist: Array
})

// ✅ 访问方式
console.log(props.song.name)
```

### 4.4 Emits 定义

```javascript
// ✅ 数组形式
const emit = defineEmits(['play', 'pause', 'menu', 'like'])

// ✅ 触发方式
emit('play', song, index)
emit('menu', { song, event })
```

### 4.5 生命周期

```javascript
// Vue 生命周期（组件级）
onMounted(() => {
  loadData()
})

onUnmounted(() => {
  // 清理定时器、事件监听
  clearInterval(timer)
})

// UniApp 页面生命周期（页面级，在 pages/ 下使用）
onLoad((options) => {
  // options 是页面参数
  const { id } = options
  loadDetail(id)
})

onShow(() => {
  // 页面显示时触发（包括从其他页面返回）
})

onReachBottom(() => {
  // 上拉加载更多
  loadMore()
})

onPullDownRefresh(() => {
  // 下拉刷新
  refresh().then(() => {
    uni.stopPullDownRefresh()
  })
})
```

### 4.6 Watch 使用

```javascript
// ✅ 监听路由参数变化
watch(() => route.query.q, (newQuery) => {
  currentPage.value = 1
  searchQuery.value = newQuery
  performSearch()
})

// ✅ 监听 store 变化
watch(() => playerStore.currentSong, (newSong) => {
  if (newSong) updateMediaSession(newSong)
})
```

---

## 5. Template 编写规范

### 5.1 UniApp 标签替换

```vue
<!-- ❌ 不能用 HTML 标签 -->
<div class="container">
<span class="text">
<img src="..." />
<p>内容</p>

<!-- ✅ 必须用 UniApp 标签 -->
<view class="container">
<text class="text">
<image src="..." mode="aspectFill" />
<text>内容</text>
```

### 5.2 事件绑定

```vue
<!-- ✅ 使用 @ 简写 -->
@click="handleClick"
@click.stop="handleClick"
@change="handleChange"
@input="handleInput"
@touchstart="handleTouchStart"

<!-- ❌ 不用 v-on: 完整写法 -->
v-on:click="handleClick"
```

### 5.3 列表渲染

```vue
<!-- ✅ v-for 必须带 :key，优先用唯一 id -->
<view v-for="(song, index) in songs" :key="song.hash" class="song-item">

<!-- 没有唯一 id 时用 index -->
<view v-for="(item, index) in list" :key="index" class="item">
```

### 5.4 条件渲染

```vue
<!-- ✅ v-if / v-else -->
<view v-if="isLoading" class="skeleton">
<view v-else-if="isEmpty" class="empty-state">
<view v-else class="content">

<!-- ✅ v-show 用于频繁切换的元素 -->
<view v-show="showMiniPlayer" class="mini-player">
```

### 5.5 动态 class 和 style

```vue
<!-- ✅ 对象语法 -->
:class="{ active: isActive, disabled: isDisabled }"

<!-- ✅ 数组语法 -->
:class="['btn', isActive ? 'btn-active' : '']"

<!-- ✅ 动态 style -->
:style="{ color: primaryColor, fontSize: fontSize + 'px' }"
```

### 5.6 图片组件

```vue
<!-- ✅ 必须指定 mode -->
<image :src="getCoverUrl(song.img, 240)" mode="aspectFill" class="cover" />
<image :src="artist.img" mode="aspectFill" class="avatar" />

<!-- ✅ 加载失败兜底 -->
<image :src="coverUrl" mode="aspectFill" @error="onImageError" />
```

---

## 6. Style 编写规范

### 6.1 基本原则

```vue
<style scoped>
/* ✅ 所有组件样式必须加 scoped */
/* ✅ 使用 CSS 变量引用主题色 */
/* ✅ 使用 rpx 单位（UniApp 响应式单位，750rpx = 屏幕宽度） */
/* ❌ 不使用 px 作为布局单位（字体可用 px） */
/* ❌ 不使用 SCSS/LESS 语法 */
</style>
```

### 6.2 单位规范

```css
/* ✅ 布局尺寸用 rpx（自动适配不同屏幕） */
.cover {
  width: 96rpx;
  height: 96rpx;
  border-radius: 12rpx;
}

/* ✅ 字体大小用 rpx 或 px 均可 */
.title {
  font-size: 30rpx;   /* 约等于 15px */
  font-size: 15px;    /* 也可以 */
}

/* ✅ 间距用 rpx */
.item {
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}
```

### 6.3 CSS 变量使用

```css
/* ✅ 颜色必须使用 CSS 变量（支持主题切换） */
.container {
  background-color: var(--background-color);
  border-color: var(--border-color);
}

.title {
  color: var(--primary-color);
}

.subtitle {
  color: var(--text-secondary, #999);  /* 提供默认值 */
}

/* ✅ 可用的 CSS 变量（与 Electron 完全一致） */
/*
  --primary-color          主色
  --secondary-color        辅色
  --background-color       主背景
  --background-color-secondary  次背景
  --color-primary          深主色
  --color-primary-light    主色透明版
  --border-color           边框色
  --hover-color            悬停色
  --color-box-shadow       阴影色
*/
```

### 6.4 布局规范

```css
/* ✅ 使用 Flexbox 布局 */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ✅ 文字截断 */
.song-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ 安全区适配（iOS 刘海屏） */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}

.mini-player {
  bottom: calc(100rpx + env(safe-area-inset-bottom));
}
```

### 6.5 动画规范

```css
/* ✅ 使用 CSS transition 做简单动画 */
.btn {
  transition: opacity 0.2s ease;
}

/* ✅ 使用 @keyframes 做复杂动画 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl {
  animation: rotate 20s linear infinite;
  animation-play-state: paused;  /* 暂停时停止旋转 */
}

.vinyl.playing {
  animation-play-state: running;
}
```

---

## 7. 状态管理规范（Pinia）

### 7.1 Store 定义（与 Electron 完全一致）

```javascript
// stores/player.js
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null,
    playing: false,
    currentTime: 0,
    duration: 0,
    playbackMode: 0,  // 0=顺序 1=随机 2=单曲循环
    showMiniPlayer: false,
  }),
  actions: {
    setCurrentSong(song) {
      this.currentSong = song
      this.showMiniPlayer = true
    },
    setPlaying(val) {
      this.playing = val
    },
    updateProgress(currentTime, duration) {
      this.currentTime = currentTime
      this.duration = duration
    },
  },
  getters: {
    progress: (state) => {
      if (!state.duration) return 0
      return state.currentTime / state.duration
    },
    formattedCurrentTime: (state) => {
      return formatSeconds(state.currentTime)
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'sonic-player',
        storage: {
          getItem: (key) => uni.getStorageSync(key),
          setItem: (key, val) => uni.setStorageSync(key, val),
          removeItem: (key) => uni.removeStorageSync(key),
        },
        paths: ['currentSong', 'playbackMode'],
      },
    ],
  },
})
```

### 7.2 Store 使用（与 Electron 完全一致）

```javascript
<script setup>
import { usePlayerStore } from '@/stores/player'
import { useMusicQueueStore } from '@/stores/musicQueue'

// ✅ 直接实例化，不用 storeToRefs
const playerStore = usePlayerStore()
const queueStore = useMusicQueueStore()

// ✅ 直接访问属性
console.log(playerStore.currentSong)
console.log(playerStore.playing)

// ✅ 直接调用 action
playerStore.setCurrentSong(song)
queueStore.addSong(song)

// ✅ 在模板中直接使用
// <text>{{ playerStore.currentSong?.name }}</text>
// <view v-if="playerStore.playing">
</script>
```

### 7.3 持久化存储（Mobile 版）

```javascript
// ✅ Mobile 端使用 uni.getStorageSync 替代 localStorage
persist: {
  enabled: true,
  strategies: [
    {
      key: 'MusicQueue',
      storage: {
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, val) => uni.setStorageSync(key, val),
        removeItem: (key) => uni.removeStorageSync(key),
      },
      paths: ['queue'],
    },
  ],
},
```


## 8. API 调用规范

### 8.1 API client（uni.request 适配器）

```javascript
// api/client.js
import { MoeAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

function buildAuthHeader() {
  const auth = MoeAuthStore()
  if (!auth.UserInfo) return ''
  const parts = []
  if (auth.UserInfo.token) parts.push('token=' + encodeURIComponent(auth.UserInfo.token))
  if (auth.UserInfo.userid) parts.push('userid=' + encodeURIComponent(auth.UserInfo.userid))
  if (auth.UserInfo.dfid) parts.push('dfid=' + encodeURIComponent(auth.UserInfo.dfid))
  return parts.join(';')
}

export function request(url, method, data) {
  method = method || 'GET'
  data = data || {}
  return new Promise((resolve, reject) => {
    const settings = useSettingsStore()
    const baseUrl = settings.apiBaseUrl || import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:6521'
    const authHeader = buildAuthHeader()
    uni.request({
      url: baseUrl + url,
      method,
      data,
      header: Object.assign(
        { 'Content-Type': 'application/json' },
        authHeader ? { Authorization: authHeader } : {}
      ),
      success: (res) => resolve(res.data),
      fail: (err) => {
        console.error('[API Error]', url, err)
        reject(err)
      },
    })
  })
}

export const get = (url, params) => request(url, 'GET', params)
export const post = (url, data) => request(url, 'POST', data)
```

### 8.2 API 模块定义

```javascript
// api/song.js
import { get } from './client'

export const getRecommend = () => get('/everyday/recommend')

export const getSongUrl = (hash, quality) => get('/song/url', { hash, quality })

export const getSongPrivilege = (hash) => get('/song/privilege', { hash })
```

### 8.3 组件中调用 API（与 Electron 完全一致）

```javascript
const songs = ref([])
const isLoading = ref(true)

// async/await + 状态管理
const loadRecommend = async () => {
  isLoading.value = true
  const response = await getRecommend()
  if (response.status === 1) {
    songs.value = response.data.song_list
  }
  isLoading.value = false
}

// try/catch 处理可能失败的请求
const loadDetail = async (id) => {
  isLoading.value = true
  try {
    const response = await getPlaylistDetail({ id })
    if (response.status === 1) {
      playlist.value = response.data
    }
  } catch (error) {
    console.error('加载歌单失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}
```

### 8.4 响应状态检查

```javascript
// 统一检查 response.status === 1
const response = await getSongUrl(hash, quality)
if (response.status === 1) {
  const url = response.data.url
} else {
  uni.showToast({ title: response.error_msg || '获取失败', icon: 'none' })
}
```


## 9. Composables 规范

### 9.1 基本结构（与 Electron 一致）

```javascript
// composables/useAudioPlayer.js
import { ref } from 'vue'

export default function useAudioPlayer({ onSongEnd, onTimeUpdate }) {
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  const playSong = (song, url) => {
    // 平台差异在内部处理
  }

  const togglePlayPause = () => {
    if (playing.value) pause()
    else play()
  }

  const seek = (time) => { /* ... */ }

  const destroy = () => { /* 清理资源 */ }

  return { playing, currentTime, duration, playSong, togglePlayPause, seek, destroy }
}
```

### 9.2 Composable 使用

```javascript
import useAudioPlayer from '@/composables/useAudioPlayer'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const { playing, currentTime, duration, setupListeners, playSong, togglePlayPause, seek } =
  useAudioPlayer({
    onSongEnd: () => { playNext() },
    onTimeUpdate: (time, dur) => { playerStore.updateProgress(time, dur) },
  })

onMounted(() => { setupListeners() })
```


## 10. UniApp 条件编译规范

### 10.1 模板中的条件编译

```vue
<!-- 仅 App 显示 -->
<!-- #ifdef APP-PLUS -->
<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
<!-- #endif -->

<!-- 仅微信小程序显示 -->
<!-- #ifdef MP-WEIXIN -->
<view class="mp-header">微信小程序专属</view>
<!-- #endif -->

<!-- 排除微信小程序 -->
<!-- #ifndef MP-WEIXIN -->
<view class="download-btn">下载</view>
<!-- #endif -->
```

### 10.2 Script 中的条件编译

```javascript
// #ifdef APP-PLUS
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const bgAudio = uni.getBackgroundAudioManager()
// #endif

// #ifdef H5
const innerAudio = uni.createInnerAudioContext()
// #endif
```

### 10.3 常用平台标识

| 标识 | 说明 |
|---|---|
| `APP-PLUS` | App（iOS + Android） |
| `H5` | H5/浏览器 |
| `MP-WEIXIN` | 微信小程序 |
| `MP` | 所有小程序 |


## 11. UniApp API 使用规范

### 11.1 导航

```javascript
// 跳转到普通页面
uni.navigateTo({ url: '/pages/playlist/detail?id=123' })

// 跳转到 Tab 页面（必须用 switchTab）
uni.switchTab({ url: '/pages/home/index' })

// 返回上一页
uni.navigateBack()

// 重定向（替换当前页）
uni.redirectTo({ url: '/pages/login/index' })
```

### 11.2 提示与反馈

```javascript
// Toast
uni.showToast({ title: '操作成功', icon: 'success', duration: 2000 })
uni.showToast({ title: '网络错误', icon: 'none' })

// Loading
uni.showLoading({ title: '加载中...' })
uni.hideLoading()

// 确认弹窗
uni.showModal({
  title: '提示',
  content: '确认删除？',
  success: (res) => {
    if (res.confirm) { /* 用户点击确认 */ }
  }
})
```

### 11.3 本地存储

```javascript
// 同步读写（推荐）
uni.setStorageSync('key', value)
const value = uni.getStorageSync('key')
uni.removeStorageSync('key')
```

### 11.4 网络请求

```javascript
// 统一通过 api/client.js 的 get/post 调用，不直接用 uni.request
import { get, post } from '@/api/client'
const data = await get('/search', { keywords: 'xxx' })
```


## 12. 路由导航规范

### 12.1 页面参数传递

```javascript
// 传递参数
uni.navigateTo({ url: '/pages/playlist/detail?id=' + playlist.listId })

// 接收参数（onLoad）
onLoad((options) => {
  const id = options.id
  loadDetail(id)
})
```

### 12.2 复杂数据通过 Store 传递

```javascript
// 发送方：存入 store，再跳转
navStore.setCurrentPlaylist(playlist)
uni.navigateTo({ url: '/pages/playlist/detail' })

// 接收方：从 store 取
const playlist = navStore.currentPlaylist
```

### 12.3 Tab 页面导航

```javascript
// Tab 页面必须用 switchTab，不能用 navigateTo
uni.switchTab({ url: '/pages/home/index' })
```

---

## 13. 国际化规范

```javascript
// script 中
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const title = t('shou-ye')
```

```vue
<!-- template 中 -->
<text>{{ $t('shou-ye') }}</text>
```

**翻译 key 命名**：与 Electron 保持一致，使用拼音 key（如 `shou-ye`、`fa-xian`、`sou-suo`）

---

## 14. 错误处理规范

```javascript
// 标准错误处理模式
const loadData = async () => {
  isLoading.value = true
  try {
    const response = await getSongUrl(hash, quality)
    if (response.status === 1) {
      url.value = response.data.url
    } else {
      uni.showToast({ title: response.error_msg || '获取失败', icon: 'none' })
    }
  } catch (error) {
    console.error('[loadData]', error)
    uni.showToast({ title: '网络错误，请检查连接', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}
```

```vue
<!-- 图片加载失败兜底 -->
<image :src="coverUrl" mode="aspectFill" @error="onCoverError" />

<script setup>
const coverUrl = ref(props.song.img)
const onCoverError = () => {
  coverUrl.value = '/static/images/default-cover.png'
}
</script>
```

---

## 15. 禁止事项

### 技术层面

```
❌ 不使用 TypeScript（.ts 文件、类型注解、interface、enum）
❌ 不使用 UnoCSS / Tailwind / Windi CSS
❌ 不使用 SCSS / LESS / Stylus
❌ 不使用 axios（用 uni.request 封装的 client）
❌ 不使用 localStorage（用 uni.getStorageSync）
❌ 不使用 document / window（H5 以外不可用）
❌ 不使用 HTML 标签（div/span/img/p，用 view/text/image）
❌ 不使用 storeToRefs（直接访问 store 属性）
```

### 代码质量

```
❌ 不在 template 中写复杂逻辑（提取到 computed）
❌ 不硬编码颜色值（必须用 CSS 变量）
❌ 不硬编码 API 地址（通过 client.js 统一管理）
❌ 不忽略 API 错误（必须有 try/catch 或状态检查）
❌ 不在 v-for 中省略 :key
```

### UniApp 特有

```
❌ Tab 页面不用 navigateTo（必须用 switchTab）
❌ 不在非 H5 平台使用 window/document
❌ 不忽略安全区适配（iOS 刘海屏 env(safe-area-inset-bottom)）
```

---

## 附录：快速参考

### CSS 变量速查

```css
var(--primary-color)               /* 主色 */
var(--secondary-color)             /* 辅色 */
var(--background-color)            /* 主背景 */
var(--background-color-secondary)  /* 次背景 */
var(--color-primary)               /* 深主色 */
var(--color-primary-light)         /* 主色透明 */
var(--border-color)                /* 边框 */
var(--hover-color)                 /* 悬停 */
var(--color-box-shadow)            /* 阴影 */
```

### 常用 rpx 换算

```
750rpx = 100vw（屏幕宽度）
32rpx  ≈ 16px（标准间距）
28rpx  ≈ 14px（小字体）
30rpx  ≈ 15px（正文字体）
36rpx  ≈ 18px（标题字体）
```

### 生命周期速查

```javascript
// 组件生命周期
onMounted()     // 挂载后
onUnmounted()   // 卸载前

// 页面生命周期（pages/ 下）
onLoad()              // 页面加载（有参数）
onShow()              // 页面显示（含返回）
onHide()              // 页面隐藏
onUnload()            // 页面卸载
onPullDownRefresh()   // 下拉刷新
onReachBottom()       // 上拉到底
onPageScroll()        // 页面滚动
```
