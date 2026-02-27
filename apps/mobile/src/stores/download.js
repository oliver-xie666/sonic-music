import { defineStore } from 'pinia'
import { getSongUrl } from '@/api/song'
import { get } from '@/api/client'

export const useDownloadStore = defineStore('download', {
  state: () => ({
    // 下载中列表 [{ hash, name, author, cover, status, progress, savedPath }]
    downloadingList: [],
    // 已完成列表
    downloadedList: [],
  }),

  getters: {
    activeCount: (state) => state.downloadingList.filter(d => d.status === 'downloading').length,
    isDownloaded: (state) => (hash) => state.downloadedList.some(d => d.hash === hash),
    isDownloading: (state) => (hash) => state.downloadingList.some(d => d.hash === hash),
  },

  actions: {
    async downloadSong(song) {
      const hash = song.hash
      if (this.isDownloaded(hash) || this.isDownloading(hash)) {
        uni.showToast({ title: '已在下载列表', icon: 'none' })
        return
      }

      const item = {
        hash,
        name: song.name || song.filename || song.audio_name || '',
        author: song.author || song.author_name || song.singername || '',
        cover: song.cover || song.sizable_cover || '',
        status: 'pending',
        progress: 0,
        savedPath: '',
      }
      this.downloadingList.unshift(item)

      try {
        // 获取下载 URL
        const res = await getSongUrl(hash, 'high')
        const url = res.data?.url || res.url
        if (!url) throw new Error('无法获取下载链接')

        item.status = 'downloading'

        // H5 环境：直接打开链接
        // #ifdef H5
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.author} - ${item.name}.mp3`
        a.click()
        item.status = 'done'
        item.progress = 100
        this._moveToCompleted(hash)
        return
        // #endif

        // App 环境：使用 uni.downloadFile
        // #ifndef H5
        uni.downloadFile({
          url,
          success: (downloadRes) => {
            if (downloadRes.statusCode === 200) {
              uni.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                success: (saveRes) => {
                  item.status = 'done'
                  item.progress = 100
                  item.savedPath = saveRes.savedFilePath
                  this._moveToCompleted(hash)
                },
                fail: () => {
                  item.status = 'error'
                }
              })
            } else {
              item.status = 'error'
            }
          },
          fail: () => {
            item.status = 'error'
          }
        })
        // #endif
      } catch (e) {
        item.status = 'error'
        console.error('[download] downloadSong error', e)
      }
    },

    _moveToCompleted(hash) {
      const idx = this.downloadingList.findIndex(d => d.hash === hash)
      if (idx >= 0) {
        const [item] = this.downloadingList.splice(idx, 1)
        this.downloadedList.unshift(item)
      }
    },

    removeDownloaded(hash) {
      const idx = this.downloadedList.findIndex(d => d.hash === hash)
      if (idx >= 0) this.downloadedList.splice(idx, 1)
    },

    removeDownloading(hash) {
      const idx = this.downloadingList.findIndex(d => d.hash === hash)
      if (idx >= 0) this.downloadingList.splice(idx, 1)
    },

    clearCompleted() {
      this.downloadedList = []
    },
  },

  persist: {
    strategies: [{
      storage: {
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, val) => uni.setStorageSync(key, val),
        removeItem: (key) => uni.removeStorageSync(key),
      }
    }]
  },
})
