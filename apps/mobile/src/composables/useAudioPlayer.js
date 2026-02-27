/**
 * useAudioPlayer - mobile 音频播放器（uni-app 专用）
 * H5: uni.createInnerAudioContext
 * APP: uni.getBackgroundAudioManager
 */
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useQueue } from '@sonic-music/shared/composables/useQueue'
import { usePlaybackMode } from '@sonic-music/shared/composables/usePlaybackMode'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { getSongUrl } from '@/api/song'

let _audio = null

function createAudio() {
  // #ifdef APP-PLUS
  return uni.getBackgroundAudioManager()
  // #endif
  // #ifdef H5
  return uni.createInnerAudioContext()
  // #endif
}

function getAudio() {
  if (!_audio) _audio = createAudio()
  return _audio
}

export function useAudioPlayer() {
  const playerStore = usePlayerStore()
  const settingsStore = useSettingsStore()
  const { queue, getIndexByHash, getSongByIndex, addAfterCurrent } = useQueue()
  const { playMode, getNextIndex, getPrevIndex } = usePlaybackMode()
  const loading = ref(false)

  const audio = getAudio()

  // 直接播放已有 url 的 song 对象
  function playSong(song) {
    if (!song || !song.url) return
    playerStore.setCurrentSong(song)
    playerStore.setCurrentTime(0)
    playerStore.setDuration(song.timeLength ? Math.floor(song.timeLength / 1000) : 0)
    audio.src = song.url
    // #ifdef APP-PLUS
    audio.title = song.name || ''
    audio.singer = song.author || ''
    audio.coverImgUrl = song.img || ''
    // #endif
    audio.play()
  }

  // 通过 hash 获取 url 后播放
  async function loadAndPlay(songInfo) {
    if (!songInfo?.hash) return false
    loading.value = true
    try {
      const quality = settingsStore.quality || 'standard'
      const res = await getSongUrl(songInfo.hash, quality)
      if (res.status !== 1 || !res.url?.[0]) {
        uni.showToast({ title: '获取音乐失败', icon: 'none' })
        return false
      }
      const song = {
        hash: songInfo.hash,
        name: songInfo.name || songInfo.filename || '',
        author: songInfo.author || songInfo.singername || '',
        img: (songInfo.img || songInfo.cover || '').replace('{size}', '480').replace('http://', 'https://'),
        url: res.url[0],
        timeLength: res.timeLength || songInfo.timelen || 0,
      }
      addAfterCurrent(song, playerStore.currentSong?.hash)
      playSong(song)
      return true
    } catch (e) {
      console.error('[useAudioPlayer] loadAndPlay error', e)
      uni.showToast({ title: '播放失败', icon: 'none' })
      return false
    } finally {
      loading.value = false
    }
  }

  function togglePlay() {
    if (playerStore.isPlaying) {
      audio.pause()
    } else {
      if (!audio.src && playerStore.currentSong?.url) {
        audio.src = playerStore.currentSong.url
      }
      audio.play()
    }
  }

  function seek(time) {
    audio.seek(time)
    playerStore.setCurrentTime(time)
  }

  function playNext() {
    const q = queue.value
    if (!q.length) return
    const curIdx = getIndexByHash(playerStore.currentSong?.hash)
    const nextIdx = getNextIndex(curIdx === -1 ? 0 : curIdx, q.length)
    const next = getSongByIndex(nextIdx)
    if (!next) return
    if (next.url) playSong(next)
    else loadAndPlay(next)
  }

  function playPrev() {
    const q = queue.value
    if (!q.length) return
    const curIdx = getIndexByHash(playerStore.currentSong?.hash)
    const prevIdx = getPrevIndex(curIdx === -1 ? 0 : curIdx, q.length)
    const prev = getSongByIndex(prevIdx)
    if (!prev) return
    if (prev.url) playSong(prev)
    else loadAndPlay(prev)
  }

  // 绑定 audio 事件（只绑定一次）
  if (!_audio._bound) {
    _audio._bound = true

    audio.onTimeUpdate(() => {
      playerStore.setCurrentTime(audio.currentTime || 0)
      if (audio.duration && audio.duration !== playerStore.duration) {
        playerStore.setDuration(audio.duration)
      }
    })

    audio.onPlay(() => playerStore.setPlaying(true))
    audio.onPause(() => playerStore.setPlaying(false))
    audio.onStop(() => playerStore.setPlaying(false))

    audio.onEnded(() => {
      playerStore.setPlaying(false)
      playNext()
    })

    audio.onError((e) => {
      console.error('[useAudioPlayer] audio error', e)
      playerStore.setPlaying(false)
      uni.showToast({ title: '播放出错', icon: 'none' })
    })
  }

  return {
    audio,
    loading,
    playSong,
    loadAndPlay,
    togglePlay,
    seek,
    playNext,
    playPrev,
  }
}
