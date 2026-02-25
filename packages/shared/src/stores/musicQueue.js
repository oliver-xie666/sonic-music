/**
 * 播放队列 Store（共享）
 * 来源：apps/electron/src/stores/musicQueue.js
 * 改动：去掉 localStorage persist（由各平台自己配置）
 */
import { defineStore } from 'pinia'

export const useMusicQueueStore = defineStore('MusicQueue', {
  state: () => ({
    queue: [],
  }),
  actions: {
    addSong(song) {
      this.queue.push(song)
    },
    setQueue(newQueue) {
      this.queue = newQueue
    },
    getQueue() {
      return this.queue
    },
    removeSong(index) {
      this.queue.splice(index, 1)
    },
    clearQueue() {
      this.queue = []
    },
  },
})
