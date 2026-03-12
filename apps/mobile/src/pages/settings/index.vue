<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <svg class="back-svg" viewBox="0 0 256 512"><path fill="currentColor" d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"/></svg>
      </view>
      <text class="nav-title">设置</text>
    </view>

    <view class="section-list">
      <view
        v-for="section in sections"
        :key="section.key"
        class="section-item"
        @click="goSection(section.key)"
      >
        <view class="section-icon-wrap">
          <svg class="section-svg" :viewBox="section.viewBox"><path fill="currentColor" :d="section.path"/></svg>
        </view>
        <text class="section-label">{{ section.label }}</text>
        <text class="section-arrow">›</text>
      </view>
    </view>

    <view class="reset-row" @click="resetSettings">
      <text class="reset-text">恢复出厂设置</text>
    </view>

    <view class="version-info">
      <text class="version-text">© Sonic Music  v0.0.3-dev</text>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { applyTheme } from '@/utils/theme'

const settingsStore = useSettingsStore()

const sections = [
  {
    key: 'appearance', label: '界面',
    viewBox: '0 0 512 512',
    path: 'M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z'
  },
  {
    key: 'audio', label: '声音',
    viewBox: '0 0 576 512',
    path: 'M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256c0-95.33-47.73-183.58-127.65-236.03zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.53 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z'
  },
  {
    key: 'system', label: '系统',
    viewBox: '0 0 512 512',
    path: 'M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z'
  },
  {
    key: 'about', label: '关于',
    viewBox: '0 0 512 512',
    path: 'M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z'
  },
]

function goBack() {
  uni.navigateBack()
}

function goSection(key) {
  uni.navigateTo({ url: `/pages/settings/section?key=${key}` })
}

function resetSettings() {
  uni.showModal({
    title: '恢复出厂设置',
    content: '将重置所有设置，确认继续？',
    success(res) {
      if (res.confirm) {
        settingsStore.$reset()
        applyTheme(settingsStore.themeColor)
        uni.showToast({ title: '已重置', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-color, #FFF0F5);
}
.nav-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background: var(--background-color, #FFF0F5);
}
.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}
.back-svg {
  width: 40rpx;
  height: 40rpx;
  color: var(--primary-color, #FF69B4);
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-left: 8rpx;
}
.section-list {
  margin: 24rpx 30rpx 0;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.section-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 20rpx;
}
.section-item:last-child { border-bottom: none; }
.section-icon-wrap {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.section-svg {
  width: 36rpx;
  height: 36rpx;
  color: var(--primary-color, #FF69B4);
}
.section-label {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}
.section-arrow {
  font-size: 40rpx;
  color: #ccc;
}
.reset-row {
  margin: 32rpx 30rpx 0;
  background: #fff;
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
  display: flex;
  justify-content: center;
}
.reset-text {
  font-size: 28rpx;
  color: #ff4d4f;
}
.version-info {
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}
.version-text {
  font-size: 22rpx;
  color: #bbb;
}
</style>
