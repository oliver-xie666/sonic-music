<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">歌词</text>
      <view class="placeholder" />
    </view>

    <view class="cover-area">
      <image class="cover-img" :src="coverUrl" mode="aspectFill" />
      <view class="song-meta">
        <text class="song-name">{{ song?.name || '未在播放' }}</text>
        <text class="song-author">{{ song?.author || '' }}</text>
      </view>
    </view>

    <scroll-view
      class="lyrics-scroll"
      scroll-y
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view class="lyrics-padding" />
      <view v-if="loading" class="lyric-empty">
        <text class="lyric-text">加载中...</text>
      </view>
      <view v-else-if="!lyricsData.length" class="lyric-empty">
        <text class="lyric-text">{{ error || '暂无歌词' }}</text>
      </view>
      <view v-else>
        <view
          v-for="(line, idx) in lyricsData"
          :key="idx"
          :id="`line-${idx}`"
          class="lyric-line"
          :class="{ active: idx === currentLineIndex }"
        >
          <text class="lyric-text">{{ line.characters?.map(c => c.char).join('') || line.text }}</text>
          <text v-if="line.translated" class="lyric-translated">{{ line.translated }}</text>
        </view>
      </view>
      <view class="lyrics-padding" />
    </scroll-view>

    <view class="controls">
      <view class="ctrl-btn" @click="onPrev">
        <text class="ctrl-icon">⏮</text>
      </view>
      <view class="ctrl-btn play-btn" @click="onTogglePlay">
        <text class="ctrl-icon">{{ isPlaying ? '⏸' : '▶' }}</text>
      </view>
      <view class="ctrl-btn" @click="onNext">
        <text class="ctrl-icon">⏭</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useLyrics } from '@/composables/useLyrics'
import { getCover } from '@sonic-music/shared/utils/cover'

const playerStore = usePlayerStore()
const { playPrev, playNext, togglePlay } = useAudioPlayer()
const { lyricsData, currentLineIndex, loading, error, fetchLyrics, updateCurrentLine } = useLyrics()

const song = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const coverUrl = computed(() => getCover(song.value?.img || song.value?.cover || '', 400))
const scrollTop = ref(0)

watch(currentLineIndex, (idx) => {
  if (idx < 0) return
  const query = uni.createSelectorQuery()
  query.select(`#line-${idx}`).boundingClientRect()
  query.selectViewport().scrollOffset()
  query.exec((res) => {
    if (res[0] && res[1]) {
      const lineTop = res[0].top + res[1].scrollTop
      const viewHeight = res[1].height || 400
      scrollTop.value = lineTop - viewHeight / 2 + res[0].height / 2
    }
  })
})

watch(() => playerStore.currentTime, (t) => {
  updateCurrentLine(t)
})

watch(() => song.value?.hash, (hash) => {
  if (hash) fetchLyrics(hash)
})

function onTogglePlay() { togglePlay() }
function onPrev() { playPrev() }
function onNext() { playNext() }

onLoad(() => {
  if (song.value?.hash) fetchLyrics(song.value.hash)
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background-color, #FFF0F5);
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100rpx 30rpx 20rpx;
}
.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon { font-size: 52rpx; color: var(--text-primary, #333); }
.nav-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #333); }
.placeholder { width: 60rpx; }
.cover-area {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 30rpx 30rpx;
}
.cover-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.song-meta { flex: 1; overflow: hidden; }
.song-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-author {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary, #999);
  margin-top: 6rpx;
}
.lyrics-scroll { flex: 1; overflow: hidden; }
.lyrics-padding { height: 200rpx; }
.lyric-line {
  padding: 16rpx 40rpx;
  text-align: center;
  transition: all 0.3s;
}
.lyric-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary, #999);
  line-height: 1.6;
}
.lyric-line.active .lyric-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--primary-color, #FF69B4);
}
.lyric-translated {
  display: block;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 4rpx;
}
.lyric-empty { padding: 80rpx 40rpx; text-align: center; }
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60rpx;
  padding: 30rpx 0 60rpx;
}
.ctrl-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ctrl-icon { font-size: 44rpx; color: var(--text-primary, #333); }
.play-btn .ctrl-icon { font-size: 56rpx; color: var(--primary-color, #FF69B4); }
</style>
