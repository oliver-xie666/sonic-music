/**
 * 音质 hash 获取工具
 * 来源：apps/electron/src/utils/utils.js getQuality()
 * 改动：去掉 localStorage 依赖，quality 由调用方传入
 */
export const getQuality = (hashs, data, quality) => {
  if (quality === 'high') {
    if (hashs) return hashs[1]?.hash || hashs[0].hash
    return data['hash_320'] || data['hash_192'] || data['hash_128'] || data['hash']
  } else if (quality === 'lossless') {
    if (hashs) return hashs[hashs.length - 1]?.hash || hashs[1]?.hash || hashs[0].hash
    return data['hash_flac'] || data['hash_ape'] || data['hash']
  } else if (quality === 'hires') {
    if (hashs) return hashs[hashs.length - 1]?.hash
    return data['hash_flac'] || data['hash_sq'] || data['hash_ape'] || data['hash']
  }
  if (hashs) return hashs[0].hash
  return data['hash']
}
