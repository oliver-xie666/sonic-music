import { defineStore } from 'pinia';

export const useDownloadStore = defineStore('download', {
    state: () => ({
        // 下载列表
        downloadingList: [],      // 正在下载的列表
        downloadedList: [],       // 已下载的列表

        // 下载设置
        downloadPath: '',         // 下载路径
        filenameFormat: '{songName} - {artistName}',  // 文件名格式
        separator: ' - ',         // 分隔符
        autoDownloadLyrics: true, // 自动下载歌词
        autoDownloadCover: true,  // 自动下载封面
        downloadQuality: 'highest', // 下载音质
    }),

    getters: {
        // 活跃下载数量
        activeDownloadCount: (state) => {
            return state.downloadingList.filter(d => d.status === 'downloading').length;
        },

        // 总下载数量
        totalDownloadCount: (state) => {
            return state.downloadingList.length;
        },

        // 已完成数量
        completedCount: (state) => {
            return state.downloadedList.length;
        },
    },

    actions: {
        // 添加到下载列表
        addDownloading(download) {
            const index = this.downloadingList.findIndex(d => d.filename === download.filename);
            if (index >= 0) {
                this.downloadingList[index] = download;
            } else {
                this.downloadingList.unshift(download);
            }
        },

        // 更新下载进度
        updateDownloadProgress(filename, progress) {
            const download = this.downloadingList.find(d => d.filename === filename);
            if (download) {
                Object.assign(download, progress);
            }
        },

        // 移动到已完成列表
        async moveToCompleted(filename) {
            const index = this.downloadingList.findIndex(d => d.filename === filename);
            if (index >= 0) {
                // 从下载列表中移除
                this.downloadingList.splice(index, 1);

                // 重新加载已下载列表以获取完整的文件信息（包括正确的格式、封面、大小等）
                await this.loadDownloads();
            }
        },

        // 从列表中移除
        removeDownload(filename, fromCompleted = false) {
            const list = fromCompleted ? this.downloadedList : this.downloadingList;
            const index = list.findIndex(d => d.filename === filename);
            if (index >= 0) {
                list.splice(index, 1);
            }
        },

        // 设置下载路径
        setDownloadPath(path) {
            this.downloadPath = path;
        },

        // 设置文件名格式
        setFilenameFormat(format) {
            this.filenameFormat = format;
        },

        // 设置分隔符
        setSeparator(separator) {
            this.separator = separator;
        },

        // 设置下载音质
        setDownloadQuality(quality) {
            this.downloadQuality = quality;
        },

        // 从后端加载下载列表
        async loadDownloads() {
            if (window.electronAPI) {
                try {
                    const downloads = await window.electronAPI.getDownloadedMusic();
                    if (Array.isArray(downloads)) {
                        this.downloadedList = downloads;
                    }
                } catch (error) {
                    console.error('加载下载列表失败:', error);
                }
            }
        },

        // 清空已完成列表
        clearCompleted() {
            this.downloadedList = [];
        },
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'sonic-music-download',
                storage: localStorage,
                paths: ['downloadPath', 'filenameFormat', 'separator', 'autoDownloadLyrics', 'autoDownloadCover', 'downloadQuality'],
            },
        ],
    },
});
