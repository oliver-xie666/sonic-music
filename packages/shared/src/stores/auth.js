/**
 * 认证 Store（共享）
 * 来源：apps/electron/src/stores/store.js MoeAuthStore
 * 改动：去掉 axios 依赖，initDfid 改为接收 requestFn 参数
 *       去掉 localStorage persist（由各平台自己配置）
 */
import { defineStore } from 'pinia'

export const MoeAuthStore = defineStore('MoeData', {
  state: () => ({
    UserInfo: null,
    Config: null,
  }),
  actions: {
    fetchConfig(key) {
      if (!this.Config) return null
      const item = this.Config.find(i => i.key === key)
      return item ? item.value : null
    },
    async setData(data) {
      if (data.UserInfo) {
        const existingDfid = this.UserInfo?.dfid
        this.UserInfo = data.UserInfo
        if (existingDfid && !this.UserInfo.dfid) {
          this.UserInfo.dfid = existingDfid
        }
        if (!this.UserInfo.dfid) {
          await this.initDfid()
        }
      }
      if (data.Config) this.Config = data.Config
    },
    clearData() {
      this.UserInfo = null
    },
    setDfid(dfid) {
      if (!this.UserInfo) {
        this.UserInfo = { dfid }
      } else {
        this.UserInfo.dfid = dfid
      }
    },
    // requestFn 由各平台注入（Electron 用 axios，Mobile 用 uni.request）
    async initDfid(requestFn) {
      if (this.UserInfo?.dfid) return this.UserInfo.dfid
      if (!requestFn) return null
      try {
        const data = await requestFn('/register/dev')
        const dfid = data?.data?.dfid
        if (dfid) {
          this.setDfid(dfid)
          return dfid
        }
      } catch (e) {
        console.error('[MoeAuthStore] initDfid failed:', e)
      }
      return null
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.UserInfo,
  },
})
