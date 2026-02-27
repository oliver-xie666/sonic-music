/**
 * Mobile auth persistence — wraps shared MoeAuthStore with uni.storage
 * The shared store lives in memory only; this file hydrates it on app start
 * and saves it whenever UserInfo changes.
 */
import { defineStore } from 'pinia'

const STORAGE_KEY = 'MoeData_UserInfo'

export const useMobileAuthPersist = defineStore('MobileAuthPersist', {
  state: () => ({ _dummy: null }),
  actions: {
    save(userInfo) {
      try {
        uni.setStorageSync(STORAGE_KEY, JSON.stringify(userInfo))
      } catch (e) {}
    },
    load() {
      try {
        const raw = uni.getStorageSync(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
      } catch (e) {
        return null
      }
    },
    clear() {
      try { uni.removeStorageSync(STORAGE_KEY) } catch (e) {}
    },
  },
})
