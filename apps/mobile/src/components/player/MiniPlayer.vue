<template>
  <view v-if="playerStore.currentSong" class="mini-player" @click="goToPlayer">
    <image class="cover" :src="coverUrl" mode="aspectFill" />
    <view class="info">
      <text class="name">{{ playerStore.currentSong.name }}</text>
      <text class="author">{{ playerStore.currentSong.author }}</text>
    </view>
    <view class="actions">
      <view class="btn" @click.stop="onTogglePlay">
        <text class="icon">{{ playerStore.isPlaying ? '⏸' : '▶' }}</text>
      </view>
      <view class="btn" @click.stop="onNext">
        <text class="icon">⏭</text>
      </view>
    </view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getCover } from '@sonic-music/shared/utils/cover'

const playerStore = usePlayerStore()
const { togglePlay, playNext } = useAudioPlayer()

const coverUrl = computed(() => getCover(playerStore.currentSong?.img || '', 240))

const progressPercent = computed(() => {
  if (!playerStore.duration) return 0
  return Math.min((playerStore.currentTime / playerStore.duration) * 100, 100)
})

function onTogglePlay() { togglePlay() }
function onNext() { playNext() }

function goToPlayer() {
  uni.navigateTo({ url: '/pages/player/index' })
}
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 20rpx var(--color-box-shadow);
  z-index: 999;
  overflow: hidden;
}
.cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: var(--background-color-secondary);
}
.info {
  flex: 1;
  padding: 0 20rpx;
  overflow: hidden;
}
.name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.author {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}
.btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  font-size: 40rpx;
  color: var(--primary-color);
}
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: var(--border-color);
}
.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.5s linear;
}
</style>
