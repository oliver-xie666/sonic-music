<template>
  <view class="page">
    <view class="result-header">
      <text class="keyword">{{ keyword }}</text>
      <text class="count" v-if="total">共 {{ total }} 首</text>
    </view>

    <view v-if="loading && !songs.length" class="song-list">
      <view v-for="i in 8" :key="i" class="song-item skeleton">
        <view class="song-cover skeleton-box" />
        <view class="song-info">
          <view class="skeleton-line" style="width: 60%;" />
          <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
        </view>
      </view>
    </view>

    <view v-else-if="!songs.length && !loading" class="empty">
      <text class="empty-text">没有找到相关歌曲</text>
    </view>

    <view v-else class="song-list">
      <view
        v-for="(song, idx) in songs"
        :key="song.hash"
        class="song-item"
        :class="{ playing: currentSong?.hash === song.hash }"
        @click="onPlay(song)"
      >
        <text class="index">{{ idx + 1 }}</text>
        <image class="song-cover" :src="getCover(song.cover || song.img || '', 120)" mode="aspectFill" />
        <view class="song-info">
          <text class="song-name">{{ song.filename || song.name }}</text>
          <text class="song-artist">{{ song.singername || song.author }}</text>
        </view>
        <text class="duration">{{ formatMilliseconds(song.timelen || song.timeLength) }}</text>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="!hasMore" class="no-more">
        <text class="no-more-text">没有更多了</text>
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
import { search } from '@/api/search'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatMilliseconds } from '@sonic-music/shared/utils/time'

const playerStore = usePlayerStore()
const { loadAndPlay } = useAudioPlayer()

const keyword = ref('')
const songs = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const hasMore = ref(true)
const currentSong = computed(() => playerStore.currentSong)

async function fetchResults(reset = false) {
  if (loading.value || (!hasMore.value && !reset)) return
  if (reset) {
    page.value = 1
    songs.value = []
    hasMore.value = true
  }
  loading.value = true
  try {
    const res = await search({ keyword: keyword.value, page: page.value, pagesize: 20 })
    const list = res.data?.lists || res.lists || res.list || []
    total.value = res.data?.total || res.total || 0
    songs.value.push(...list)
    hasMore.value = list.length === 20
    page.value++
  } catch (e) {
    console.error('[search/result] fetchResults error', e)
  } finally {
    loading.value = false
  }
}

function onPlay(song) {
  loadAndPlay(song)
}

onLoad((options) => {
  keyword.value = decodeURIComponent(options.keyword || '')
  if (keyword.value) fetchResults(true)
})

onReachBottom(() => {
  if (hasMore.value) fetchResults()
})
</script>

<style scoped>
.page {
  padding: 20rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.result-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  padding: 20rpx 0 30rpx;
}
.keyword {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary, #333);
}
.count {
  font-size: 24rpx;
  color: var(--text-secondary, #999);
}
.song-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.song-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 180, 0.05);
}
.song-item.playing {
  background: rgba(255, 105, 180, 0.06);
}
.index {
  width: 40rpx;
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
.duration {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
}
.empty {
  padding: 120rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 28rpx;
  color: #bbb;
}
.loading-more, .no-more {
  padding: 30rpx;
  text-align: center;
}
.loading-text, .no-more-text {
  font-size: 24rpx;
  color: #bbb;
}
.skeleton-box {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
