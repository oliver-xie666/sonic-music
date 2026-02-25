/**
 * 时间格式化工具
 * 来源：apps/electron/src/utils/utils.js formatMilliseconds()
 */

// 毫秒 → "mm:ss"（歌曲时长显示）
export const formatMilliseconds = (ms) => {
  if (!ms) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 秒 → "mm:ss"（播放器进度显示）
export const formatSeconds = (s) => {
  if (!s) return '00:00'
  const minutes = Math.floor(s / 60)
  const seconds = Math.floor(s % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
