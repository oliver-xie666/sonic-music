/**
 * useLyrics - 歌词管理（mobile 专用）
 * 解析逻辑复用 shared/utils/lyrics.js
 */
import { ref, computed } from 'vue'
import { parseLyrics, getCurrentLineIndex } from '@sonic-music/shared/utils/lyrics'
import { usePlayerStore } from '@/stores/player'
import { get } from '@/api/client'

export function useLyrics() {
  const playerStore = usePlayerStore()
  const lyricsData = ref([])
  const currentLineIndex = ref(-1)
  const loading = ref(false)
  const error = ref('')

  const currentLine = computed(() => lyricsData.value[currentLineIndex.value] || null)

  async function fetchLyrics(hash) {
    if (!hash) return
    loading.value = true
    error.value = ''
    lyricsData.value = []
    try {
      const searchRes = await get('/search/lyric', { hash })
      if (searchRes.status !== 200 || !searchRes.candidates?.length) {
        error.value = '暂无歌词'
        return
      }
      const { id, accesskey } = searchRes.candidates[0]
      const lyricRes = await get('/lyric', { id, accesskey, fmt: 'krc', decode: true })
      if (lyricRes.status !== 200) {
        error.value = '获取歌词失败'
        return
      }
      lyricsData.value = parseLyrics(lyricRes.decodeContent, true)
      playerStore.setLyrics(lyricsData.value)
    } catch (e) {
      console.error('[useLyrics] fetchLyrics error', e)
      error.value = '获取歌词失败'
    } finally {
      loading.value = false
    }
  }

  function updateCurrentLine(currentTimeSec) {
    if (!lyricsData.value.length) return
    const idx = getCurrentLineIndex(lyricsData.value, currentTimeSec * 1000)
    if (idx !== currentLineIndex.value) {
      currentLineIndex.value = idx
      playerStore.setCurrentLyricIndex(idx)
    }
  }

  function clearLyrics() {
    lyricsData.value = []
    currentLineIndex.value = -1
    error.value = ''
    playerStore.setLyrics([])
    playerStore.setCurrentLyricIndex(-1)
  }

  return {
    lyricsData,
    currentLineIndex,
    currentLine,
    loading,
    error,
    fetchLyrics,
    updateCurrentLine,
    clearLyrics,
  }
}
