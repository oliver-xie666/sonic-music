<template>
  <view class="page">
    <view class="card">
      <text class="card-title">服务器设置</text>
      <view class="setting-row">
        <text class="label">API 地址</text>
        <input
          class="input"
          v-model="apiUrl"
          placeholder="http://127.0.0.1:6521"
          @blur="saveApiUrl"
        />
      </view>
    </view>

    <view class="card">
      <text class="card-title">播放设置</text>
      <view class="setting-row">
        <text class="label">音质</text>
        <view class="options">
          <view
            v-for="q in qualityOptions"
            :key="q.value"
            class="option-tag"
            :class="{ active: quality === q.value }"
            @click="setQuality(q.value)"
          >
            <text class="option-text">{{ q.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card-title">外观</text>
      <view class="setting-row">
        <text class="label">主题</text>
        <view class="options">
          <view
            v-for="t in themeOptions"
            :key="t.value"
            class="option-tag"
            :class="{ active: theme === t.value }"
            @click="setTheme(t.value)"
          >
            <text class="option-text">{{ t.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card-title">关于</text>
      <view class="setting-row">
        <text class="label">版本</text>
        <text class="value">v0.0.3-dev</text>
      </view>
      <view class="setting-row">
        <text class="label">项目</text>
        <text class="value">Sonic Music</text>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { applyTheme } from '@/utils/theme'

const settingsStore = useSettingsStore()

const apiUrl = ref(settingsStore.apiBaseUrl)
const quality = ref(settingsStore.quality)
const theme = ref(settingsStore.theme)

const qualityOptions = [
  { value: 'standard', label: '标准' },
  { value: 'high', label: '高品质' },
  { value: 'lossless', label: '无损' },
]

const themeOptions = [
  { value: 'pink', label: '粉色' },
  { value: 'dark', label: '深色' },
]

function saveApiUrl() {
  const url = apiUrl.value.trim()
  if (url) {
    settingsStore.setApiBaseUrl(url)
    uni.showToast({ title: '已保存', icon: 'success', duration: 1000 })
  }
}

function setQuality(val) {
  quality.value = val
  settingsStore.setQuality(val)
  uni.showToast({ title: '已保存', icon: 'success', duration: 1000 })
}

function setTheme(val) {
  theme.value = val
  settingsStore.setTheme(val)
  applyTheme(val)
}

onLoad(() => {
  apiUrl.value = settingsStore.apiBaseUrl
  quality.value = settingsStore.quality
  theme.value = settingsStore.theme
})
</script>

<style scoped>
.page {
  padding: 20rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 105, 180, 0.08);
}
.card-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-secondary, #999);
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.setting-row:last-child { border-bottom: none; }
.label {
  font-size: 28rpx;
  color: var(--text-primary, #333);
  flex-shrink: 0;
  margin-right: 20rpx;
}
.input {
  flex: 1;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  text-align: right;
}
.value {
  font-size: 26rpx;
  color: var(--text-secondary, #999);
}
.options {
  display: flex;
  gap: 12rpx;
}
.option-tag {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  border: 2rpx solid #eee;
  background: #f9f9f9;
}
.option-tag.active {
  border-color: var(--primary-color, #FF69B4);
  background: rgba(255, 105, 180, 0.08);
}
.option-text {
  font-size: 24rpx;
  color: var(--text-secondary, #999);
}
.option-tag.active .option-text {
  color: var(--primary-color, #FF69B4);
  font-weight: 600;
}
</style>
