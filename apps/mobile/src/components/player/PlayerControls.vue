<template>
  <view class="controls">
    <view class="btn mode-btn" @click="onToggleMode">
      <text class="icon">{{ modeIcon }}</text>
    </view>
    <view class="btn" @click="onPrev">
      <text class="icon">⏮</text>
    </view>
    <view class="btn play-btn" @click="onTogglePlay">
      <text class="icon play-icon">{{ isPlaying ? '⏸' : '▶' }}</text>
    </view>
    <view class="btn" @click="onNext">
      <text class="icon">⏭</text>
    </view>
    <view class="btn" @click="onOpenQueue">
      <text class="icon">☰</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePlaybackMode } from '@sonic-music/shared/composables/usePlaybackMode'

const props = defineProps({
  isPlaying: { type: Boolean, default: false },
})
const emit = defineEmits(['togglePlay', 'prev', 'next', 'openQueue'])

const playerStore = usePlayerStore()
const { playMode, modeLabel, toggleMode } = usePlaybackMode()

const modeIcon = computed(() => {
  if (playMode.value === 'random') return '🔀'
  if (playMode.value === 'loop') return '🔂'
  return '🔁'
})

function onToggleMode() {
  const newMode = toggleMode()
  playerStore.setPlayMode(newMode)
  uni.showToast({ title: modeLabel.value, icon: 'none', duration: 1000 })
}

function onTogglePlay() { emit('togglePlay') }
function onPrev() { emit('prev') }
function onNext() { emit('next') }
function onOpenQueue() { emit('openQueue') }
</script>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}
.btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  font-size: 44rpx;
  color: var(--primary-color);
}
.play-btn {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: var(--primary-color);
}
.play-icon {
  color: #fff;
  font-size: 48rpx;
}
</style>
