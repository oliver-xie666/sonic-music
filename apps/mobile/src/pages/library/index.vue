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
      <!-- 用户头部背景图 -->
      <view class="profile-header">
        <image
          class="profile-bg-img"
          :src="userDetail.bg_pic ? userDetail.bg_pic.replace('http://', 'https://') : '/static/banner.png'"
          mode="aspectFill"
        />
        <view class="profile-header-mask" />
        <view class="profile-content">
          <image class="avatar" :src="userInfo.pic || ''" mode="aspectFill" />
          <view class="profile-meta">
            <view class="name-row">
              <text class="username">{{ userInfo.nickname || userInfo.username || '用户' }}</text>
              <text v-if="userDetail.p_grade" class="level-badge">Lv.{{ userDetail.p_grade }}</text>
            </view>
            <text v-if="userDetail.descri" class="bio">{{ userDetail.descri }}</text>
            <!-- 性别 / 听歌时长 / 乐龄 -->
            <view class="user-meta">
              <text v-if="userDetail.gender !== undefined" class="meta-tag">
                {{ userDetail.gender === 1 ? '♂' : '♀' }}
              </text>
              <text v-if="userDetail.duration" class="meta-tag">
                {{ formatDuration(userDetail.duration) }} 听歌时长
              </text>
              <text v-if="userDetail.rtime" class="meta-tag">
                {{ formatRegTime(userDetail.rtime) }}
              </text>
            </view>
          </view>
          <view class="logout-btn" @click="onLogout">
            <text class="logout-text">退出</text>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view v-if="userDetail.fans !== undefined" class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ userDetail.follows || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-num">{{ userDetail.fans || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-num">{{ userDetail.friends || 0 }}</text>
          <text class="stat-label">好友</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-num">{{ userDetail.hvisitors || 0 }}</text>
          <text class="stat-label">访问</text>
        </view>
      </view>

      <!-- Tab 切换 -->
      <scroll-view class="tabs" scroll-x>
        <view class="tabs-inner">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 我喜欢听（最近播放） -->
      <view v-if="activeTab === 'history'">
        <view v-if="historyLoading" class="song-list">
          <view v-for="i in 5" :key="i" class="song-item skeleton">
            <view class="song-cover skeleton-box" />
            <view class="song-info">
              <view class="skeleton-line" style="width: 60%;" />
              <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
            </view>
          </view>
        </view>
        <view v-else-if="!history.length" class="empty">
          <text class="empty-text">暂无播放记录</text>
        </view>
        <view v-else class="song-list">
          <view
            v-for="song in history"
            :key="song.hash"
            class="song-item"
            @click="onPlaySong(song)"
          >
            <image class="song-cover" :src="getCover(song.image || '', 120)" mode="aspectFill" />
            <view class="song-info">
              <text class="song-name">{{ getSongName(song.name) }}</text>
              <text class="song-artist">{{ song.singername }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 我创建的歌单 -->
      <view v-if="activeTab === 'created'">
        <view v-if="playlistLoading" class="playlist-list">
          <view v-for="i in 4" :key="i" class="playlist-item skeleton">
            <view class="pl-cover skeleton-box" />
            <view class="pl-info">
              <view class="skeleton-line" style="width: 60%;" />
              <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
            </view>
          </view>
        </view>
        <view v-else-if="!createdPlaylists.length" class="empty">
          <text class="empty-text">暂无创建的歌单</text>
        </view>
        <view v-else class="playlist-list">
          <view
            v-for="item in createdPlaylists"
            :key="item.listid"
            class="playlist-item"
            @click="goToPlaylist(item)"
          >
            <image class="pl-cover" :src="getCover(item.pic || '', 120)" mode="aspectFill" />
            <view class="pl-info">
              <text class="pl-name">{{ item.name }}</text>
              <text class="pl-count">{{ item.count || 0 }} 首</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
        <!-- 创建歌单按钮 -->
        <view class="create-btn" @click="onCreatePlaylist">
          <text class="create-btn-icon">＋</text>
          <text class="create-btn-text">新建歌单</text>
        </view>
      </view>

      <!-- 我收藏的歌单 -->
      <view v-if="activeTab === 'collected'">
        <view v-if="playlistLoading" class="playlist-list">
          <view v-for="i in 4" :key="i" class="playlist-item skeleton">
            <view class="pl-cover skeleton-box" />
            <view class="pl-info">
              <view class="skeleton-line" style="width: 60%;" />
              <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
            </view>
          </view>
        </view>
        <view v-else-if="!collectedPlaylists.length" class="empty">
          <text class="empty-text">暂无收藏的歌单</text>
        </view>
        <view v-else class="playlist-list">
          <view
            v-for="item in collectedPlaylists"
            :key="item.listid"
            class="playlist-item"
            @click="goToPlaylist(item)"
          >
            <image class="pl-cover" :src="getCover(item.pic || '', 120)" mode="aspectFill" />
            <view class="pl-info">
              <text class="pl-name">{{ item.name }}</text>
              <text class="pl-count">{{ item.count || 0 }} 首</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 收藏专辑 -->
      <view v-if="activeTab === 'albums'">
        <view v-if="playlistLoading" class="playlist-list">
          <view v-for="i in 4" :key="i" class="playlist-item skeleton">
            <view class="pl-cover skeleton-box" />
            <view class="pl-info">
              <view class="skeleton-line" style="width: 60%;" />
              <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
            </view>
          </view>
        </view>
        <view v-else-if="!collectedAlbums.length" class="empty">
          <text class="empty-text">暂无收藏的专辑</text>
        </view>
        <view v-else class="playlist-list">
          <view
            v-for="item in collectedAlbums"
            :key="item.listid"
            class="playlist-item"
            @click="goToPlaylist(item)"
          >
            <image class="pl-cover" :src="getCover(item.pic || '', 120)" mode="aspectFill" />
            <view class="pl-info">
              <text class="pl-name">{{ item.name }}</text>
              <text class="pl-count">{{ item.count || 0 }} 首</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 关注歌手 -->
      <view v-if="activeTab === 'artists'">
        <view v-if="artistLoading" class="artist-grid">
          <view v-for="i in 6" :key="i" class="artist-card skeleton">
            <view class="artist-avatar skeleton-box" />
            <view class="skeleton-line" style="margin: 10rpx auto; width: 60%;" />
          </view>
        </view>
        <view v-else-if="!followedArtists.length" class="empty">
          <text class="empty-text">暂无关注的歌手</text>
        </view>
        <view v-else class="artist-grid">
          <view
            v-for="item in followedArtists"
            :key="item.singerid"
            class="artist-card"
            @click="goToArtist(item)"
          >
            <image class="artist-avatar" :src="getArtistPic(item.pic)" mode="aspectFill" />
            <text class="artist-name">{{ item.nickname }}</text>
          </view>
        </view>
      </view>

      <!-- 关注好友 -->
      <view v-if="activeTab === 'friends'">
        <view v-if="artistLoading" class="artist-grid">
          <view v-for="i in 6" :key="i" class="artist-card skeleton">
            <view class="artist-avatar skeleton-box" />
            <view class="skeleton-line" style="margin: 10rpx auto; width: 60%;" />
          </view>
        </view>
        <view v-else-if="!followedFriends.length" class="empty">
          <text class="empty-text">暂无关注的好友</text>
        </view>
        <view v-else class="artist-grid">
          <view
            v-for="item in followedFriends"
            :key="item.userid"
            class="artist-card"
          >
            <image class="artist-avatar" :src="getArtistPic(item.pic)" mode="aspectFill" />
            <text class="artist-name">{{ item.nickname }}</text>
          </view>
        </view>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { useMobileAuthPersist } from '@/stores/auth'
import { getUserDetail, getUserPlaylists, getUserListen, getUserFollow, createPlaylist } from '@/api/user'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatDuration, formatRegTime } from '@sonic-music/shared/utils/time'

