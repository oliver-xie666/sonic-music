import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playMode = ref('sequence') // sequence | random | loop

  function setCurrentSong(song) {
    currentSong.value = song
  }

  function setPlaying(val) {
    isPlaying.value = val
  }

  function setCurrentTime(val) {
    currentTime.value = val
  }

  function setDuration(val) {
    duration.value = val
  }

  function setPlayMode(mode) {
    playMode.value = mode
  }

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playMode,
    setCurrentSong,
    setPlaying,
    setCurrentTime,
    setDuration,
    setPlayMode
  }
})
