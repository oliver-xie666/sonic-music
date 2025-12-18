import axios from 'axios';
import { app, Notification, shell } from 'electron';
import Store from 'electron-store';
import { fileTypeFromFile } from 'file-type';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as mm from 'music-metadata';
import * as NodeID3 from 'node-id3';
import * as os from 'os';
import * as path from 'path';
import sharp from 'sharp';

const MAX_CONCURRENT_DOWNLOADS = 3;
const downloadQueue = [];
let activeDownloads = 0;

// 创建 store 实例用于存储下载历史
const downloadStore = new Store({
    name: 'downloads',
    defaults: {
        history: []
    }
});

// 保存已发送通知的文件，避免重复通知
const sentNotifications = new Map();

/**
 * 清理文件名中的非法字符
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * 处理下载请求
 */
export function handleDownloadRequest(event, { url, filename, songInfo, type }) {
    // 检查是否已经在队列中或正在下载
    if (downloadQueue.some((item) => item.filename === filename)) {
        event.reply('music-download-error', {
            filename,
            error: '该歌曲已在下载队列中'
        });
        return;
    }

    // 检查是否已下载
    const store = new Store();
    const songInfos = store.get('downloadedSongs', {});

    // 检查是否已下载（通过ID）
    const isDownloaded = songInfo?.id && Object.values(songInfos).some((info) => info.id === songInfo.id);

    if (isDownloaded) {
        event.reply('music-download-error', {
            filename,
            error: '该歌曲已下载'
        });
        return;
    }

    // 添加到下载队列
    downloadQueue.push({ url, filename, songInfo, type });
    event.reply('music-download-queued', {
        filename,
        songInfo
    });

    // 尝试开始下载
    processDownloadQueue(event);
}

/**
 * 处理下载队列
 */
async function processDownloadQueue(event) {
    if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS || downloadQueue.length === 0) {
        return;
    }

    const { url, filename, songInfo, type } = downloadQueue.shift();
    activeDownloads++;

    try {
        await downloadMusic(event, { url, filename, songInfo, type });
    } finally {
        activeDownloads--;
        processDownloadQueue(event);
    }
}

/**
 * 下载音乐和歌词
 */
