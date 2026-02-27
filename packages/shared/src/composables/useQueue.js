/**
 * useQueue - 播放队列管理（共享，平台无关）
 * 依赖 useMusicQueueStore
 */
import { computed } from 'vue'
import { useMusicQueueStore } from '../stores/musicQueue.js'

export function useQueue() {
  const queueStore = useMusicQueueStore()

  const queue = computed(() => queueStore.queue)
  const queueLength = computed(() => queueStore.queue.length)

  function addSong(song) {
    const exists = queueStore.queue.findIndex(s => s.hash === song.hash)
    if (exists === -1) queueStore.addSong(song)
  }

  function addAfterCurrent(song, currentHash) {
    const exists = queueStore.queue.findIndex(s => s.hash === song.hash)
    if (exists !== -1) return
    const curIdx = queueStore.queue.findIndex(s => s.hash === currentHash)
    if (curIdx !== -1) {
      queueStore.queue.splice(curIdx + 1, 0, song)
    } else {
      queueStore.addSong(song)
    }
  }

  function setQueue(songs) {
    queueStore.setQueue(songs)
  }

  function clearQueue() {
    queueStore.clearQueue()
  }

  function removeSong(index) {
    queueStore.removeSong(index)
  }

  function getIndexByHash(hash) {
    return queueStore.queue.findIndex(s => s.hash === hash)
  }

  function getSongByIndex(index) {
    return queueStore.queue[index] || null
  }

  // 将歌单数组格式化为队列 song 对象
  function formatPlaylistToQueue(songs) {
    return songs.map((song, i) => ({
      id: i + 1,
      hash: song.hash,
      name: song.filename || song.name || '',
      author: song.singername || song.author || '',
      img: (song.cover || song.img || '').replace('{size}', '480').replace('http://', 'https://'),
      timeLength: song.timelen || song.timeLength || 0,
    }))
  }

  return {
    queue,
    queueLength,
    addSong,
    addAfterCurrent,
    setQueue,
    clearQueue,
    removeSong,
    getIndexByHash,
    getSongByIndex,
    formatPlaylistToQueue,
  }
}
