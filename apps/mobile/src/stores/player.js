import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null,   // { hash, name, author, img, url, timeLength }
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playMode: 'sequence', // sequence | random | loop
    volume: 66,
    isMuted: false,
    lyrics: [],          // parsed lyrics array
    currentLyricIndex: -1,
  }),
  actions: {
    setCurrentSong(song) { this.currentSong = song },
    setPlaying(val) { this.isPlaying = val },
    setCurrentTime(val) { this.currentTime = val },
    setDuration(val) { this.duration = val },
    setPlayMode(mode) { this.playMode = mode },
    setVolume(val) { this.volume = val },
    setMuted(val) { this.isMuted = val },
    setLyrics(lyrics) { this.lyrics = lyrics },
    setCurrentLyricIndex(idx) { this.currentLyricIndex = idx },
  },
  persist: {
    strategies: [{
      paths: ['playMode', 'volume', 'isMuted'],
      storage: {
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, val) => uni.setStorageSync(key, val),
        removeItem: (key) => uni.removeStorageSync(key),
      }
    }]
  }
})
