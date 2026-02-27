<template>
  <view class="page">
    <view class="result-header">
      <text class="keyword">{{ keyword }}</text>
    </view>

    <!-- 类型 Tab -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.type"
        class="tab"
        :class="{ active: activeTab === tab.type }"
        @click="onSwitchTab(tab.type)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view v-if="activeTab === 'song'">
      <view v-if="songLoading && !songs.length" class="song-list">
        <view v-for="i in 6" :key="i" class="song-item skeleton">
          <view class="song-cover skeleton-box" />
          <view class="song-info">
            <view class="skeleton-line" style="width: 60%;" />
            <view class="skeleton-line" style="width: 40%; margin-top: 8rpx;" />
          </view>
        </view>
      </view>
      <view v-else-if="!songs.length && !songLoading" class="empty">
        <text class="empty-text">没有找到相关歌曲</text>
      </view>
      <view v-else class="song-list">
        <view
          v-for="(song, idx) in songs"
          :key="song.hash"
          class="song-item"
          :class="{ playing: currentSong?.hash === song.hash }"
          @click="onPlay(song)"
        >
          <text class="index">{{ idx + 1 }}</text>
          <image class="song-cover" :src="getCover(song.Image || song.cover || '', 120)" mode="aspectFill" />
          <view class="song-info">
            <text class="song-name">{{ song.OriSongName || song.filename || song.name }}</text>
            <text class="song-artist">{{ song.SingerName || song.singername }}</text>
          </view>
          <text class="duration">{{ formatSeconds(song.Duration) }}</text>
        </view>
        <view v-if="songLoading" class="loading-more"><text class="loading-text">加载中...</text></view>
        <view v-else-if="!songHasMore" class="no-more"><text class="no-more-text">没有更多了</text></view>
      </view>
    </view>

    <!-- 歌单列表 -->
    <view v-if="activeTab === 'special'">
      <view v-if="specialLoading && !specials.length" class="grid-2">
        <view v-for="i in 4" :key="i" class="grid-card skeleton">
          <view class="grid-cover skeleton-box" />
          <view class="skeleton-line" style="margin: 10rpx 12rpx; width: 70%;" />
        </view>
      </view>
      <view v-else-if="!specials.length && !specialLoading" class="empty">
        <text class="empty-text">没有找到相关歌单</text>
      </view>
      <view v-else class="grid-2">
        <view
          v-for="item in specials"
          :key="item.gid || item.global_collection_id"
          class="grid-card"
          @click="goToPlaylist(item)"
        >
          <image class="grid-cover" :src="getCover(item.cover || '', 240)" mode="aspectFill" />
          <text class="grid-name">{{ item.specialname || item.name }}</text>
        </view>
      </view>
      <view v-if="!specialLoading && !specialHasMore && specials.length" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>

    <!-- 专辑列表 -->
    <view v-if="activeTab === 'album'">
      <view v-if="albumLoading && !albums.length" class="grid-2">
        <view v-for="i in 4" :key="i" class="grid-card skeleton">
          <view class="grid-cover skeleton-box" />
          <view class="skeleton-line" style="margin: 10rpx 12rpx; width: 70%;" />
        </view>
      </view>
      <view v-else-if="!albums.length && !albumLoading" class="empty">
        <text class="empty-text">没有找到相关专辑</text>
      </view>
      <view v-else class="grid-2">
        <view
          v-for="item in albums"
          :key="item.albumid"
          class="grid-card"
          @click="goToAlbum(item)"
        >
          <image class="grid-cover" :src="getCover(item.cover || '', 240)" mode="aspectFill" />
          <text class="grid-name">{{ item.albumname }}</text>
          <text class="grid-sub">{{ item.singername }}</text>
        </view>
      </view>
      <view v-if="!albumLoading && !albumHasMore && albums.length" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>

    <!-- 歌手列表 -->
    <view v-if="activeTab === 'author'">
      <view v-if="authorLoading && !authors.length" class="grid-3">
        <view v-for="i in 6" :key="i" class="artist-card skeleton">
          <view class="artist-avatar skeleton-box" />
          <view class="skeleton-line" style="margin: 10rpx auto; width: 60%;" />
        </view>
      </view>
      <view v-else-if="!authors.length && !authorLoading" class="empty">
        <text class="empty-text">没有找到相关歌手</text>
      </view>
      <view v-else class="grid-3">
        <view
          v-for="item in authors"
          :key="item.AuthorId"
          class="artist-card"
          @click="goToArtist(item)"
        >
          <image class="artist-avatar" :src="item.AuthorPicUrl || ''" mode="aspectFill" />
          <text class="artist-name">{{ item.AuthorName }}</text>
        </view>
      </view>
      <view v-if="!authorLoading && !authorHasMore && authors.length" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { search } from '@/api/search'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatSeconds } from '@sonic-music/shared/utils/time'