async function downloadMusic(event, { url, filename, songInfo, type = 'mp3' }) {
    let finalFilePath = '';
    let writer = null;
    let tempFilePath = '';

    try {
        // 获取配置
        const store = new Store();
        const downloadPath = store.get('set.downloadPath') || app.getPath('downloads');
        const apiPort = store.get('set.musicApiPort') || 6521;

        // 获取文件名格式设置
        const nameFormat = store.get('set.downloadNameFormat') || '{songName} - {artistName}';

        // 根据格式创建文件名
        let formattedFilename = filename;
        if (songInfo) {
            const artistName = songInfo.ar?.map((a) => a.name).join(',') || songInfo.SingerName || '未知艺术家';
            const songName = songInfo.name || songInfo.OriSongName || songInfo.SongName || filename;
            const albumName = songInfo.al?.name || songInfo.AlbumName || '未知专辑';

            formattedFilename = nameFormat
                .replace(/\{songName\}/g, songName)
                .replace(/\{artistName\}/g, artistName)
                .replace(/\{albumName\}/g, albumName);
        }

        // 清理文件名
        const sanitizedFilename = sanitizeFilename(formattedFilename);

        // 创建临时文件路径
        const tempDir = path.join(os.tmpdir(), 'SonicMusicTemp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        tempFilePath = path.join(tempDir, `${Date.now()}_${sanitizedFilename}.tmp`);

        // 获取文件大小
        const headResponse = await axios.head(url);
        const totalSize = parseInt(headResponse.headers['content-length'] || '0', 10);

        // 开始下载
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000,
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true })
        });

        writer = fs.createWriteStream(tempFilePath);
        let downloadedSize = 0;
        let lastUpdateTime = Date.now();
        let lastDownloadedSize = 0;

        // 跟踪下载进度
        response.data.on('data', (chunk) => {
            downloadedSize += chunk.length;
            const now = Date.now();
            const timeDiff = now - lastUpdateTime;

            // 每 500ms 更新一次进度
            if (timeDiff >= 500) {
                const sizeDiff = downloadedSize - lastDownloadedSize;
                const speed = (sizeDiff / timeDiff) * 1000; // bytes per second
                const progress = Math.round((downloadedSize / totalSize) * 100);

                event.reply('music-download-progress', {
                    filename,
                    progress,
                    loaded: downloadedSize,
                    total: totalSize,
                    speed,
                    path: tempFilePath,
                    status: progress === 100 ? 'completed' : 'downloading',
                    songInfo: songInfo || {
                        name: filename,
                        ar: [{ name: '本地音乐' }],
                        picUrl: '/images/default_cover.png'
                    }
                });

                lastUpdateTime = now;
                lastDownloadedSize = downloadedSize;
            }
        });

        // 等待下载完成
        await new Promise((resolve, reject) => {
            writer.on('finish', () => resolve());
            writer.on('error', (error) => reject(error));
            response.data.pipe(writer);
        });

        // 验证文件完整性
        const stats = fs.statSync(tempFilePath);
        if (stats.size !== totalSize) {
            throw new Error('文件下载不完整');
        }

        // 检测文件类型
        let fileExtension = '';
        try {
            const fileType = await fileTypeFromFile(tempFilePath);
            if (fileType && fileType.ext) {
                fileExtension = `.${fileType.ext}`;
            } else {
                const metadata = await mm.parseFile(tempFilePath);
                if (metadata && metadata.format) {
                    const formatInfo = metadata.format;
                    const container = formatInfo.container || '';
                    const codec = formatInfo.codec || '';

                    const formatMap = {
                        mp3: ['MPEG', 'MP3', 'mp3'],
                        aac: ['AAC'],
                        flac: ['FLAC'],
                        ogg: ['Ogg', 'Vorbis'],
                        wav: ['WAV', 'PCM'],
                        m4a: ['M4A', 'MP4']
                    };

                    const format = Object.entries(formatMap).find(([_, keywords]) =>
                        keywords.some((keyword) => container.includes(keyword) || codec.includes(keyword))
                    );

                    fileExtension = format ? `.${format[0]}` : '.mp3';
                } else {
                    fileExtension = type ? `.${type}` : '.mp3';
                }
            }
        } catch (err) {
            console.error('检测文件类型失败:', err);
            fileExtension = type ? `.${type}` : '.mp3';
        }

        // 创建最终文件路径
        const filePath = path.join(downloadPath, `${sanitizedFilename}${fileExtension}`);

        // 处理文件名冲突
        finalFilePath = filePath;
        let counter = 1;
        while (fs.existsSync(finalFilePath)) {
            const ext = path.extname(filePath);
            const nameWithoutExt = filePath.slice(0, -ext.length);
            finalFilePath = `${nameWithoutExt} (${counter})${ext}`;
            counter++;
        }

        // 移动文件到最终位置
        fs.copyFileSync(tempFilePath, finalFilePath);
        fs.unlinkSync(tempFilePath);

        // 下载歌词
        let lyricData = null;
        let lyricsContent = '';
        try {
            if (songInfo?.id) {
                const lyricsResponse = await axios.get(
                    `http://localhost:${apiPort}/lyric?id=${songInfo.id}`
                );
                if (lyricsResponse.data && (lyricsResponse.data.lrc || lyricsResponse.data.tlyric)) {
                    lyricData = lyricsResponse.data;

                    if (lyricsResponse.data.lrc && lyricsResponse.data.lrc.lyric) {
                        lyricsContent = lyricsResponse.data.lrc.lyric;

                        // 合并翻译歌词
                        if (lyricsResponse.data.tlyric && lyricsResponse.data.tlyric.lyric) {
                            const originalLyrics = parseLyrics(lyricsResponse.data.lrc.lyric);
                            const translatedLyrics = parseLyrics(lyricsResponse.data.tlyric.lyric);
                            lyricsContent = mergeLyrics(originalLyrics, translatedLyrics);
                        }
                    }
                }
            }
        } catch (lyricError) {
            console.error('下载歌词失败:', lyricError);
        }

        // 下载封面
        let coverImageBuffer = null;
        try {
            if (songInfo?.picUrl || songInfo?.al?.picUrl || songInfo?.AlbumPic) {
                const picUrl = songInfo.picUrl || songInfo.al?.picUrl || songInfo.AlbumPic;
                if (picUrl && picUrl !== '/images/default_cover.png') {
                    const coverResponse = await axios({
                        url: picUrl.replace('http://', 'https://'),
                        method: 'GET',
                        responseType: 'arraybuffer',
                        timeout: 10000
                    });

                    const originalCoverBuffer = Buffer.from(coverResponse.data);
                    const TWO_MB = 2 * 1024 * 1024;

                    if (originalCoverBuffer.length > TWO_MB) {
                        try {
                            coverImageBuffer = await sharp(originalCoverBuffer)
                                .resize({
                                    width: 1600,
                                    height: 1600,
                                    fit: 'inside',
                                    withoutEnlargement: true
                                })
                                .jpeg({
                                    quality: 80,
                                    mozjpeg: true
                                })
                                .toBuffer();
                        } catch (compressionError) {
                            console.error('封面压缩失败:', compressionError);
                            coverImageBuffer = originalCoverBuffer;
                        }
                    } else {
                        coverImageBuffer = originalCoverBuffer;
                    }
                }
            }
        } catch (coverError) {
            console.error('下载封面失败:', coverError);
        }

        // 写入元数据
        const fileFormat = fileExtension.toLowerCase();
        const artistNames = songInfo?.ar?.map((a) => a.name).join(',') || songInfo?.SingerName || '未知艺术家';

        if (['.mp3'].includes(fileFormat)) {
            try {
                NodeID3.removeTags(finalFilePath);

                const tags = {
                    title: songInfo?.name || songInfo?.OriSongName || songInfo?.SongName,
                    artist: artistNames,
                    TPE1: artistNames,
                    TPE2: artistNames,
                    album: songInfo?.al?.name || songInfo?.AlbumName || filename,
                    APIC: coverImageBuffer ? {
                        imageBuffer: coverImageBuffer,
                        type: {
                            id: 3,
                            name: 'front cover'
                        },
                        description: 'Album cover',
                        mime: 'image/jpeg'
                    } : undefined,
                    USLT: lyricsContent ? {
                        language: 'chi',
                        description: 'Lyrics',
                        text: lyricsContent
                    } : undefined,
                    trackNumber: songInfo?.no || undefined,
                    year: songInfo?.publishTime ? new Date(songInfo.publishTime).getFullYear().toString() : undefined
                };

                const success = NodeID3.write(tags, finalFilePath);
                if (success) {
                    console.log('ID3 标签写入成功');
                }
            } catch (err) {
                console.error('写入 ID3 标签失败:', err);
            }
        } else if (['.flac'].includes(fileFormat)) {
            // FLAC 标签写入（使用 flac-metadata）
            try {
                // TODO: 实现 FLAC 标签写入
                console.log('FLAC 标签写入功能待实现');
            } catch (err) {
                console.error('写入 FLAC 标签失败:', err);
            }
        }

        // 保存下载信息
        try {
            const songInfos = store.get('downloadedSongs', {});
            const defaultInfo = {
                name: filename,
                ar: [{ name: '本地音乐' }],
                picUrl: '/images/default_cover.png'
            };

            const newSongInfo = {
                id: songInfo?.id || 0,
                name: songInfo?.name || songInfo?.OriSongName || songInfo?.SongName || filename,
                filename,
                picUrl: songInfo?.picUrl || songInfo?.al?.picUrl || songInfo?.AlbumPic || defaultInfo.picUrl,
                ar: songInfo?.ar || (songInfo?.SingerName ? [{ name: songInfo.SingerName }] : defaultInfo.ar),
                al: songInfo?.al || {
                    picUrl: songInfo?.picUrl || songInfo?.AlbumPic || defaultInfo.picUrl,
                    name: songInfo?.AlbumName || filename
                },
                size: totalSize,
                path: finalFilePath,
                downloadTime: Date.now(),
                type: fileExtension.substring(1),
                lyric: lyricData
            };

            // 保存到下载记录
            songInfos[finalFilePath] = newSongInfo;
            store.set('downloadedSongs', songInfos);

            // 添加到下载历史
            const history = downloadStore.get('history', []);
            history.unshift(newSongInfo);
            downloadStore.set('history', history);

            // 发送桌面通知
            const notificationId = `download-${finalFilePath}`;
            if (!sentNotifications.has(notificationId)) {
                sentNotifications.set(notificationId, true);

                try {
                    const notification = new Notification({
                        title: '下载完成',
                        body: `${newSongInfo.name} - ${artistNames}`,
                        silent: false
                    });

                    notification.on('click', () => {
                        shell.showItemInFolder(finalFilePath);
                    });

                    notification.show();

                    setTimeout(() => {
                        sentNotifications.delete(notificationId);
                    }, 60000);
                } catch (notifyError) {
                    console.error('发送通知失败:', notifyError);
                }
            }

            // 发送下载完成事件（包含完整信息）
            event.reply('music-download-complete', {
                success: true,
                path: finalFilePath,
                filename,
                size: totalSize,
                type: fileExtension.substring(1),
                songInfo: newSongInfo
            });
        } catch (error) {
            console.error('保存下载信息失败:', error);
            throw new Error('保存下载信息失败');
        }
    } catch (error) {
        console.error('下载错误:', error);

        // 清理
        if (writer) {
            writer.end();
        }

        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                console.error('删除临时文件失败:', e);
            }
        }

        if (finalFilePath && fs.existsSync(finalFilePath)) {
            try {
                fs.unlinkSync(finalFilePath);
            } catch (e) {
                console.error('删除未完成文件失败:', e);
            }
        }

        event.reply('music-download-complete', {
            success: false,
            error: error.message || '下载失败',
            filename
        });
    }
}

