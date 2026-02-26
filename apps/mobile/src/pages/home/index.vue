<template>
  <view class="page">
    <view class="header">
      <text class="title">Sonic Music</text>
      <text class="subtitle">发现你的音乐世界</text>
    </view>

    <view class="section">
      <text class="section-title">推荐歌单</text>
      <view class="playlist-grid">
        <view class="playlist-card" v-for="item in playlists" :key="item.id">
          <view class="cover" :style="{ background: item.color }">
            <text class="cover-icon">{{ item.icon }}</text>
          </view>
          <text class="name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">最近播放</text>
      <view class="song-list">
        <view class="song-item" v-for="song in songs" :key="song.id">
          <view class="song-cover" :style="{ background: song.color }">
            <text class="song-icon">♪</text>
          </view>
          <view class="song-info">
            <text class="song-name">{{ song.name }}</text>
            <text class="song-artist">{{ song.artist }}</text>
          </view>
          <text class="song-duration">{{ song.duration }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const playlists = [
  { id: 1, name: '华语热歌', icon: '🎵', color: 'linear-gradient(135deg, #FF69B4, #FFB6C1)' },
  { id: 2, name: '轻音乐', icon: '🎹', color: 'linear-gradient(135deg, #4A90E2, #AEDFF7)' },
  { id: 3, name: '电子音乐', icon: '🎧', color: 'linear-gradient(135deg, #34C759, #A7F3D0)' },
  { id: 4, name: '经典老歌', icon: '🎸', color: 'linear-gradient(135deg, #FF9500, #FFD60A)' },
]

const songs = [
  { id: 1, name: '晴天', artist: '周杰伦', duration: '4:29', color: 'linear-gradient(135deg, #FF69B4, #FFB6C1)' },
  { id: 2, name: '稻香', artist: '周杰伦', duration: '3:42', color: 'linear-gradient(135deg, #34C759, #A7F3D0)' },
  { id: 3, name: '夜曲', artist: '周杰伦', duration: '4:01', color: 'linear-gradient(135deg, #4A90E2, #AEDFF7)' },
  { id: 4, name: '七里香', artist: '周杰伦', duration: '4:59', color: 'linear-gradient(135deg, #FF9500, #FFD60A)' },
]
</script>

<style scoped>
.page {
  padding: 40rpx 30rpx;
  min-height: 100vh;
  background: #FFF0F5;
}

.header {
  margin-bottom: 50rpx;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #333;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-top: 8rpx;
}

.section {
  margin-bottom: 50rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.playlist-card {
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.1);
}

.cover {
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 60rpx;
}

.name {
  display: block;
  font-size: 26rpx;
  color: #333;
  padding: 16rpx;
  font-weight: 500;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.08);
}

.song-cover {
  width: 90rpx;
  height: 90rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.song-icon {
  font-size: 36rpx;
  color: #fff;
}

.song-info {
  flex: 1;
}

.song-name {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.song-artist {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.song-duration {
  font-size: 24rpx;
  color: #bbb;
  flex-shrink: 0;
}
</style>
