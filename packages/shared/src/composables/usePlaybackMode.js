/**
 * usePlaybackMode - 播放模式管理（共享，平台无关）
 * 模式：sequence（顺序）| random（随机）| loop（单曲循环）
 */
import { ref, computed } from 'vue'

const MODES = ['sequence', 'random', 'loop']
const MODE_LABELS = { sequence: '顺序播放', random: '随机播放', loop: '单曲循环' }

export function usePlaybackMode(initialMode = 'sequence') {
  const playMode = ref(initialMode)
  const modeLabel = computed(() => MODE_LABELS[playMode.value] || '顺序播放')

  function toggleMode() {
    const idx = MODES.indexOf(playMode.value)
    playMode.value = MODES[(idx + 1) % MODES.length]
    return playMode.value
  }

  function setMode(mode) {
    if (MODES.includes(mode)) playMode.value = mode
  }

  // 根据当前模式计算下一首索引
  function getNextIndex(currentIndex, total) {
    if (!total) return -1
    if (playMode.value === 'loop') return currentIndex
    if (playMode.value === 'random') return Math.floor(Math.random() * total)
    return (currentIndex + 1) % total
  }

  function getPrevIndex(currentIndex, total) {
    if (!total) return -1
    if (playMode.value === 'loop') return currentIndex
    if (playMode.value === 'random') return Math.floor(Math.random() * total)
    return (currentIndex - 1 + total) % total
  }

  return { playMode, modeLabel, toggleMode, setMode, getNextIndex, getPrevIndex }
}
