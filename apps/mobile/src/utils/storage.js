export const storage = {
  get(key, defaultValue = null) {
    try {
      const val = uni.getStorageSync(key)
      return val !== '' ? val : defaultValue
    } catch {
      return defaultValue
    }
  },
  set(key, value) {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('[storage.set]', e)
    }
  },
  remove(key) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('[storage.remove]', e)
    }
  },
}
