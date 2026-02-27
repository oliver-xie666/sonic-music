<template>
  <view class="page">
    <!-- 头部骨架屏 -->
    <view v-if="loadingInfo" class="header skeleton-header">
      <view class="artist-avatar skeleton-box" />
      <view class="header-info">
        <view class="skeleton-line" style="width: 50%; height: 36rpx;" />
        <view class="skeleton-line" style="width: 70%; margin-top: 12rpx;" />
      </view>
    </view>

    <!-- 头部信息 -->
    <view v-else class="header">
      <image class="artist-avatar" :src="getCover(detail.sizable_avatar || detail.pic || '', 200)" mode="aspectFill" />
      <view class="header-info">
        <text class="artist-name">{{ detail.author_name || artistName }}</text>
        <text class="artist-stats">
          {{ detail.song_count ? `${detail.song_count} 首歌曲` : '' }}{{ detail.album_count ? ` · ${detail.album_count} 张专辑` : '' }}
        </text>
        <text v-if="detail.intro" class="artist-intro" :class="{ expanded: introExpanded }" @click="introExpanded = !introExpanded">{{ detail.intro }}</text>
      </view>
    </view>

    <!-- 播放全部 -->
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
        :key="song.hash || idx"
        class="song-item"
        :class="{ playing: currentSong?.hash === song.hash }"
        @click="onPlay(song)"
      >
        <text class="song-index">{{ idx + 1 }}</text>
        <image class="song-cover" :src="getCover(song.cover || '', 120)" mode="aspectFill" />
        <view class="song-info">
          <text class="song-name">{{ song.name }}</text>
          <text class="song-artist">{{ song.author }}{{ song.album ? ` · ${song.album}` : '' }}</text>
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
import { getArtistDetail, getArtistSongs } from '@/api/artist'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatMilliseconds } from '@sonic-music/shared/utils/time'

const playerStore = usePlayerStore()
const { loadAndPlay } = useAudioPlayer()
const currentSong = computed(() => playerStore.currentSong)

const detail = ref({})
const songs = ref([])
const page = ref(1)
const hasMore = ref(true)
const loadingInfo = ref(true)
const loadingTracks = ref(false)
const introExpanded = ref(false)
let artistId = ''
let artistName = ''

function formatTrack(track) {
  return {
    hash: track.hash || '',
    name: track.audio_name || track.filename || '',
    author: track.author_name || '',
    album: track.album_name || '',
    cover: track.trans_param?.union_cover || track.cover || '',
    timelen: track.timelength || track.timelen || 0,
  }
}

async function fetchDetail() {
  loadingInfo.value = true
  try {
    const res = await getArtistDetail({ id: artistId })
    detail.value = res.data || res.info || {}
  } catch (e) {
    console.error('[artist/detail] fetchDetail error', e)
  } finally {
    loadingInfo.value = false
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
    const res = await getArtistSongs({ id: artistId, page: page.value, pagesize: 30 })
    const list = (res.data || res.list || []).map(formatTrack)
    songs.value.push(...list)
    hasMore.value = list.length === 30
    page.value++
  } catch (e) {
    console.error('[artist/detail] fetchTracks error', e)
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
  artistId = options.id || ''
  artistName = decodeURIComponent(options.name || '')
  if (!artistId) return
  fetchDetail()
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
  padding: 30rpx;
  background: #fff;
}
.artist-avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
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
.artist-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary, #333);
}
.artist-stats {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 10rpx;
}
.artist-intro {
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
.artist-intro.expanded {
  -webkit-line-clamp: unset;
  display: block;
}
.actions {
  display: flex;
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
}
.action-btn.primary {
  background: var(--primary-color, #FF69B4);
  flex: 1;
  justify-content: center;
}
.action-icon, .action-text { color: #fff; }
.action-text { font-size: 28rpx; font-weight: 600; }
.action-count { font-size: 22rpx; color: rgba(255,255,255,0.8); }
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
.song-item.playing { background: rgba(255, 105, 180, 0.06); }
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
.song-info { flex: 1; overflow: hidden; }
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-duration { font-size: 22rpx; color: #bbb; flex-shrink: 0; }
.loading-more, .no-more { padding: 30rpx; text-align: center; }
.loading-text, .no-more-text { font-size: 24rpx; color: #bbb; }
.skeleton-box {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
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
