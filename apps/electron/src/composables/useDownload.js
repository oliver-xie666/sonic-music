import { ref, onMounted, onUnmounted } from 'vue';
import { useDownloadStore } from '@/stores/download';

export function useDownload() {
    const downloadStore = useDownloadStore();
    const isElectron = !!window.electron;

    // 下载单首歌曲
    const downloadMusic = async (songInfo) => {
        if (!isElectron) {
            console.warn('下载功能仅在 Electron 环境下可用');
            return;
        }

        try {
            // 调试: 输出完整的 songInfo 结构
            console.log('=== 前端 useDownload 调试 ===');
            console.log('完整 songInfo:', JSON.stringify(songInfo, null, 2));

            // 获取歌曲信息
            // 注意: 某些数据源的 name 和 ar 字段是反的
            // 如果 ar 数组只有一个元素，可能 ar[0].name 才是歌曲名，name 是艺术家
            let artistNames, songName;

            if (songInfo.SingerName && songInfo.OriSongName) {
                // 如果有明确的字段，直接使用
                artistNames = songInfo.SingerName;
                songName = songInfo.OriSongName;
            } else if (songInfo.ar && songInfo.ar.length === 1 && !songInfo.artist) {
                // 数据源反了的情况: ar[0].name 是歌曲名, name 是艺术家
                songName = songInfo.ar[0].name;
                artistNames = songInfo.name || '未知艺术家';
            } else {
                // 正常情况
                artistNames = songInfo.artist || (songInfo.ar && songInfo.ar.map(a => a.name).join('、')) || '未知艺术家';
                songName = songInfo.SongName || songInfo.name || '未知歌曲';
            }

            const albumName = songInfo.album || (songInfo.al && songInfo.al.name) || '未知专辑';

            console.log('提取结果:');
            console.log('  - artistNames:', artistNames);
            console.log('  - songName:', songName);
            console.log('  - albumName:', albumName);
            console.log('=== 前端调试结束 ===\n');

            // 使用简单的文件名作为标识符,后端会根据配置格式化
            const filename = `${songName} - ${artistNames}`;

            // 直接使用传入的 URL（调用方已经根据音质设置获取了正确的 URL）
            const downloadUrl = songInfo.url || songInfo.playUrl;
            if (!downloadUrl) {
                console.error('下载 URL 不存在');
                window.$message.error('获取下载链接失败，请稍后重试');
                return;
            }

            // 发送下载请求,传递完整的歌曲信息给后端
            window.electron.ipcRenderer.send('download-music', {
                url: downloadUrl,
                filename,
                songInfo: {
                    ...songInfo,
                    name: songName,
                    ar: songInfo.ar || [{ name: artistNames }],
                    al: songInfo.al || { name: albumName },
                    SingerName: artistNames,
                    OriSongName: songName,
                    AlbumName: albumName,
                    downloadTime: Date.now()
                }
            });

            console.log('已添加到下载队列:', filename);
            window.$message.success('已添加到下载队列');
        } catch (error) {
            console.error('下载失败:', error);
            window.$message.error('下载失败: ' + error.message);
        }
    };

    // 批量下载
    const batchDownloadMusic = async (songs) => {
        if (!isElectron) return;

        try {
            for (const song of songs) {
                await downloadMusic(song);
            }
            console.log(`已添加 ${songs.length} 首歌曲到下载队列`);
        } catch (error) {
            console.error('批量下载失败:', error);
        }
    };

    // 暂停下载
    const pauseDownload = async (filename) => {
        if (!isElectron) return;
        // TODO: 实现暂停功能
        console.log('暂停下载:', filename);
    };

    // 恢复下载
    const resumeDownload = async (filename) => {
        if (!isElectron) return;
        // TODO: 实现恢复功能
        console.log('恢复下载:', filename);
    };

    // 取消下载
    const cancelDownload = async (filename) => {
        if (!isElectron) return;
        downloadStore.removeDownload(filename);
        console.log('取消下载:', filename);
    };

    // 删除已下载文件
    const deleteDownload = async (filePath) => {
        if (!isElectron) return;
        try {
            const success = await window.electronAPI.deleteDownloadedMusic(filePath);
            if (success) {
                // 从 store 中移除
                const item = downloadStore.downloadedList.find(d => d.path === filePath);
                if (item) {
                    downloadStore.removeDownload(item.filename, true);
                }
                console.log('删除成功:', filePath);
            }
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    // 检查是否已下载
    const checkDownloaded = async (filename) => {
        if (!isElectron) return false;
        try {
            return await window.electronAPI.checkMusicDownloaded(filename);
        } catch (error) {
            console.error('检查下载状态失败:', error);
            return false;
        }
    };

    // 设置事件监听器
    const setupListeners = () => {
        if (!isElectron) return;

        // 监听下载进度
        window.electron.ipcRenderer.on('music-download-progress', (data) => {
            downloadStore.updateDownloadProgress(data.filename, {
                progress: data.progress,
                loaded: data.loaded,
                total: data.total,
                speed: data.speed,
                status: 'downloading'
            });
        });

        // 监听下载完成
        window.electron.ipcRenderer.on('music-download-complete', (data) => {
            if (data.success) {
                downloadStore.moveToCompleted(data.filename);
                console.log('下载完成:', data.filename);
            } else {
                downloadStore.updateDownloadProgress(data.filename, {
                    status: 'failed',
                    error: data.error
                });
                console.error('下载失败:', data.filename, data.error);
            }
        });

        // 监听下载队列
        window.electron.ipcRenderer.on('music-download-queued', (data) => {
            downloadStore.addDownloading({
                filename: data.filename,
                progress: 0,
                loaded: 0,
                total: 0,
                status: 'pending',
                songInfo: data.songInfo
            });
        });

        // 监听下载错误
        window.electron.ipcRenderer.on('music-download-error', (data) => {
            downloadStore.updateDownloadProgress(data.filename, {
                status: 'failed',
                error: data.error
            });
            console.error('下载错误:', data.filename, data.error);
        });
    };

    // 清理监听器
    const cleanupListeners = () => {
        if (isElectron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.removeAllListeners('music-download-progress');
            window.electron.ipcRenderer.removeAllListeners('music-download-complete');
            window.electron.ipcRenderer.removeAllListeners('music-download-queued');
            window.electron.ipcRenderer.removeAllListeners('music-download-error');
        }
    };

    onMounted(() => {
        setupListeners();
        downloadStore.loadDownloads();
    });

    onUnmounted(() => {
        cleanupListeners();
    });

    return {
        downloadMusic,
        batchDownloadMusic,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        deleteDownload,
        checkDownloaded
    };
}
