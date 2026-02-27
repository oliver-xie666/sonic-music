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

// 分钟 → "X小时Y分钟"（听歌时长显示）
export const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}小时${mins}分钟`
  return `${mins}分钟`
}

// 时间戳 → "乐龄X年"（注册时长显示）
export const formatRegTime = (timestamp) => {
  if (!timestamp) return ''
  const years = new Date().getFullYear() - new Date(timestamp * 1000).getFullYear()
  return `乐龄${years}年`
}
