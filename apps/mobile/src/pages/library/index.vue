<template>
  <view class="page">
    <!-- 未登录 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <text class="login-icon">🎵</text>
      <text class="login-title">登录享受完整功能</text>
      <text class="login-desc">登录后可查看收藏歌单、播放历史</text>
      <view class="login-btn" @click="goToLogin">
        <text class="login-btn-text">立即登录</text>
      </view>
    </view>

    <!-- 已登录 -->
    <view v-else>
      <view class="user-info">
        <image class="avatar" :src="userInfo.pic || ''" mode="aspectFill" />
        <view class="user-detail">
          <text class="username">{{ userInfo.nickname || userInfo.username }}</text>
          <text class="user-sub">我的歌单</text>
        </view>
        <view class="logout-btn" @click="onLogout">
          <text class="logout-text">退出</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">我的歌单</text>
        <view v-if="loading" class="playlist-list">
          <view v-for="i in 4" :key="i" class="playlist-item skeleton">
            <view class="pl-cover skeleton-box" />
            <view class="pl-info">
              <view class="skeleton-line" style="width: 60%;" />
              <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
            </view>
          </view>
        </view>
        <view v-else-if="!playlists.length" class="empty">
          <text class="empty-text">暂无歌单</text>
        </view>
        <view v-else class="playlist-list">
          <view
            v-for="item in playlists"
            :key="item.id || item.playlist_id"
            class="playlist-item"
            @click="goToPlaylist(item)"
          >
            <image class="pl-cover" :src="getCover(item.img || item.cover || '', 120)" mode="aspectFill" />
            <view class="pl-info">
              <text class="pl-name">{{ item.name || item.playlist_name }}</text>
              <text class="pl-count">{{ item.count || 0 }} 首</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { getUserPlaylists } from '@/api/user'
import { getCover } from '@sonic-music/shared/utils/cover'

const authStore = MoeAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userInfo = computed(() => authStore.UserInfo || {})

const playlists = ref([])
const loading = ref(false)

async function fetchPlaylists() {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const res = await getUserPlaylists()
    playlists.value = res.data || res.list || []
  } catch (e) {
    console.error('[library] fetchPlaylists error', e)
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goToPlaylist(item) {
  const id = item.global_collection_id || item.list_create_gid || item.id || item.playlist_id
  uni.navigateTo({ url: `/pages/playlist/detail?id=${id}` })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.$reset()
        playlists.value = []
      }
    }
  })
}

onShow(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.page {
  padding: 30rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}
.login-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}
.login-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 16rpx;
}
.login-desc {
  font-size: 26rpx;
  color: var(--text-secondary, #999);
  margin-bottom: 60rpx;
  text-align: center;
}
.login-btn {
  background: var(--primary-color, #FF69B4);
  border-radius: 50rpx;
  padding: 24rpx 80rpx;
}
.login-btn-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: 600;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.1);
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f5f5f5;
  flex-shrink: 0;
}
.user-detail {
  flex: 1;
}
.username {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
}
.user-sub {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.logout-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #eee;
  border-radius: 30rpx;
}
.logout-text {
  font-size: 24rpx;
  color: var(--text-secondary, #999);
}
.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 24rpx;
}
.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.playlist-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 180, 0.05);
}
.pl-cover {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.pl-info {
  flex: 1;
  overflow: hidden;
}
.pl-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-count {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.arrow {
  font-size: 40rpx;
  color: #ccc;
}
.empty {
  padding: 80rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 28rpx;
  color: #bbb;
}
.skeleton-box {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
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
