import { defineStore } from 'pinia'
import { DEFAULT_API_URL } from '../constants/index.js'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    closeAction: 'ask',
    theme: 'auto',
    themeColor: 'pink',
    language: '',
    apiBaseUrl: DEFAULT_API_URL,
    quality: 'hires',
    dataSource: 'official',
    enableDownload: false,
    wlanOnly: false,
    lyricsFontSize: 'medium',
    lyricsAlign: 'center',
    lyricsTranslation: 'off',
  }),
  actions: {
    setCloseAction(action) { this.closeAction = action },
    setTheme(theme) { this.theme = theme },
    setLanguage(language) { this.language = language },
    setApiBaseUrl(url) { this.apiBaseUrl = url },
    setQuality(quality) { this.quality = quality },
  },
  persist: {
    strategies: [{
      storage: typeof uni !== 'undefined' ? {
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, val) => uni.setStorageSync(key, val),
        removeItem: (key) => uni.removeStorageSync(key),
      } : undefined
    }]
  }
})
