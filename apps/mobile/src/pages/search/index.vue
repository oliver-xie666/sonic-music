<template>
  <view class="page">
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索歌曲、歌手、歌单"
          confirm-type="search"
          @confirm="onSearch"
          @input="onInput"
        />
        <text v-if="keyword" class="clear-btn" @click="clearKeyword">✕</text>
      </view>
    </view>

    <view v-if="!keyword">
      <view class="section">
        <text class="section-title">热门搜索</text>
        <view v-if="loadingHot" class="hot-list">
          <view v-for="i in 8" :key="i" class="hot-tag skeleton-tag" />
        </view>
        <view v-else class="hot-list">
          <view
            v-for="item in hotList"
            :key="item.keyword"
            class="hot-tag"
            @click="onHotClick(item.keyword)"
          >
            <text class="hot-text">{{ item.keyword }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="suggest-list">
      <view
        v-for="item in suggestList"
        :key="item"
        class="suggest-item"
        @click="onHotClick(item)"
      >
        <text class="suggest-icon">🔍</text>
        <text class="suggest-text">{{ item }}</text>
      </view>
    </view>

    <view style="height: 160rpx;" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHotSearch } from '@/api/search'

const keyword = ref('')
const hotList = ref([])
const suggestList = ref([])
const loadingHot = ref(true)

async function fetchHot() {
  loadingHot.value = true
  try {
    const res = await getHotSearch()
    hotList.value = (res.data || res.list || []).slice(0, 16)
  } catch (e) {
    console.error('[search] fetchHot error', e)
  } finally {
    loadingHot.value = false
  }
}

function onInput() {
  if (!keyword.value.trim()) {
    suggestList.value = []
    return
  }
  suggestList.value = hotList.value
    .map(h => h.keyword)
    .filter(k => k.includes(keyword.value))
    .slice(0, 6)
}

function onSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  uni.navigateTo({ url: `/pages/search/result?keyword=${encodeURIComponent(kw)}` })
}

function onHotClick(kw) {
  keyword.value = kw
  onSearch()
}

function clearKeyword() {
  keyword.value = ''
  suggestList.value = []
}

onLoad(() => {
  fetchHot()
})
</script>

<style scoped>
.page {
  padding: 20rpx 30rpx 0;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.search-bar {
  padding: 20rpx 0 30rpx;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 80rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 105, 180, 0.1);
}
.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 80rpx;
}
.clear-btn {
  font-size: 28rpx;
  color: #bbb;
  padding: 0 8rpx;
}
.section {
  margin-bottom: 40rpx;
}
.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 20rpx;
}
.hot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.hot-tag {
  padding: 12rpx 28rpx;
  background: #fff;
  border-radius: 50rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 180, 0.1);
}
.hot-text {
  font-size: 26rpx;
  color: var(--text-primary, #333);
}
.skeleton-tag {
  width: 120rpx;
  height: 52rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.suggest-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.suggest-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.suggest-icon {
  font-size: 28rpx;
  color: #bbb;
}
.suggest-text {
  font-size: 28rpx;
  color: var(--text-primary, #333);
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