/**
 * 解析歌词文本
 */
function parseLyrics(lyricsText) {
    const lyricMap = new Map();
    const lines = lyricsText.split('\n');

    for (const line of lines) {
        const timeTagMatches = line.match(/\[\d{2}:\d{2}(\.\d{1,3})?\]/g);
        if (!timeTagMatches) continue;

        const content = line.replace(/\[\d{2}:\d{2}(\.\d{1,3})?\]/g, '').trim();
        if (!content) continue;

        for (const timeTag of timeTagMatches) {
            lyricMap.set(timeTag, content);
        }
    }

    return lyricMap;
}

/**
 * 合并原文和翻译歌词
 */
function mergeLyrics(originalLyrics, translatedLyrics) {
    const mergedLines = [];

    for (const [timeTag, originalContent] of originalLyrics.entries()) {
        const translatedContent = translatedLyrics.get(timeTag);

        mergedLines.push(`${timeTag}${originalContent}`);

        if (translatedContent) {
            mergedLines.push(`${timeTag}${translatedContent}`);
        }
    }

    mergedLines.sort((a, b) => {
        const timeA = a.match(/\[\d{2}:\d{2}(\.\d{1,3})?\]/)?.[0] || '';
        const timeB = b.match(/\[\d{2}:\d{2}(\.\d{1,3})?\]/)?.[0] || '';
        return timeA.localeCompare(timeB);
    });

    return mergedLines.join('\n');
}

