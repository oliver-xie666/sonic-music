<template>
  <view class="page">
    <!-- 骨架屏 -->
    <view v-if="loading" class="rank-grid">
      <view v-for="i in 6" :key="i" class="rank-card skeleton">
        <view class="rank-cover skeleton-box" />
        <view class="rank-info">
          <view class="skeleton-line" style="width: 70%;" />
          <view class="skeleton-line" style="width: 50%; margin-top: 8rpx;" />
        </view>
      </view>
    </view>

    <!-- 排行榜列表 -->
    <view v-else>
      <view v-for="group in rankGroups" :key="group.name" class="group">
        <text class="group-title">{{ group.name }}</text>
        <view class="rank-grid">
          <view
            v-for="item in group.list"
            :key="item.rankid"
            class="rank-card"
            @click="goToDetail(item)"
          >
            <image class="rank-cover" :src="getCover(item.album_img || item.img || '', 240)" mode="aspectFill" />
            <view class="rank-info">
              <text class="rank-name">{{ item.rankname }}</text>
              <text v-if="item.songs && item.songs[0]" class="rank-top">{{ item.songs[0].filename || item.songs[0].name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRankList } from '@/api/ranking'
import { getCover } from '@sonic-music/shared/utils/cover'

const loading = ref(true)
const rankGroups = ref([])

async function fetchRankList() {
  loading.value = true
  try {
    const res = await getRankList()
    const list = res.data?.info || res.data?.list || res.list || []
    // 按 parentid 或 type 分组，若无分组信息则全部放一组
    const grouped = {}
    list.forEach(item => {
      const key = item.parentname || item.type_name || '排行榜'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })
    rankGroups.value = Object.entries(grouped).map(([name, list]) => ({ name, list }))
  } catch (e) {
    console.error('[ranking/index] fetchRankList error', e)
  } finally {
    loading.value = false
  }
}

function goToDetail(item) {
  uni.navigateTo({ url: `/pages/ranking/detail?rankid=${item.rankid}&name=${encodeURIComponent(item.rankname || '')}` })
}

onLoad(() => {
  fetchRankList()
})
</script>

<style scoped>
.page {
  padding: 24rpx 24rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.group {
  margin-bottom: 32rpx;
}
.group-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 20rpx;
}
.rank-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
.rank-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.rank-cover {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
}
.rank-info {
  padding: 16rpx;
}
.rank-name {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-top {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 骨架屏 */
.skeleton-box {
  width: 100%;
  aspect-ratio: 1;
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
