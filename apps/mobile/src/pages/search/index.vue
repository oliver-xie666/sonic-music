<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <svg class="back-svg" viewBox="0 0 256 512"><path fill="currentColor" d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"/></svg>
      </view>
      <view class="search-input-wrap">
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索歌曲、歌手、歌单"
          confirm-type="search"
          @confirm="onSearch"
          @input="onInput"
        />
        <text v-if="keyword" class="clear-btn" @click="clearKeyword">✕</text>
        <view class="search-suffix" @click="onSearch">
          <svg class="svg-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>
        </view>
      </view>
    </view>

    <view v-if="!keyword" class="content">
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
        <svg class="suggest-svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>
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

function goBack() {
  uni.navigateBack()
}

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
  padding: 0 30rpx;
  background: var(--background-color, #FFF0F5);
  min-height: 100vh;
}
.nav-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-top: calc(env(safe-area-inset-top) + 16rpx);
  padding-bottom: 20rpx;
}
.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.back-svg {
  width: 40rpx;
  height: 40rpx;
  color: var(--primary-color, #FF69B4);
}
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 50rpx;
  padding: 0 16rpx 0 24rpx;
  height: 80rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 105, 180, 0.1);
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
.search-suffix {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.svg-icon {
  width: 34rpx;
  height: 34rpx;
  color: var(--primary-color, #FF69B4);
}
.content {
  padding-top: 16rpx;
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
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.suggest-svg {
  width: 28rpx;
  height: 28rpx;
  color: #bbb;
  flex-shrink: 0;
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
