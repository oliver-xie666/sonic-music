import { THEME_COLORS } from '@sonic-music/shared/constants'

export function applyTheme(themeName) {
  const theme = THEME_COLORS[themeName] || THEME_COLORS.pink

  // #ifdef H5
  Object.keys(theme).forEach(key => {
    document.documentElement.style.setProperty(key, theme[key])
  })
  // #endif

  // #ifdef APP-PLUS
  const primary = theme['--primary-color']
  const bg = theme['--background-color']
  uni.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: bg || '#FFF0F5',
  })
  // #endif
}
