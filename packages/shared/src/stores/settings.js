/**
 * 设置 Store（共享）
 * 来源：apps/electron/src/stores/settings.js
 * 改动：新增 apiBaseUrl（移动端服务器地址）、quality（音质）字段
 *       去掉 localStorage persist（由各平台自己配置）
 */
import { defineStore } from 'pinia'
import { DEFAULT_API_URL } from '../constants/index.js'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    closeAction: 'ask',
    theme: 'pink',
    language: 'zh-CN',
    apiBaseUrl: DEFAULT_API_URL,
    quality: 'standard',
  }),
  actions: {
    setCloseAction(action) {
      this.closeAction = action
    },
    setTheme(theme) {
      this.theme = theme
    },
    setLanguage(language) {
      this.language = language
    },
    setApiBaseUrl(url) {
      this.apiBaseUrl = url
    },
    setQuality(quality) {
      this.quality = quality
    },
  },
})