const authStore = MoeAuthStore()
const authPersist = useMobileAuthPersist()
const { loadAndPlay } = useAudioPlayer()
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userInfo = computed(() => authStore.UserInfo || {})

const userDetail = ref({})
const activeTab = ref('history')
const tabs = [
  { key: 'history', label: '我喜欢听' },
  { key: 'created', label: '创建歌单' },
  { key: 'collected', label: '收藏歌单' },
  { key: 'albums', label: '收藏专辑' },
  { key: 'artists', label: '关注歌手' },
  { key: 'friends', label: '关注好友' },
]

const history = ref([])
const historyLoading = ref(false)
const createdPlaylists = ref([])
const collectedPlaylists = ref([])
const collectedAlbums = ref([])
const playlistLoading = ref(false)
const followedArtists = ref([])
const followedFriends = ref([])
const artistLoading = ref(false)
let initialized = false

function getSongName(name) {
  if (!name) return ''
  return name.split(' - ')[1] || name
}

function getArtistPic(pic) {
  if (!pic) return ''
  return pic.replace('/100/', '/480/').replace('http://', 'https://')
}

async function fetchUserDetail() {
  try {
    const res = await getUserDetail()
    console.log('[library] detail res:', JSON.stringify(res))
    userDetail.value = res.data || res || {}
    console.log('[library] bg_pic:', userDetail.value.bg_pic)
  } catch (e) {
    console.error('[library] fetchUserDetail error', e)
  }
}

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await getUserListen({ type: 1 })
    const all = res.data?.lists || res.lists || []
    history.value = all.slice(0, 30)
  } catch (e) {
    console.error('[library] fetchHistory error', e)
  } finally {
    historyLoading.value = false
  }
}

