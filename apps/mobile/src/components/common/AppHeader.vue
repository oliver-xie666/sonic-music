<template>
  <view class="app-header">
    <!-- 左侧 logo -->
    <view class="header-left" @click="goHome">
      <image class="header-logo" src="/static/logo.svg" mode="aspectFit" />
      <text class="header-title">Sonic Music</text>
    </view>
    <!-- 右侧操作 -->
    <view class="header-right">
      <view class="header-icon" @click="goSearch">
        <svg class="svg-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>
      </view>
      <view class="header-icon" @click="showThemeMenu = !showThemeMenu">
        <svg v-if="isDark" class="svg-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>
        <svg v-else class="svg-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7-100.4-33.5c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.8 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.4c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.4 94.8c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.8-47.4c12.8-6.4 12.8-24.6 0-31zM256 368c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"/></svg>
      </view>
      <view class="header-avatar" @click="openDrawer">
        <image v-if="avatar" class="avatar-img" :src="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder"><text class="avatar-text">👤</text></view>
      </view>
    </view>

    <!-- 主题菜单 -->
    <view v-if="showThemeMenu" class="theme-menu-mask" @click="showThemeMenu = false" />
    <view v-if="showThemeMenu" class="theme-menu">
      <view class="theme-menu-section">
        <text class="theme-menu-title">外观</text>
        <view v-for="t in themeOptions" :key="t.value" class="theme-menu-item" @click="setTheme(t.value)">
          <text class="theme-menu-text">{{ t.label }}</text>
          <text v-if="settings.theme === t.value" class="theme-check">✓</text>
        </view>
      </view>
      <view class="theme-menu-divider" />
      <view class="theme-menu-section">
        <text class="theme-menu-title">主色调</text>
        <view v-for="c in colorOptions" :key="c.value" class="theme-menu-item" @click="setColor(c.value)">
          <view class="color-dot" :style="{ background: c.hex }" />
          <text class="theme-menu-text">{{ c.label }}</text>
          <text v-if="settings.themeColor === c.value" class="theme-check">✓</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 抽屉遮罩 -->
  <view v-if="drawerOpen" class="drawer-mask" @click="closeDrawer" />

  <!-- 右侧抽屉 -->
  <view class="drawer" :class="{ open: drawerOpen }">
    <!-- 用户信息 -->
    <view class="drawer-user" @click="goLibrary">
      <image v-if="avatar" class="drawer-avatar" :src="avatar" mode="aspectFill" />
      <view v-else class="drawer-avatar-placeholder"><text class="drawer-avatar-text">👤</text></view>
      <view class="drawer-user-info">
        <text class="drawer-username">{{ username || '游客' }}</text>
        <text v-if="uid" class="drawer-uid">UID: {{ uid }}</text>
      </view>
      <text class="drawer-arrow">›</text>
    </view>

    <!-- 菜单 -->
    <view class="drawer-menu">
      <view class="drawer-item" @click="doAction('settings')">
        <svg class="drawer-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>
        <text class="drawer-item-text">设置</text>
        <text class="drawer-arrow">›</text>
      </view>
      <view class="drawer-item" @click="doAction(isLoggedIn ? 'logout' : 'login')">
        <svg v-if="isLoggedIn" class="drawer-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96C43 64 0 107 0 160v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/></svg>
        <svg v-else class="drawer-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"/></svg>
        <text class="drawer-item-text">{{ isLoggedIn ? '退出登录' : '登录' }}</text>
        <text class="drawer-arrow">›</text>
      </view>
      <view class="drawer-item" @click="doAction('refresh')">
        <svg class="drawer-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z"/></svg>
        <text class="drawer-item-text">刷新</text>
        <text class="drawer-arrow">›</text>
      </view>
      <view class="drawer-item" @click="doAction('update')">
        <svg class="drawer-svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
        <text class="drawer-item-text">更新<text v-if="hasUpdate" class="new-badge">new</text></text>
        <text class="drawer-arrow">›</text>
      </view>
      <view class="drawer-item" @click="doAction('about')">
        <svg class="drawer-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>
        <text class="drawer-item-text">关于</text>
        <text class="drawer-arrow">›</text>
      </view>
    </view>
  </view>

  <!-- 关于弹窗 -->
  <view v-if="showAbout" class="modal-mask" @click="showAbout = false">
    <view class="modal-box" @click.stop>
      <text class="modal-title">免责声明</text>
      <scroll-view class="modal-scroll" scroll-y>
        <text class="modal-text">本程序是酷狗第三方客户端，并非酷狗官方，需要更完善的功能请下载官方客户端体验。</text>
        <text class="modal-text">本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为及非法用途。</text>
        <text class="modal-text">使用本项目的过程中可能会产生版权数据，对于这些版权数据，本项目不拥有它们的所有权，为了避免侵权，使用者务必在24小时内清除使用本项目的过程中所产生的版权数据。</text>
        <text class="modal-text">音乐平台不易，请尊重版权，支持正版。</text>
        <text class="modal-text">本项目仅用于对技术可行性的探索及研究，不接受任何商业（包括但不限于广告等）合作及捐赠。</text>
      </scroll-view>
      <view class="modal-btn" @click="showAbout = false"><text class="modal-btn-text">关闭</text></view>
      <text class="modal-version">© Sonic Music  v0.0.3-dev</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { useMobileAuthPersist } from '@/stores/auth'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { applyTheme } from '@/utils/theme'

