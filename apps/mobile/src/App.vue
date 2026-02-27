<template>
  <view>
    <MiniPlayer />
  </view>
</template>

<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { useMobileAuthPersist } from '@/stores/auth'
import { applyTheme } from '@/utils/theme'
import MiniPlayer from '@/components/player/MiniPlayer.vue'
import { get } from '@/api/client'

const settingsStore = useSettingsStore()
const authStore = MoeAuthStore()
const authPersist = useMobileAuthPersist()

onLaunch(async () => {
  applyTheme(settingsStore.theme)
  const saved = authPersist.load()
  if (saved) {
    await authStore.setData({ UserInfo: saved })
    if (!authStore.UserInfo?.dfid) {
      const res = await get('/register/dev')
      console.log('[dfid] res:', JSON.stringify(res))
      await authStore.initDfid(get)
    }
    console.log('[auth] after init, UserInfo:', JSON.stringify(authStore.UserInfo))
  }
})

onShow(() => {
  applyTheme(settingsStore.theme)
})
</script>

<style>
/* 全局样式重置 */
page {
  background-color: var(--background-color, #FFF0F5);
  color: var(--text-primary, #333333);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