async function fetchPlaylists() {
  playlistLoading.value = true
  try {
    const res = await getUserPlaylists({ pagesize: 500, t: Date.now() })
    const all = (res.data?.info || res.info || []).sort((a, b) => a.sort - b.sort)
    const uid = String(userInfo.value.userid || '')
    createdPlaylists.value = all.filter(p => String(p.list_create_userid) === uid)
    collectedPlaylists.value = all.filter(p => String(p.list_create_userid) !== uid && !p.authors)
    collectedAlbums.value = all.filter(p => String(p.list_create_userid) !== uid && p.authors)
  } catch (e) {
    console.error('[library] fetchPlaylists error', e)
  } finally {
    playlistLoading.value = false
  }
}

async function fetchArtists() {
  artistLoading.value = true
  try {
    const res = await getUserFollow()
    const all = res.data?.lists || res.lists || []
    followedArtists.value = all.filter(a => a.source == 7)
    followedFriends.value = all.filter(a => !a.singerid)
  } catch (e) {
    console.error('[library] fetchArtists error', e)
  } finally {
    artistLoading.value = false
  }
}

function switchTab(key) {
  activeTab.value = key
  // 每次切换都重新请求，与 Electron 保持一致
  if (key === 'history') fetchHistory()
  if (['created', 'collected', 'albums'].includes(key)) fetchPlaylists()
  if (['artists', 'friends'].includes(key)) fetchArtists()
}

function onPlaySong(song) {
  loadAndPlay({
    hash: song.hash,
    name: getSongName(song.name),
    author: song.singername,
    img: song.image,
  })
}

async function onCreatePlaylist() {
  uni.showModal({
    title: '新建歌单',
    editable: true,
    placeholderText: '请输入歌单名称',
    success: async (res) => {
      if (!res.confirm || !res.content?.trim()) return
      try {
        const result = await createPlaylist(res.content.trim(), userInfo.value.userid)
        if (result.status === 1) {
          uni.showToast({ title: '创建成功', icon: 'success' })
          fetchPlaylists()
        }
      } catch (e) {
        uni.showToast({ title: '创建失败', icon: 'none' })
      }
    }
  })
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goToPlaylist(item) {
  const id = item.list_create_gid || item.global_collection_id || item.listid
  uni.navigateTo({ url: `/pages/playlist/detail?id=${id}` })
}

function goToArtist(item) {
  uni.navigateTo({ url: `/pages/artist/detail?id=${item.singerid}` })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.$reset()
        authPersist.clear()
        history.value = []
        createdPlaylists.value = []
        collectedPlaylists.value = []
        collectedAlbums.value = []
        followedArtists.value = []
        followedFriends.value = []
        userDetail.value = {}
        initialized = false
        uni.navigateTo({ url: '/pages/login/index' })
      }
    }
  })
}

onShow(() => {
  if (!isLoggedIn.value) {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1]
    if (current?.route === 'pages/library/index') {
      uni.navigateTo({ url: '/pages/login/index' })
    }
    return
  }
  if (initialized) return
  initialized = true
  fetchUserDetail()
  fetchHistory()
  fetchPlaylists()
  fetchArtists()
})
</script>

