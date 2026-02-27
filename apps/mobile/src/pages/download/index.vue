<template>
  <view class="page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <view class="tab" :class="{ active: tab === 'downloading' }" @click="tab = 'downloading'">
        <text class="tab-text">下载中</text>
        <text v-if="downloadStore.downloadingList.length" class="tab-badge">{{ downloadStore.downloadingList.length }}</text>
      </view>
      <view class="tab" :class="{ active: tab === 'downloaded' }" @click="tab = 'downloaded'">
        <text class="tab-text">已下载</text>
        <text v-if="downloadStore.downloadedList.length" class="tab-badge">{{ downloadStore.downloadedList.length }}</text>
      </view>
    </view>

    <!-- 下载中列表 -->
    <view v-if="tab === 'downloading'">
      <view v-if="!downloadStore.downloadingList.length" class="empty">
        <text class="empty-text">暂无下载任务</text>
      </view>
      <view v-else class="song-list">
        <view
          v-for="item in downloadStore.downloadingList"
          :key="item.hash"
          class="song-item"
        >
          <image class="song-cover" :src="getCover(item.cover || '', 120)" mode="aspectFill" />
          <view class="song-info">
            <text class="song-name">{{ item.name }}</text>
            <text class="song-artist">{{ item.author }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: item.progress + '%' }" />
            </view>
            <text class="status-text">{{ statusLabel(item.status) }}</text>
          </view>
          <view class="remove-btn" @click="downloadStore.removeDownloading(item.hash)">
            <text class="remove-icon">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已下载列表 -->
    <view v-if="tab === 'downloaded'">
      <view v-if="!downloadStore.downloadedList.length" class="empty">
        <text class="empty-text">暂无已下载歌曲</text>
      </view>
      <view v-else>
        <view class="list-actions">
          <view class="clear-btn" @click="onClearAll">
            <text class="clear-text">清空列表</text>
          </view>
        </view>
        <view class="song-list">
          <view
            v-for="item in downloadStore.downloadedList"
            :key="item.hash"
            class="song-item"
            @click="onPlay(item)"
          >
            <image class="song-cover" :src="getCover(item.cover || '', 120)" mode="aspectFill" />
            <view class="song-info">
              <text class="song-name">{{ item.name }}</text>
              <text class="song-artist">{{ item.author }}</text>
              <text class="done-label">已下载</text>
            </view>
            <view class="remove-btn" @click.stop="downloadStore.removeDownloaded(item.hash)">
              <text class="remove-icon">×</text>
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
import { useDownloadStore } from '@/stores/download'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getCover } from '@sonic-music/shared/utils/cover'

const downloadStore = useDownloadStore()
const { loadAndPlay } = useAudioPlayer()

const tab = ref('downloading')

function statusLabel(status) {
  const map = { pending: '等待中', downloading: '下载中', done: '完成', error: '失败' }
  return map[status] || status
}

function onPlay(item) {
  loadAndPlay(item)
}

function onClearAll() {
  uni.showModal({
    title: '清空列表',
    content: '确定清空已下载列表？（不会删除本地文件）',
    success: (res) => {
      if (res.confirm) downloadStore.clearCompleted()
    }
  })
}
</script>

<style scoped>
.page {
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}
.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 28rpx 0;
}
.tab.active {
  border-bottom: 4rpx solid var(--primary-color, #FF69B4);
}
.tab-text {
  font-size: 28rpx;
  color: #999;
}
.tab.active .tab-text {
  color: var(--primary-color, #FF69B4);
  font-weight: 600;
}
.tab-badge {
  font-size: 20rpx;
  background: var(--primary-color, #FF69B4);
  color: #fff;
  border-radius: 20rpx;
  padding: 2rpx 10rpx;
  min-width: 32rpx;
  text-align: center;
}
.empty {
  padding: 120rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 28rpx;
  color: #bbb;
}
.list-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16rpx 30rpx;
}
.clear-btn {
  padding: 10rpx 24rpx;
  border: 1rpx solid #eee;
  border-radius: 30rpx;
}
.clear-text {
  font-size: 24rpx;
  color: var(--text-secondary, #999);
}
.song-list {
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.song-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #fff;
  border-radius: 16rpx;
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
  margin-top: 4rpx;
}
.progress-bar {
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  margin-top: 10rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--primary-color, #FF69B4);
  border-radius: 3rpx;
  transition: width 0.3s;
}
.status-text {
  display: block;
  font-size: 20rpx;
  color: var(--text-secondary, #999);
  margin-top: 4rpx;
}
.done-label {
  display: block;
  font-size: 20rpx;
  color: var(--primary-color, #FF69B4);
  margin-top: 4rpx;
}
.remove-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.remove-icon {
  font-size: 36rpx;
  color: #ccc;
}
</style>
