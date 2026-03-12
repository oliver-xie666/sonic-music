<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <svg class="back-svg" viewBox="0 0 256 512"><path fill="currentColor" d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"/></svg>
      </view>
      <text class="nav-title">{{ title }}</text>
    </view>

    <view class="section-list">
      <view
        v-for="item in items"
        :key="item.key"
        class="setting-item"
        @click="handleItemClick(item)"
      >
        <view v-if="item.icon" class="item-icon-wrap">
          <svg class="item-svg" :viewBox="item.icon.viewBox"><path fill="currentColor" :d="item.icon.path"/></svg>
        </view>
        <view class="item-left">
          <text class="item-label">{{ item.label }}</text>
          <text v-if="item.hint" class="item-hint">{{ item.hint }}</text>
        </view>
        <view class="item-right">
          <template v-if="item.type === 'switch'">
            <view
              class="switch-track"
              :class="{ active: getSwitchValue(item.key) }"
              @click.stop="toggleSwitch(item)"
            >
              <view class="switch-thumb" />
            </view>
          </template>
          <template v-else>
            <text class="item-value">{{ getDisplayValue(item) }}</text>
            <text class="item-arrow">›</text>
          </template>
        </view>
      </view>
    </view>

    <!-- 服务器：API地址输入 -->
    <view v-if="sectionKey === 'server'" class="section-list" style="margin-top: 24rpx;">
      <view class="setting-item">
        <text class="item-label">API 地址</text>
        <input
          class="api-input"
          v-model="apiUrl"
          placeholder="http://127.0.0.1:6521"
          @blur="saveApiUrl"
        />
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { applyTheme } from '@/utils/theme'

// FA5 SVG paths for setting items
const ICONS = {
  language:      { viewBox: '0 0 640 512', path: 'M152.1 236.2c-3.5-12.1-7.8-33.2-7.8-33.2h-.5s-4.3 21.1-7.8 33.2l-11.1 37.5H163zM616 96H336v320h280a24 24 0 0 0 24-24V120a24 24 0 0 0-24-24zm-24 120h-64v-16h-48v16h-64v-32h176zm-176 32h176v16H416zm0 48h176v16H416zm0 48h176v16H416zM0 120v272a24 24 0 0 0 24 24h288V96H24a24 24 0 0 0-24 24zm168.2 204.6l-11.1-37.5h-59.4l-11.1 37.5H48l59.4-192h57.2l59.4 192z' },
  themeColor:    { viewBox: '0 0 512 512', path: 'M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z' },
  theme:         { viewBox: '0 0 512 512', path: 'M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z' },
  quality:       { viewBox: '0 0 576 512', path: 'M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256c0-95.33-47.73-183.58-127.65-236.03z' },
  dataSource:    { viewBox: '0 0 448 512', path: 'M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z' },
  enableDownload:{ viewBox: '0 0 512 512', path: 'M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24z' },
  wlanOnly:      { viewBox: '0 0 640 512', path: 'M634.91 154.88C457.74-8.99 182.19-8.93 5.09 154.88c-6.66 6.16-6.79 16.59-.35 22.98l34.24 33.97c6.14 6.09 16.02 6.23 22.4.38 145.92-135.3 372.96-135.52 518.8 0 6.38 5.85 16.26 5.71 22.4-.38l34.24-33.97c6.44-6.39 6.31-16.82-.35-22.98zM320 352c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zm202.67-83.59c-115.26-101.93-290.21-101.82-405.34 0-6.9 6.1-7.12 16.69-.57 23.15l34.44 33.99c6 5.92 15.66 6.32 22.05.8 83.95-72.57 209.74-72.41 293.49 0 6.39 5.52 16.05 5.13 22.05-.8l34.44-33.99c6.56-6.46 6.33-17.06-.56-23.15z' },
}

const settingsStore = useSettingsStore()
const sectionKey = ref('')
const apiUrl = ref('')

// 用具名 computed 保证响应式，避免动态 key 访问失效
const storeValues = computed(() => ({
  language:       settingsStore.language,
  themeColor:     settingsStore.themeColor,
  theme:          settingsStore.theme,
  quality:        settingsStore.quality,
  dataSource:     settingsStore.dataSource,
  enableDownload: settingsStore.enableDownload,
  wlanOnly:       settingsStore.wlanOnly,
}))