<style scoped>
.page {
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
/* 未登录 */
.login-prompt {
  display: flex; flex-direction: column; align-items: center;
  padding: 120rpx 40rpx;
}
.login-icon { font-size: 100rpx; margin-bottom: 30rpx; }
.login-title { font-size: 36rpx; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 16rpx; }
.login-desc { font-size: 26rpx; color: var(--text-secondary, #999); margin-bottom: 60rpx; text-align: center; }
.login-btn { background: var(--primary-color, #FF69B4); border-radius: 50rpx; padding: 24rpx 80rpx; }
.login-btn-text { font-size: 30rpx; color: #fff; font-weight: 600; }

/* 用户头部背景图 */
.profile-header {
  position: relative;
  height: 200rpx;
  background: var(--primary-color, #FF69B4);
  margin: 24rpx 24rpx 0;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
}
.profile-bg-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
.profile-header-mask {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  border-radius: 24rpx;
}
.profile-content {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; gap: 20rpx;
  padding: 20rpx 24rpx 16rpx;
}
.avatar {
  width: 100rpx; height: 100rpx; border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.8);
  flex-shrink: 0; background: #f5f5f5;
}
.profile-meta { flex: 1; overflow: hidden; }
.name-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 8rpx; }
.username { font-size: 34rpx; font-weight: 700; color: #fff; text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.3); }
.level-badge {
  font-size: 20rpx; color: #fff;
  background: rgba(255,255,255,0.25);
  border-radius: 20rpx; padding: 2rpx 12rpx; flex-shrink: 0;
}
.bio { display: block; font-size: 24rpx; color: rgba(255,255,255,0.85); margin-bottom: 10rpx; }
.user-meta { display: flex; flex-wrap: wrap; gap: 10rpx; }
.meta-tag {
  font-size: 20rpx; color: #fff;
  background: rgba(255,255,255,0.2);
  border-radius: 20rpx; padding: 4rpx 14rpx;
}
.logout-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid rgba(255,255,255,0.5);
  border-radius: 30rpx; flex-shrink: 0; align-self: flex-start; margin-top: 40rpx;
}
.logout-text { font-size: 24rpx; color: rgba(255,255,255,0.9); }

/* 统计 */
.stats-row {
  display: flex; align-items: center;
  background: #fff; padding: 14rpx 0; margin: 12rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 180, 0.06);
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.stat-num { font-size: 32rpx; font-weight: 700; color: var(--text-primary, #333); }
.stat-label { font-size: 22rpx; color: var(--text-secondary, #999); }
.stat-divider { width: 1rpx; height: 40rpx; background: #eee; }

/* Tabs */
.tabs {
  margin: 0 24rpx 16rpx;
  white-space: nowrap;
}
.tabs-inner {
  display: flex; flex-direction: row; gap: 16rpx; padding: 4rpx 0;
}
.tab { flex-shrink: 0; padding: 14rpx 32rpx; text-align: center; border-radius: 40rpx; background: #fff; box-shadow: 0 2rpx 8rpx rgba(255,105,180,0.06); }
.tab.active { background: var(--primary-color, #FF69B4); }
.tab-text { font-size: 26rpx; color: #999; }
.tab.active .tab-text { color: #fff; font-weight: 600; }

/* 内容区域左右边距 */
.song-list, .playlist-list, .artist-grid, .empty, .create-btn {
  margin: 0 30rpx;
}

/* 创建歌单按钮 */
.create-btn {
  display: flex; align-items: center; gap: 16rpx;
  background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx;
  margin-top: 12rpx; margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(255,105,180,0.08);
  border: 2rpx dashed var(--primary-color, #FF69B4);
}
.create-btn-icon { font-size: 36rpx; color: var(--primary-color, #FF69B4); line-height: 1; }
.create-btn-text { font-size: 28rpx; color: var(--primary-color, #FF69B4); font-weight: 500; }

/* 歌曲列表 */
.song-list { display: flex; flex-direction: column; gap: 8rpx; }
.song-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx; border-radius: 16rpx;
  background: #fff; box-shadow: 0 2rpx 8rpx rgba(255,105,180,0.05);
}
.song-cover { width: 88rpx; height: 88rpx; border-radius: 10rpx; flex-shrink: 0; background: #f5f5f5; }
.song-info { flex: 1; overflow: hidden; }
.song-name {
  display: block; font-size: 28rpx; font-weight: 500;
  color: var(--text-primary, #333); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.song-artist { display: block; font-size: 22rpx; color: var(--text-secondary, #999); margin-top: 6rpx; }

/* 歌单/专辑列表 */
.playlist-list { display: flex; flex-direction: column; gap: 8rpx; }
.playlist-item {
  display: flex; align-items: center; gap: 20rpx;
  background: #fff; border-radius: 16rpx; padding: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 180, 0.05);
}
.pl-cover { width: 88rpx; height: 88rpx; border-radius: 10rpx; flex-shrink: 0; background: #f5f5f5; }
.pl-info { flex: 1; overflow: hidden; }
.pl-name {
  display: block; font-size: 28rpx; font-weight: 500;
  color: var(--text-primary, #333); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pl-count { display: block; font-size: 22rpx; color: var(--text-secondary, #999); margin-top: 6rpx; }
.arrow { font-size: 40rpx; color: #ccc; }

/* 歌手/好友网格 */
.artist-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.artist-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 20rpx 10rpx; background: #fff; border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(255,105,180,0.08);
}
.artist-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: #f5f5f5; margin-bottom: 12rpx; }
.artist-name { font-size: 24rpx; color: var(--text-primary, #333); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

/* 空状态 */
.empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #bbb; }

/* Skeleton */
.skeleton-box {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-line {
  height: 24rpx; border-radius: 4rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
