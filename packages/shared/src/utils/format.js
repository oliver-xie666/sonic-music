/**
 * 格式化播放量
 * @param {number} count
 * @returns {string} 如 "1.2万" / "3.4亿"
 */
export function formatPlayCount(count) {
  if (!count || count < 0) return '0'
  if (count >= 1e8) return (count / 1e8).toFixed(1).replace(/\.0$/, '') + '亿'
  if (count >= 1e4) return (count / 1e4).toFixed(1).replace(/\.0$/, '') + '万'
  return String(count)
}
