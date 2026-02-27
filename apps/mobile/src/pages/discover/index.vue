<template>
  <view class="page">
    <view class="section">
      <text class="section-title">排行榜</text>
      <view class="ranking-entry" @click="goToRanking">
        <view class="ranking-icon">🏆</view>
        <view class="ranking-info">
          <text class="ranking-name">音乐排行榜</text>
          <text class="ranking-desc">实时热歌榜、飙升榜、新歌榜</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">推荐歌单</text>
      <view v-if="loading" class="playlist-grid">
        <view v-for="i in 6" :key="i" class="playlist-card skeleton">
          <view class="playlist-cover skeleton-box" />
          <view class="skeleton-line" style="margin: 12rpx 14rpx; width: 70%;" />
        </view>
      </view>
      <view v-else class="playlist-grid">
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
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPlaylistList } from '@/api/playlist'
import { getCover } from '@sonic-music/shared/utils/cover'

const playlists = ref([])
const loading = ref(true)

async function fetchPlaylists() {
  loading.value = true
  try {
    const res = await getPlaylistList({ page: 1, pagesize: 12 })
    playlists.value = res.data?.special_list || res.data || res.list || []
  } catch (e) {
    console.error('[discover] fetchPlaylists error', e)
  } finally {
    loading.value = false
  }
}

function goToRanking() {
  uni.navigateTo({ url: '/pages/ranking/index' })
}

function goToPlaylist(item) {
  const id = item.global_collection_id || item.id || item.playlist_id
  uni.navigateTo({ url: `/pages/playlist/detail?id=${id}` })
}

onLoad(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.page {
  padding: 30rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.section {
  margin-bottom: 50rpx;
}
.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 24rpx;
}
.ranking-entry {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.1);
}
.ranking-icon {
  font-size: 56rpx;
  width: 80rpx;
  text-align: center;
}
.ranking-info {
  flex: 1;
}
.ranking-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
}
.ranking-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.arrow {
  font-size: 40rpx;
  color: #ccc;
}
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.playlist-card {
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(255, 105, 180, 0.08);
}
.playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
}
.playlist-name {
  display: block;
  font-size: 22rpx;
  color: var(--text-primary, #333);
  padding: 10rpx 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skeleton-box {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-line {
  height: 22rpx;
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
