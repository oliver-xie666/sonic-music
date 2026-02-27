<template>
  <view class="page">
    <view class="header">
      <text class="title">Sonic Music</text>
      <view class="header-right" @click="goToSettings">
        <text class="settings-icon">⚙</text>
      </view>
    </view>

    <!-- 每日推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">每日推荐</text>
        <text class="section-more" @click="playAllRecommend">播放全部</text>
      </view>
      <view v-if="loadingRecommend" class="song-list">
        <view v-for="i in 4" :key="i" class="song-item skeleton">
          <view class="song-cover skeleton-box" />
          <view class="song-info">
            <view class="skeleton-line" style="width: 60%;" />
            <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
          </view>
        </view>
      </view>
      <view v-else class="song-list">
        <view
          v-for="(song, idx) in recommendSongs"
          :key="song.hash"
          class="song-item"
          :class="{ playing: currentSong?.hash === song.hash }"
          @click="onPlaySong(song)"
        >
          <view class="song-index">
            <text v-if="currentSong?.hash !== song.hash" class="index-num">{{ idx + 1 }}</text>
            <text v-else class="playing-dot">♫</text>
          </view>
          <image class="song-cover" :src="getCover(song.sizable_cover || song.cover || song.img || '', 120)" mode="aspectFill" />
          <view class="song-info">
            <text class="song-name">{{ song.filename || song.name }}</text>
            <text class="song-artist">{{ song.author_name || song.singername || song.author }}</text>
          </view>
          <text class="song-duration">{{ song.time_length ? formatSeconds(song.time_length) : formatMilliseconds(song.timelen) }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐歌单 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐歌单</text>
      </view>
      <view v-if="loadingPlaylists" class="playlist-grid">
        <view v-for="i in 4" :key="i" class="playlist-card skeleton">
          <view class="playlist-cover skeleton-box" />
          <view class="skeleton-line" style="margin: 12rpx 16rpx; width: 70%;" />
        </view>
      </view>
      <scroll-view v-else class="playlist-scroll" scroll-x>
        <view class="playlist-row">
          <view
            v-for="item in playlists"
            :key="item.global_collection_id || item.id"
            class="playlist-card"
            @click="goToPlaylist(item)"
          >
            <image class="playlist-cover" :src="getCover(item.flexible_cover || item.img || item.cover || '', 240)" mode="aspectFill" />
            <text class="playlist-name">{{ item.specialname || item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Sonic Radio -->
    <view class="section">
      <view class="section-header">
        <view class="radio-title-row">
          <text class="section-title">🎵 Sonic Radio</text>
          <text class="radio-subtitle">{{ radioModes[radioModeIndex].label }}</text>
        </view>
        <text class="section-more" @click="switchRadioMode">切换</text>
      </view>
      <view v-if="loadingRadio" class="song-list">
        <view v-for="i in 4" :key="i" class="song-item skeleton">
          <view class="song-cover skeleton-box" />
          <view class="song-info">
            <view class="skeleton-line" style="width: 60%;" />
            <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
          </view>
        </view>
      </view>
      <view v-else class="song-list">
        <view
          v-for="(song, idx) in radioSongs"
          :key="song.hash"
          class="song-item"
          :class="{ playing: currentSong?.hash === song.hash }"
          @click="onPlaySong(song)"
        >
          <view class="song-index">
            <text v-if="currentSong?.hash !== song.hash" class="index-num">{{ idx + 1 }}</text>
            <text v-else class="playing-dot">♫</text>
          </view>
          <image class="song-cover" :src="getCover(song.sizable_cover || '', 120)" mode="aspectFill" />
          <view class="song-info">
            <text class="song-name">{{ song.songname || song.filename }}</text>
            <text class="song-artist">{{ song.author_name }}</text>
          </view>
          <text class="song-duration">{{ formatSeconds(song.time_length) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部占位（MiniPlayer 高度） -->
    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getRecommend } from '@/api/song'
import { getPlaylistList } from '@/api/playlist'
import { getRadioSongs } from '@/api/radio'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatMilliseconds, formatSeconds } from '@sonic-music/shared/utils/time'

const playerStore = usePlayerStore()
const { loadAndPlay } = useAudioPlayer()

const currentSong = computed(() => playerStore.currentSong)
const recommendSongs = ref([])
const playlists = ref([])
const loadingRecommend = ref(true)
const loadingPlaylists = ref(true)

const radioModes = [
  { id: 1, label: '💖 私人推荐' },
  { id: 2, label: '🎶 经典老歌' },
  { id: 3, label: '🔥 热门歌曲' },
  { id: 4, label: '💎 小众珍藏' },
  { id: 6, label: '👑 VIP精选' },
]
const radioModeIndex = ref(0)
const radioSongs = ref([])
const loadingRadio = ref(true)

async function fetchRecommend() {
  loadingRecommend.value = true
  try {
    const res = await getRecommend()
    recommendSongs.value = (res.song_list || res.data?.song_list || []).slice(0, 10)
  } catch (e) {
    console.error('[home] fetchRecommend error', e)
  } finally {
    loadingRecommend.value = false
  }
}

async function fetchPlaylists() {
  loadingPlaylists.value = true
  try {
    const res = await getPlaylistList({ page: 1, pagesize: 8 })
    playlists.value = res.data?.special_list || res.data || res.list || []
  } catch (e) {
    console.error('[home] fetchPlaylists error', e)
  } finally {
    loadingPlaylists.value = false
  }
}

async function fetchRadio() {
  loadingRadio.value = true
  try {
    const mode = radioModes[radioModeIndex.value]
    const res = await getRadioSongs(mode.id)
    radioSongs.value = (res.song_list || res.data?.song_list || []).slice(0, 20)
  } catch (e) {
    console.error('[home] fetchRadio error', e)
  } finally {
    loadingRadio.value = false
  }
}

function switchRadioMode() {
  radioModeIndex.value = (radioModeIndex.value + 1) % radioModes.length
  fetchRadio()
}

function onPlaySong(song) {
  loadAndPlay(song)
}

function playAllRecommend() {
  if (!recommendSongs.value.length) return
  loadAndPlay(recommendSongs.value[0])
}

function goToPlaylist(item) {
  const id = item.global_collection_id || item.id || item.playlist_id
  uni.navigateTo({ url: `/pages/playlist/detail?id=${id}` })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

onLoad(() => {
  fetchRecommend()
  fetchPlaylists()
  fetchRadio()
})

onPullDownRefresh(async () => {
  await Promise.all([fetchRecommend(), fetchPlaylists(), fetchRadio()])
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.page {
  padding: 40rpx 30rpx 0;
  min-height: 100vh;
  background: var(--background-color, #FFF0F5);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50rpx;
}
.title {
  font-size: 52rpx;
  font-weight: 700;
  color: var(--text-primary, #333);
}
.settings-icon {
  font-size: 44rpx;
  color: var(--text-secondary, #999);
}
.section {
  margin-bottom: 50rpx;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
}
.section-more {
  font-size: 26rpx;
  color: var(--primary-color, #FF69B4);
}
.radio-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.radio-subtitle {
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
  gap: 20rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 2rpx 12rpx rgba(255, 105, 180, 0.06);
}
.song-item.playing {
  background: rgba(255, 105, 180, 0.06);
}
.song-index {
  width: 40rpx;
  text-align: center;
  flex-shrink: 0;
}
.index-num {
  font-size: 26rpx;
  color: var(--text-secondary, #999);
}
.playing-dot {
  font-size: 28rpx;
  color: var(--primary-color, #FF69B4);
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
.playlist-scroll {
  width: 100%;
}
.playlist-row {
  display: flex;
  gap: 20rpx;
  padding-bottom: 10rpx;
}
.playlist-card {
  flex-shrink: 0;
  width: 220rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.1);
}
.playlist-cover {
  width: 220rpx;
  height: 220rpx;
  background: #f5f5f5;
}
.playlist-name {
  display: block;
  font-size: 24rpx;
  color: var(--text-primary, #333);
  padding: 12rpx 14rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Skeleton */
.skeleton-box {
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
