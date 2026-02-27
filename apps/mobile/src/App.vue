<template>
  <view>
    <MiniPlayer />
  </view>
</template>

<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'
import { applyTheme } from '@/utils/theme'
import MiniPlayer from '@/components/player/MiniPlayer.vue'

const settingsStore = useSettingsStore()

onLaunch(() => {
  applyTheme(settingsStore.theme)
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
