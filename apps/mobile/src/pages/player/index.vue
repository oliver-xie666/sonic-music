<template>
  <view class="player-page">
    <image class="bg-cover" :src="coverUrl" mode="aspectFill" />
    <view class="bg-mask" />

    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-title">
        <text class="song-name">{{ song.name || '未在播放' }}</text>
        <text class="song-author">{{ song.author || '' }}</text>
      </view>
      <view class="placeholder" />
    </view>

    <view class="cover-area" @click="toggleLyricsView">
      <view v-if="!showLyrics" class="cover-wrap">
        <image class="cover-img" :src="coverUrl" mode="aspectFill" />
      </view>
      <scroll-view v-else class="lyrics-scroll" scroll-y :scroll-top="lyricsScrollTop" scroll-with-animation>
        <view class="lyrics-padding" />
        <view
          v-for="(line, idx) in lyricsData"
          :key="idx"
          class="lyric-line"
          :class="{ active: idx === currentLineIndex }"
        >
          <text class="lyric-text">{{ line.characters.map(c => c.char).join('') }}</text>
          <text v-if="line.translated" class="lyric-translated">{{ line.translated }}</text>
        </view>
        <view v-if="!lyricsData.length" class="lyric-empty">
          <text class="lyric-text">{{ lyricsError || '暂无歌词' }}</text>
        </view>
        <view class="lyrics-padding" />
      </scroll-view>
    </view>

    <view class="progress-area">
      <text class="time">{{ formatSeconds(playerStore.currentTime) }}</text>
      <ProgressSlider
        :current="playerStore.currentTime"
        :total="playerStore.duration"
        activeColor="rgba(255,255,255,0.9)"
        @seek="onSeek"
      />
      <text class="time">{{ formatSeconds(playerStore.duration) }}</text>
    </view>

    <PlayerControls
      :isPlaying="playerStore.isPlaying"
      @togglePlay="togglePlay"
      @prev="playPrev"
      @next="playNext"
      @openQueue="showQueue = true"
    />

    <view v-if="showQueue" class="queue-mask" @click="showQueue = false">
      <view class="queue-drawer" @click.stop>
        <text class="queue-title">播放队列 ({{ queue.length }})</text>
        <scroll-view class="queue-list" scroll-y>
          <view
            v-for="item in queue"
            :key="item.hash"
            class="queue-item"
            :class="{ playing: item.hash === song.hash }"
            @click="onPlayQueueItem(item)"
          >
            <text class="queue-name">{{ item.name }}</text>
            <text class="queue-author">{{ item.author }}</text>
          </view>
        </scroll-view>
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
import { useQueue } from '@sonic-music/shared/composables/useQueue'
import { getCover } from '@sonic-music/shared/utils/cover'
import { formatSeconds } from '@sonic-music/shared/utils/time'
import ProgressSlider from '@/components/player/ProgressSlider.vue'
import PlayerControls from '@/components/player/PlayerControls.vue'

const playerStore = usePlayerStore()
const { togglePlay, seek, playNext, playPrev, playSong, loadAndPlay } = useAudioPlayer()
const { lyricsData, currentLineIndex, error: lyricsError, fetchLyrics, updateCurrentLine } = useLyrics()
const { queue } = useQueue()

const showLyrics = ref(false)
const showQueue = ref(false)
const lyricsScrollTop = ref(0)

const song = computed(() => playerStore.currentSong || {})
const coverUrl = computed(() => getCover(song.value.img || '', 480))

function goBack() { uni.navigateBack() }
function toggleLyricsView() { showLyrics.value = !showLyrics.value }
function onSeek(time) { seek(time) }

function onPlayQueueItem(item) {
  showQueue.value = false
  if (item.url) playSong(item)
  else loadAndPlay(item)
}

watch(currentLineIndex, (idx) => {
  if (idx < 0) return
  lyricsScrollTop.value = Math.max(0, idx * 80 - 300)
})

watch(() => playerStore.currentTime, (t) => {
  updateCurrentLine(t)
})

watch(() => song.value.hash, (hash) => {
  if (hash) fetchLyrics(hash)
}, { immediate: true })

onLoad(() => {
  if (song.value.hash) fetchLyrics(song.value.hash)
})
</script>

<style scoped>
.player-page {
  min-height: 100vh;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.bg-cover {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  opacity: 0.4;
  transform: scale(1.2);
}
.bg-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}
.nav-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 100rpx 32rpx 20rpx;
}
.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
}
.back-icon {
  font-size: 64rpx;
  color: #fff;
  line-height: 1;
}
.nav-title {
  flex: 1;
  text-align: center;
}
.song-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}
.song-author {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.65);
  margin-top: 4rpx;
}
.placeholder { width: 60rpx; }
.cover-area {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}
.cover-wrap {
  width: 560rpx;
  height: 560rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.5);
}
.cover-img { width: 100%; height: 100%; }
.lyrics-scroll { width: 100%; height: 560rpx; }
.lyrics-padding { height: 200rpx; }
.lyric-line {
  padding: 16rpx 40rpx;
  text-align: center;
}
.lyric-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
}
.lyric-translated {
  display: block;
  font-size: 22rpx;
  color: rgba(255,255,255,0.3);
  margin-top: 4rpx;
}
.lyric-line.active .lyric-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
.lyric-line.active .lyric-translated {
  color: rgba(255,255,255,0.65);
}
.lyric-empty { padding: 40rpx; text-align: center; }
.progress-area {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  gap: 16rpx;
}
.time {
  font-size: 22rpx;
  color: rgba(255,255,255,0.65);
  flex-shrink: 0;
  width: 80rpx;
  text-align: center;
}
.queue-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.queue-drawer {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
}
.queue-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}
.queue-list { flex: 1; max-height: 55vh; }
.queue-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--border-color);
}
.queue-item.playing .queue-name { color: var(--primary-color); }
.queue-name { display: block; font-size: 28rpx; color: #333; }
.queue-author { display: block; font-size: 22rpx; color: #999; margin-top: 4rpx; }
</style>