const playerStore = usePlayerStore()
const { loadAndPlay } = useAudioPlayer()
const currentSong = computed(() => playerStore.currentSong)

const keyword = ref('')
const activeTab = ref('song')

const tabs = [
  { type: 'song', label: '歌曲' },
  { type: 'special', label: '歌单' },
  { type: 'album', label: '专辑' },
  { type: 'author', label: '歌手' },
]

const songs = ref([])
const songPage = ref(1)
const songLoading = ref(false)
const songHasMore = ref(true)

const specials = ref([])
const specialPage = ref(1)
const specialLoading = ref(false)
const specialHasMore = ref(true)

const albums = ref([])
const albumPage = ref(1)
const albumLoading = ref(false)
const albumHasMore = ref(true)

const authors = ref([])
const authorPage = ref(1)
const authorLoading = ref(false)
const authorHasMore = ref(true)

async function fetchSongs(reset = false) {
  if (songLoading.value || (!songHasMore.value && !reset)) return
  if (reset) { songPage.value = 1; songs.value = []; songHasMore.value = true }
  songLoading.value = true
  try {
    const res = await search({ keyword: keyword.value, page: songPage.value, pagesize: 20, type: 'song' })
    const list = res.data?.lists || res.lists || res.list || []
    const mapped = list.map(s => ({ ...s, hash: s.HQFileHash || s.SQFileHash || s.FileHash || s.hash }))
    songs.value.push(...mapped)
    songHasMore.value = list.length === 20
    songPage.value++
  } catch (e) {
    console.error('[search/result] fetchSongs error', e)
  } finally {
    songLoading.value = false
  }
}

async function fetchSpecials(reset = false) {
  if (specialLoading.value || (!specialHasMore.value && !reset)) return
  if (reset) { specialPage.value = 1; specials.value = []; specialHasMore.value = true }
  specialLoading.value = true
  try {
    const res = await search({ keyword: keyword.value, page: specialPage.value, pagesize: 20, type: 'special' })
    const list = res.data?.lists || res.lists || res.list || []
    specials.value.push(...list)
    specialHasMore.value = list.length === 20
    specialPage.value++
  } catch (e) {
    console.error('[search/result] fetchSpecials error', e)
  } finally {
    specialLoading.value = false
  }
}

async function fetchAlbums(reset = false) {
  if (albumLoading.value || (!albumHasMore.value && !reset)) return
  if (reset) { albumPage.value = 1; albums.value = []; albumHasMore.value = true }
  albumLoading.value = true
  try {
    const res = await search({ keyword: keyword.value, page: albumPage.value, pagesize: 20, type: 'album' })
    const list = res.data?.lists || res.lists || res.list || []
    albums.value.push(...list)
    albumHasMore.value = list.length === 20
    albumPage.value++
  } catch (e) {
    console.error('[search/result] fetchAlbums error', e)
  } finally {
    albumLoading.value = false
  }
}

