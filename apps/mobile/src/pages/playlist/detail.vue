<template>
  <view class="page">
    <!-- 头部信息骨架屏 -->
    <view v-if="loadingDetail" class="header skeleton-header">
      <view class="cover-wrap skeleton-box" />
      <view class="header-info">
        <view class="skeleton-line" style="width: 70%; height: 32rpx;" />
        <view class="skeleton-line" style="width: 50%; margin-top: 16rpx;" />
        <view class="skeleton-line" style="width: 80%; margin-top: 12rpx;" />
      </view>
    </view>

    <!-- 头部信息 -->
    <view v-else class="header">
      <image class="cover-wrap" :src="getCover(detail.pic || '', 300)" mode="aspectFill" />
      <view class="header-info">
        <text class="playlist-name">{{ detail.name }}</text>
        <text class="playlist-meta">{{ detail.list_create_username || '未知' }} · {{ detail.count || songs.length }} 首</text>
        <text v-if="detail.intro" class="playlist-intro" :class="{ expanded: introExpanded }" @click="introExpanded = !introExpanded">{{ detail.intro }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <view class="action-btn primary" @click="playAll">
        <text class="action-icon">▶</text>
        <text class="action-text">播放全部</text>
        <text v-if="songs.length" class="action-count">{{ songs.length }}</text>
      </view>
    </view>

    <!-- 歌曲列表骨架屏 -->
    <view v-if="loadingTracks && !songs.length" class="song-list">
      <view v-for="i in 10" :key="i" class="song-item skeleton">
        <view class="song-index skeleton-box-sm" />
        <view class="song-cover skeleton-box-sm" />
        <view class="song-info">
          <view class="skeleton-line" style="width: 65%;" />
          <view class="skeleton-line" style="width: 45%; margin-top: 8rpx;" />
        </view>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view v-else class="song-list">
      <view
        v-for="(song, idx) in songs"
        :key="song.hash"
        class="song-item"
        :class="{ playing: currentSong?.hash === song.hash }"
        @click="onPlay(song)"
      >
        <text class="song-index">{{ idx + 1 }}</text>
        <image class="song-cover" :src="getCover(song.cover || '', 120)" mode="aspectFill" />
        <view class="song-info">
          <text class="song-name">{{ song.songName || song.name }}</text>
          <text class="song-artist">{{ song.author }}</text>
        </view>
        <text class="song-duration">{{ formatMilliseconds(song.timelen) }}</text>
      </view>

      <view v-if="loadingTracks" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="!hasMore && songs.length" class="no-more">
        <text class="no-more-text">共 {{ songs.length }} 首</text>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getPlaylistDetail, getPlaylistTracks } from '@/api/playlist'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatMilliseconds } from '@sonic-music/shared/utils/time'

const playerStore = usePlayerStore()
const { loadAndPlay } = useAudioPlayer()

const currentSong = computed(() => playerStore.currentSong)

const detail = ref({})
const songs = ref([])
const page = ref(1)
const hasMore = ref(true)
const loadingDetail = ref(true)
const loadingTracks = ref(false)
const introExpanded = ref(false)
let playlistId = ''

// 解析 "歌手 - 歌名" 格式
function parseSong(raw) {
  const name = raw.name || ''
  const dashIdx = name.indexOf(' - ')
  if (dashIdx > -1) {
    return {
      ...raw,
      author: name.slice(0, dashIdx),
      songName: name.slice(dashIdx + 3),
    }
  }
  return { ...raw, author: '', songName: name }
}

async function fetchDetail(id) {
  loadingDetail.value = true
  try {
    const res = await getPlaylistDetail({ ids: id })
    const info = res.data?.[0] || res.data || res.info || {}
    detail.value = info
  } catch (e) {
    console.error('[playlist/detail] fetchDetail error', e)
  } finally {
    loadingDetail.value = false
  }
}

async function fetchTracks(reset = false) {
  if (loadingTracks.value || (!hasMore.value && !reset)) return
  if (reset) {
    page.value = 1
    songs.value = []
    hasMore.value = true
  }
  loadingTracks.value = true
  try {
    const res = await getPlaylistTracks({ id: playlistId, page: page.value, pagesize: 30 })
    const list = (res.data?.songs || res.songs || res.list || []).map(parseSong)
    songs.value.push(...list)
    hasMore.value = list.length === 30
    page.value++
  } catch (e) {
    console.error('[playlist/detail] fetchTracks error', e)
  } finally {
    loadingTracks.value = false
  }
}

function onPlay(song) {
  loadAndPlay(song)
}

function playAll() {
  if (!songs.value.length) return
  loadAndPlay(songs.value[0])
}

onLoad((options) => {
  playlistId = options.id || ''
  if (!playlistId) return
  fetchDetail(playlistId)
  fetchTracks(true)
})

onReachBottom(() => {
  if (hasMore.value) fetchTracks()
})
</script>

<style scoped>
.page {
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.header {
  display: flex;
  gap: 24rpx;
  padding: 30rpx 30rpx 24rpx;
  background: #fff;
}
.cover-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.header-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.playlist-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  line-height: 1.4;
}
.playlist-meta {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 12rpx;
}
.playlist-intro {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary, #999);
  margin-top: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.playlist-intro.expanded {
  -webkit-line-clamp: unset;
  display: block;
}
.actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1rpx solid #f5f5f5;
  margin-bottom: 16rpx;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 40rpx;
  border-radius: 50rpx;
  background: #f5f5f5;
}
.action-btn.primary {
  background: var(--primary-color, #FF69B4);
  flex: 1;
  justify-content: center;
}
.action-icon {
  font-size: 24rpx;
  color: #fff;
}
.action-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}
.action-count {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}
.song-list {
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.song-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 12rpx;
  border-radius: 12rpx;
  background: #fff;
}
.song-item.playing {
  background: rgba(255, 105, 180, 0.06);
}
.song-index {
  width: 44rpx;
  font-size: 24rpx;
  color: #bbb;
  text-align: center;
  flex-shrink: 0;
}
.song-cover {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.song-info {
  flex: 1;
  overflow: hidden;
}
.song-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-artist {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.song-duration {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
}
.loading-more, .no-more {
  padding: 30rpx;
  text-align: center;
}
.loading-text, .no-more-text {
  font-size: 24rpx;
  color: #bbb;
}
/* 骨架屏 */
.skeleton-box {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-box-sm {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}
.skeleton-line {
  height: 24rpx;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