const MoeAuth = MoeAuthStore()
const authPersist = useMobileAuthPersist()
const settings = useSettingsStore()

const drawerOpen = ref(false)
const showThemeMenu = ref(false)
const showAbout = ref(false)
const hasUpdate = ref(false)

const avatar = computed(() => MoeAuth.UserInfo?.pic || '')
const username = computed(() => MoeAuth.UserInfo?.nickname || '')
const uid = computed(() => MoeAuth.UserInfo?.userid || '')
const isLoggedIn = computed(() => !!MoeAuth.UserInfo)
const isDark = computed(() => settings.theme === 'dark')

const themeOptions = [
  { value: 'light', label: '☀️ 浅色' },
  { value: 'dark',  label: '🌙 深色' },
]
const colorOptions = [
  { value: 'pink',   label: '少女粉', hex: '#FF69B4' },
  { value: 'blue',   label: '天空蓝', hex: '#4A90E2' },
  { value: 'green',  label: '薄荷绿', hex: '#52C41A' },
  { value: 'orange', label: '蜜柑橙', hex: '#FA8C16' },
]

function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

function setTheme(val) {
  settings.setTheme(val)
  applyTheme(settings.themeColor)
  showThemeMenu.value = false
}

function setColor(val) {
  settings.themeColor = val
  applyTheme(val)
  showThemeMenu.value = false
}

function goLibrary() {
  closeDrawer()
  uni.switchTab({ url: '/pages/library/index' })
}

function doAction(action) {
  closeDrawer()
  if (action === 'settings') {
    uni.navigateTo({ url: '/pages/settings/index' })
  } else if (action === 'login') {
    uni.navigateTo({ url: '/pages/login/index' })
  } else if (action === 'logout') {
    uni.showModal({
      title: '退出登录', content: '确认要退出登录吗？',
      success(res) {
        if (res.confirm) {
          MoeAuth.clearData()
          authPersist.clear()
        }
      }
    })
  } else if (action === 'refresh') {
    // #ifdef H5
    window.location.reload()
    // #endif
  } else if (action === 'update') {
    // #ifdef H5
    window.open('https://github.com/oliver-xie666/sonic-music/releases', '_blank')
    // #endif
    // #ifndef H5
    plus.runtime.openURL('https://github.com/oliver-xie666/sonic-music/releases')
    // #endif
  } else if (action === 'about') {
    showAbout.value = true
  }
}

