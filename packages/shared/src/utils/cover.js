/**
 * 封面图片 URL 处理
 * 来源：apps/electron/src/utils/utils.js getCover()
 */
export const getCover = (coverUrl, size) => {
  if (!coverUrl) return ''
  return coverUrl
    .replace('{size}', size)
    .replace('http://', 'https://')
    .replace('c1.kgimg.com', 'imge.kugou.com')
}