const sectionConfig = {
  appearance: {
    title: '界面',
    items: [
      { key: 'language', label: '语言', icon: ICONS.language, options: [
        { value: '',      label: '🌏 自动' },
        { value: 'zh-CN', label: '🇨🇳 简体中文' },
        { value: 'zh-TW', label: '🇨🇳 繁体中文' },
        { value: 'en',    label: '🇺🇸 English' },
        { value: 'ja',    label: '🇯🇵 日本語' },
        { value: 'ko',    label: '🇰🇷 한국어' },
      ]},
      { key: 'themeColor', label: '主色调', icon: ICONS.themeColor, options: [
        { value: 'pink',   label: '少女粉' },
        { value: 'blue',   label: '天空蓝' },
        { value: 'green',  label: '薄荷绿' },
        { value: 'orange', label: '蜜柑橙' },
      ]},
      { key: 'theme', label: '外观', icon: ICONS.theme, options: [
        { value: 'auto',  label: '🌗 自动' },
        { value: 'light', label: '☀️ 浅色' },
        { value: 'dark',  label: '🌙 深色' },
      ]},
    ]
  },
  audio: {
    title: '声音',
    items: [
      { key: 'quality', label: '音质选择', icon: ICONS.quality, options: [
        { value: 'normal',      label: '普通音质' },
        { value: 'high',        label: '高音质 320kbps' },
        { value: 'lossless',    label: '无损音质 1104kbps' },
        { value: 'hires',       label: 'Hi-Res音质' },
        { value: 'viper_atmos', label: '维声全景声' },
        { value: 'viper_clear', label: '维声超清音质' },
        { value: 'viper_tape',  label: '维声母带' },
      ]},
      { key: 'dataSource', label: '数据源', icon: ICONS.dataSource, options: [
        { value: 'official', label: '正式版' },
        { value: 'concept',  label: '概念版' },
      ]},
    ]
  },
  system: {
    title: '系统',
    items: [
      { key: 'enableDownload', label: '启用下载功能', icon: ICONS.enableDownload, type: 'switch' },
      { key: 'wlanOnly',       label: '仅通过 WLAN 下载', icon: ICONS.wlanOnly, type: 'switch' },
    ]
  },
  about: {
    title: '关于',
    items: [
      { key: '_version', label: '版本', readonly: true, value: 'v0.0.3-dev' },
      { key: '_project', label: '项目', readonly: true, value: 'Sonic Music' },
    ]
  },
}

const title = computed(() => sectionConfig[sectionKey.value]?.title || '')
const items  = computed(() => sectionConfig[sectionKey.value]?.items || [])

function goBack() {
  uni.navigateBack()
}

function getDisplayValue(item) {
  if (item.readonly) return item.value
  const val = storeValues.value[item.key]
  const opt = item.options?.find(o => o.value === val)
  console.log(`[getDisplayValue] key=${item.key}, val=${val}, opt=${opt?.label}`)
  return opt ? opt.label : ''
}

function getSwitchValue(key) {
  return !!storeValues.value[key]
}

function handleItemClick(item) {
  if (item.readonly || item.type === 'switch') return
  openPicker(item)
}

function openPicker(item) {
  uni.showActionSheet({
    itemList: item.options.map(o => o.label),
    success(res) {
      const selected = item.options[res.tapIndex]
      settingsStore[item.key] = selected.value
      if (item.key === 'theme' || item.key === 'themeColor') {
        applyTheme(settingsStore.themeColor)
      }
    }
  })
}

function toggleSwitch(item) {
  settingsStore[item.key] = !settingsStore[item.key]
}

function saveApiUrl() {
  const url = apiUrl.value.trim()
  if (url) {
    settingsStore.setApiBaseUrl(url)
    uni.showToast({ title: '已保存', icon: 'success', duration: 1000 })
  }
}

onLoad((query) => {
  sectionKey.value = query.key || ''
  apiUrl.value = settingsStore.apiBaseUrl

  // 调试：打印所有设置值
  console.log('[Settings Debug] Store values:', {
    language: settingsStore.language,
    themeColor: settingsStore.themeColor,
    theme: settingsStore.theme,
    quality: settingsStore.quality,
    dataSource: settingsStore.dataSource,
    enableDownload: settingsStore.enableDownload,
    wlanOnly: settingsStore.wlanOnly,
  })
  console.log('[Settings Debug] storeValues computed:', storeValues.value)
})
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
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.setting-item:last-child { border-bottom: none; }
.item-icon-wrap {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.item-svg {
  width: 32rpx;
  height: 32rpx;
  color: var(--primary-color, #FF69B4);
}
.item-left { flex: 1; }
.item-label {
  font-size: 30rpx;
  color: #333;
}
.item-hint {
  display: block;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 4rpx;
}
.item-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.item-value {
  font-size: 26rpx;
  color: #999;
}
.item-arrow {
  font-size: 40rpx;
  color: #ccc;
}
.api-input {
  flex: 1;
  font-size: 24rpx;
  color: #999;
  text-align: right;
  min-width: 300rpx;
}
/* Switch */
.switch-track {
  width: 96rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: #ddd;
  position: relative;
  transition: background 0.25s;
}
.switch-track.active {
  background: var(--primary-color, #FF69B4);
}
.switch-thumb {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  transition: left 0.25s;
}
.switch-track.active .switch-thumb {
  left: 48rpx;
}
</style>