/**
 * 获取已下载音乐列表
 */
export async function getDownloadedMusic() {
    try {
        const store = new Store();
        const songInfos = store.get('downloadedSongs', {});

        const entriesArray = Object.entries(songInfos);
        const validEntriesPromises = await Promise.all(
            entriesArray.map(async ([path, info]) => {
                try {
                    const exists = await fs.promises
                        .access(path)
                        .then(() => true)
                        .catch(() => false);
                    return exists ? info : null;
                } catch (error) {
                    console.error('检查文件存在性失败:', error);
                    return null;
                }
            })
        );

        const validSongs = validEntriesPromises
            .filter((song) => song !== null)
            .sort((a, b) => (b.downloadTime || 0) - (a.downloadTime || 0));

        // 更新存储，移除不存在的文件记录
        const newSongInfos = validSongs.reduce((acc, song) => {
            if (song && song.path) {
                acc[song.path] = song;
            }
            return acc;
        }, {});
        store.set('downloadedSongs', newSongInfos);

        return validSongs;
    } catch (error) {
        console.error('获取下载列表失败:', error);
        return [];
    }
}

/**
 * 删除已下载的音乐
 */
export async function deleteDownloadedMusic(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);

            const store = new Store();
            const songInfos = store.get('downloadedSongs', {});
            delete songInfos[filePath];
            store.set('downloadedSongs', songInfos);

            return true;
        }
        return false;
    } catch (error) {
        console.error('删除文件失败:', error);
        return false;
    }
}

/**
 * 清空下载记录
 */
export function clearDownloadedMusic() {
    const store = new Store();
    store.set('downloadedSongs', {});
    return true;
}

/**
 * 检查音乐是否已下载
 */
export function checkMusicDownloaded(filename) {
    const store = new Store();
    const downloadPath = store.get('set.downloadPath') || app.getPath('downloads');
    const filePath = path.join(downloadPath, `${filename}.mp3`);
    return fs.existsSync(filePath);
}

/**
 * 检查歌曲是否已下载（通过ID）
 */
export function checkSongDownloaded(songId) {
    const store = new Store();
    const songInfos = store.get('downloadedSongs', {});

    for (const [path, info] of Object.entries(songInfos)) {
        if (info.id === songId && fs.existsSync(path)) {
            return {
                isDownloaded: true,
                localPath: `local://${path}`,
                songInfo: info
            };
        }
    }

    return {
        isDownloaded: false,
        localPath: '',
        songInfo: null
    };
}
