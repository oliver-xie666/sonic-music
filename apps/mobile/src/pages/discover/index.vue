<template>
  <view class="page">
    <!-- 排行榜入口 -->
    <view class="section">
      <text class="section-title">排行榜</text>
      <view class="ranking-entry" @click="goToRanking">
        <view class="ranking-icon">🏆</view>
        <view class="ranking-info">
          <text class="ranking-name">音乐排行榜</text>
          <text class="ranking-desc">实时热歌榜、飙升榜、新歌榜</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="section">
      <text class="section-title">推荐歌单</text>

      <!-- 主分类 -->
      <scroll-view class="cat-scroll" scroll-x>
        <view class="cat-row">
          <view
            v-for="(cat, idx) in mainCategories"
            :key="idx"
            class="cat-tag"
            :class="{ active: mainIndex === idx }"
            @click="onSelectMain(idx)"
          >
            <text class="cat-text">{{ cat.tag_name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 子分类 -->
      <scroll-view v-if="subCategories.length" class="cat-scroll" scroll-x>
        <view class="cat-row">
          <view
            v-for="(sub, idx) in subCategories"
            :key="sub.tag_id"
            class="cat-tag sub"
            :class="{ active: subIndex === idx }"
            @click="onSelectSub(idx)"
          >
            <text class="cat-text">{{ sub.tag_name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 歌单网格 -->
      <view v-if="loading" class="playlist-grid">
        <view v-for="i in 6" :key="i" class="playlist-card skeleton">
          <view class="playlist-cover skeleton-box" />
          <view class="skeleton-line" style="margin: 12rpx 14rpx; width: 70%;" />
        </view>
      </view>
      <view v-else class="playlist-grid">
        <view
          v-for="item in playlists"
          :key="item.global_collection_id || item.id"
          class="playlist-card"
          @click="goToPlaylist(item)"
        >
          <image class="playlist-cover" :src="getCover(item.flexible_cover || item.img || item.cover || '', 240)" mode="aspectFill" />
          <text class="playlist-name">{{ item.specialname || item.name }}</text>
        </view>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getPlaylistList, getPlaylistTags } from '@/api/playlist'
import { getCover } from '@sonic-music/shared/utils/cover'

const playlists = ref([])
const loading = ref(true)
const page = ref(1)
const hasMore = ref(true)

const categories = ref([])
const mainIndex = ref(0)
const subIndex = ref(0)

const mainCategories = computed(() => {
  return [{ tag_name: '全部', son: [] }, ...categories.value]
})

const subCategories = computed(() => {
  const main = mainCategories.value[mainIndex.value]
  if (!main || !main.son?.length) return []
  return [{ tag_id: '', tag_name: '全部' }, ...main.son]
})

const activeTagId = computed(() => {
  if (subCategories.value.length && subIndex.value > 0) {
    return subCategories.value[subIndex.value].tag_id
  }
  const main = mainCategories.value[mainIndex.value]
  return main?.tag_id || ''
})

async function fetchTags() {
  try {
    const res = await getPlaylistTags()
    categories.value = res.data || res.list || res || []
  } catch (e) {
    console.error('[discover] fetchTags error', e)
  }
}

async function fetchPlaylists(reset = false) {
  if (reset) {
    page.value = 1
    hasMore.value = true
    playlists.value = []
  }
  if (!hasMore.value) return
  loading.value = true
  try {
    const params = { page: page.value, pagesize: 12 }
    if (activeTagId.value) params.category_id = activeTagId.value
    const res = await getPlaylistList(params)
    const list = res.data?.special_list || res.data || res.list || []
    if (list.length < 12) hasMore.value = false
    playlists.value = reset ? list : [...playlists.value, ...list]
    page.value++
  } catch (e) {
    console.error('[discover] fetchPlaylists error', e)
  } finally {
    loading.value = false
  }
}

function onSelectMain(idx) {
  mainIndex.value = idx
  subIndex.value = 0
  fetchPlaylists(true)
}

function onSelectSub(idx) {
  subIndex.value = idx
  fetchPlaylists(true)
}

function goToRanking() {
  uni.navigateTo({ url: '/pages/ranking/index' })
}

function goToPlaylist(item) {
  const id = item.global_collection_id || item.id || item.playlist_id
  uni.navigateTo({ url: `/pages/playlist/detail?id=${id}` })
}

onLoad(async () => {
  await fetchTags()
  fetchPlaylists(true)
})

onReachBottom(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.page {
  padding: 30rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.section {
  margin-bottom: 50rpx;
}
.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 24rpx;
}
.ranking-entry {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.1);
}
.ranking-icon {
  font-size: 56rpx;
  width: 80rpx;
  text-align: center;
}
.ranking-info {
  flex: 1;
}
.ranking-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
}
.ranking-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.arrow {
  font-size: 40rpx;
  color: #ccc;
}
.cat-scroll {
  width: 100%;
  margin-bottom: 16rpx;
}
.cat-row {
  display: flex;
  gap: 12rpx;
  padding-bottom: 4rpx;
}
.cat-tag {
  flex-shrink: 0;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
}
.cat-tag.sub {
  padding: 8rpx 20rpx;
  background: #fafafa;
}
.cat-tag.active {
  background: var(--primary-color, #FF69B4);
}
.cat-text {
  font-size: 26rpx;
  color: var(--text-secondary, #999);
}
.cat-tag.active .cat-text {
  color: #fff;
  font-weight: 600;
}
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.playlist-card {
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(255, 105, 180, 0.08);
}
.playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
}
.playlist-name {
  display: block;
  font-size: 22rpx;
  color: var(--text-primary, #333);
  padding: 10rpx 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skeleton-box {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-line {
  height: 22rpx;
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
