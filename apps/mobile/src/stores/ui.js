import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const miniPlayerVisible = ref(false)
  const queueDrawerVisible = ref(false)

  function showMiniPlayer() {
    miniPlayerVisible.value = true
  }

  function hideMiniPlayer() {
    miniPlayerVisible.value = false
  }

  function toggleQueueDrawer() {
    queueDrawerVisible.value = !queueDrawerVisible.value
  }

  return {
    miniPlayerVisible,
    queueDrawerVisible,
    showMiniPlayer,
    hideMiniPlayer,
    toggleQueueDrawer
  }
})