async function fetchAuthors(reset = false) {
  if (authorLoading.value || (!authorHasMore.value && !reset)) return
  if (reset) { authorPage.value = 1; authors.value = []; authorHasMore.value = true }
  authorLoading.value = true
  try {
    const res = await search({ keyword: keyword.value, page: authorPage.value, pagesize: 20, type: 'author' })
    const list = res.data?.lists || res.lists || res.list || []
    authors.value.push(...list)
    authorHasMore.value = list.length === 20
    authorPage.value++
  } catch (e) {
    console.error('[search/result] fetchAuthors error', e)
  } finally {
    authorLoading.value = false
  }
}

function onSwitchTab(type) {
  activeTab.value = type
  if (type === 'song' && !songs.value.length) fetchSongs(true)
  if (type === 'special' && !specials.value.length) fetchSpecials(true)
  if (type === 'album' && !albums.value.length) fetchAlbums(true)
  if (type === 'author' && !authors.value.length) fetchAuthors(true)
}

function onPlay(song) { loadAndPlay(song) }
function goToPlaylist(item) {
  uni.navigateTo({ url: `/pages/playlist/detail?id=${item.gid || item.global_collection_id}` })
}
function goToAlbum(item) {
  uni.navigateTo({ url: `/pages/album/detail?id=${item.albumid}` })
}
function goToArtist(item) {
  uni.navigateTo({ url: `/pages/artist/detail?id=${item.AuthorId}` })
}

onLoad((options) => {
  keyword.value = decodeURIComponent(options.keyword || '')
  if (keyword.value) fetchSongs(true)
})

onReachBottom(() => {
  if (activeTab.value === 'song' && songHasMore.value) fetchSongs()
  if (activeTab.value === 'special' && specialHasMore.value) fetchSpecials()
  if (activeTab.value === 'album' && albumHasMore.value) fetchAlbums()
  if (activeTab.value === 'author' && authorHasMore.value) fetchAuthors()
})
</script>

<style scoped>
.page {
  padding: 20rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.result-header { padding: 20rpx 0 16rpx; }
.keyword {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary, #333);
}
.tabs {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}
.tab { flex: 1; padding: 20rpx 0; text-align: center; }
.tab.active { border-bottom: 4rpx solid var(--primary-color, #FF69B4); }
.tab-text { font-size: 26rpx; color: #999; }
.tab.active .tab-text { color: var(--primary-color, #FF69B4); font-weight: 600; }
.song-list { display: flex; flex-direction: column; gap: 8rpx; }
.song-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx; border-radius: 16rpx;
  background: #fff; box-shadow: 0 2rpx 8rpx rgba(255,105,180,0.05);
}
.song-item.playing { background: rgba(255,105,180,0.06); }
.index { width: 40rpx; font-size: 24rpx; color: #bbb; text-align: center; flex-shrink: 0; }
.song-cover { width: 88rpx; height: 88rpx; border-radius: 10rpx; flex-shrink: 0; background: #f5f5f5; }
.song-info { flex: 1; overflow: hidden; }
.song-name {
  display: block; font-size: 28rpx; font-weight: 500;
  color: var(--text-primary, #333); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.song-artist { display: block; font-size: 22rpx; color: var(--text-secondary, #999); margin-top: 6rpx; }
.duration { font-size: 22rpx; color: #bbb; flex-shrink: 0; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.grid-card { border-radius: 12rpx; overflow: hidden; background: #fff; box-shadow: 0 2rpx 10rpx rgba(255,105,180,0.08); }
.grid-cover { width: 100%; aspect-ratio: 1; background: #f5f5f5; }
.grid-name {
  display: block; font-size: 24rpx; color: var(--text-primary, #333);
  padding: 10rpx 12rpx 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.grid-sub {
  display: block; font-size: 20rpx; color: var(--text-secondary, #999);
  padding: 0 12rpx 10rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.artist-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 20rpx 10rpx; background: #fff; border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(255,105,180,0.08);
}
.artist-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: #f5f5f5; margin-bottom: 12rpx; }
.artist-name { font-size: 24rpx; color: var(--text-primary, #333); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.empty { padding: 120rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #bbb; }
.loading-more, .no-more { padding: 30rpx; text-align: center; }
.loading-text, .no-more-text { font-size: 24rpx; color: #bbb; }
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
