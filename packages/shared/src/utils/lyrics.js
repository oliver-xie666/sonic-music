/**
 * 歌词解析工具
 * 来源：apps/electron/src/components/player/LyricsHandler.js parseLyrics()
 * 改动：去掉所有 DOM 操作，只保留纯解析逻辑
 */

// 解析 KRC 格式歌词
export const parseLyrics = (text, parseTranslation = true) => {
  if (!text) return []

  let translationLyrics = []
  let romanizationLyrics = []
  const lines = text.split('\n')

  try {
    const languageLine = lines.find(line => line.match(/\[language:(.*)\]/))
    if (parseTranslation && languageLine) {
      const languageCode = languageLine.slice(10, -2)
      if (languageCode) {
        try {
          const cleanedCode = languageCode.replace(/[^A-Za-z0-9+/=]/g, '')
          const paddedCode = cleanedCode.padEnd(
            cleanedCode.length + (4 - (cleanedCode.length % 4)) % 4,
            '='
          )
          const decodedData = decodeURIComponent(escape(atob(paddedCode)))
          const languageData = JSON.parse(decodedData)

          const translation = languageData?.content?.find(s => s.type === 1)
          if (translation?.lyricContent) translationLyrics = translation.lyricContent

          const romanization = languageData?.content?.find(s => s.type === 0)
          if (romanization?.lyricContent) romanizationLyrics = romanization.lyricContent
        } catch (e) {
          // Base64 解码失败，忽略翻译
        }
      }
    }
  } catch (e) {
    // 解析翻译歌词失败，忽略
  }

  const parsedLyrics = []
  const charRegex = /<(\d+),(\d+),\d+>([^<]+)/g

  lines.forEach(line => {
    const lineMatch = line.match(/^\[(\d+),(\d+)\](.*)/)
    if (!lineMatch) return

    const start = parseInt(lineMatch[1])
    const lyricContent = lineMatch[3]
    const characters = []
    let charMatch

    while ((charMatch = charRegex.exec(lyricContent)) !== null) {
      const text = charMatch[3]
      const charDuration = parseInt(charMatch[2])
      const charStart = start + parseInt(charMatch[1])
      characters.push({
        char: text,
        startTime: charStart,
        endTime: charStart + charDuration,
        highlighted: false,
      })
    }

    if (characters.length === 0) {
      const duration = parseInt(lineMatch[2])
      const lyric = lyricContent.replace(/<.*?>/g, '')
      if (lyric.trim()) {
        for (let i = 0; i < lyric.length; i++) {
          characters.push({
            char: lyric[i],
            startTime: start + (i * duration) / lyric.length,
            endTime: start + ((i + 1) * duration) / lyric.length,
            highlighted: false,
          })
        }
      }
    }

    if (characters.length > 0) {
      parsedLyrics.push({ characters })
    }
  })

  if (translationLyrics.length) {
    parsedLyrics.forEach((line, i) => {
      if (translationLyrics[i]?.[0]) line.translated = translationLyrics[i][0]
    })
  }

  if (romanizationLyrics.length) {
    parsedLyrics.forEach((line, i) => {
      if (romanizationLyrics[i]) line.romanized = romanizationLyrics[i].join('')
    })
  }

  return parsedLyrics
}

// 根据当前播放时间获取当前歌词行索引
export const getCurrentLineIndex = (lyrics, currentTimeMs) => {
  if (!lyrics || !lyrics.length) return -1
  for (let i = lyrics.length - 1; i >= 0; i--) {
    const firstChar = lyrics[i].characters?.[0]
    if (firstChar && currentTimeMs >= firstChar.startTime) return i
  }
  return 0
}