onMounted(async () => {
  try {
    const res = await uni.request({ url: 'https://api.github.com/repos/oliver-xie666/sonic-music/releases/latest' })
    const latest = res.data?.tag_name?.replace(/^v/, '')
    if (latest && latest > '0.0.3') hasUpdate.value = true
  } catch (e) {}
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0;
  padding-top: calc(16rpx + env(safe-area-inset-top));
  padding-bottom: 16rpx;
  background: var(--background-color, #FFF0F5);
  position: relative;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.header-logo {
  width: 64rpx;
  height: 64rpx;
}
.header-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--primary-color, #FF69B4);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.header-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.svg-icon {
  width: 36rpx;
  height: 36rpx;
  color: var(--primary-color, #FF69B4);
}
.header-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; }
.avatar-placeholder {
  width: 100%; height: 100%;
  background: #f0f0f0;
  display: flex; align-items: center; justify-content: center;
}
.avatar-text { font-size: 32rpx; }

/* 主题菜单 */
.theme-menu-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 98;
}
.theme-menu {
  position: absolute;
  top: 100%;
  right: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.15);
  z-index: 99;
  min-width: 280rpx;
  overflow: hidden;
}
.theme-menu-section { padding: 12rpx 0; }
.theme-menu-title {
  display: block;
  font-size: 22rpx;
  color: #999;
  padding: 8rpx 28rpx;
}
.theme-menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  gap: 16rpx;
}
.color-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.theme-menu-text { flex: 1; font-size: 28rpx; color: #333; }
.theme-check { font-size: 28rpx; color: var(--primary-color, #FF69B4); }
.theme-menu-divider { height: 1rpx; background: #f0f0f0; }

/* 遮罩 */
.drawer-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
}
/* 抽屉 */
.drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 560rpx;
  background: #fff;
  z-index: 101;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  padding-top: env(safe-area-inset-top);
}
.drawer.open { transform: translateX(0); }

.drawer-user {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  gap: 24rpx;
}
.drawer-avatar {
  width: 96rpx; height: 96rpx;
  border-radius: 50%; flex-shrink: 0;
}
.drawer-avatar-placeholder {
  width: 96rpx; height: 96rpx;
  border-radius: 50%; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.drawer-avatar-text { font-size: 48rpx; }
.drawer-user-info { flex: 1; }
.drawer-username { display: block; font-size: 30rpx; font-weight: 600; color: #333; }
.drawer-uid { display: block; font-size: 22rpx; color: #999; margin-top: 6rpx; }
.drawer-arrow { font-size: 40rpx; color: #ccc; }

.drawer-menu { padding: 16rpx 0; }
.drawer-item {
  display: flex; align-items: center;
  padding: 28rpx 32rpx; gap: 20rpx;
}
.drawer-item-icon { font-size: 36rpx; }
.drawer-svg {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  color: var(--primary-color, #FF69B4);
}
.drawer-item-text { flex: 1; font-size: 28rpx; color: #333; }
.new-badge {
  margin-left: 8rpx;
  background: red; color: #fff;
  font-size: 18rpx; padding: 2rpx 8rpx;
  border-radius: 8rpx;
}

/* 关于弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 80vw;
  max-height: 70vh;
  display: flex; flex-direction: column;
}
.modal-title {
  font-size: 32rpx; font-weight: 600; color: var(--primary-color, #FF69B4);
  margin-bottom: 24rpx;
}
.modal-scroll { flex: 1; max-height: 50vh; }
.modal-text {
  display: block; font-size: 24rpx; color: #555;
  line-height: 1.6; margin-bottom: 16rpx;
}
.modal-btn {
  margin-top: 24rpx;
  background: var(--primary-color, #FF69B4);
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex; justify-content: center;
}
.modal-btn-text { font-size: 28rpx; color: #fff; font-weight: 600; }
.modal-version {
  display: block; font-size: 20rpx; color: #bbb;
  text-align: right; margin-top: 12rpx;
}
</style>
