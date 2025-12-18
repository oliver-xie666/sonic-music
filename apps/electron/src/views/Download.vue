<template>
    <div class="download-page">
        <div class="download-header">
            <h1 class="page-title">下载管理</h1>
            <div class="header-actions">
                <button class="settings-btn" @click="showSettings = true">
                    <i class="fas fa-cog"></i>
                    设置
                </button>
            </div>
        </div>

        <div class="download-tabs">
            <div
                class="tab-item"
                :class="{ active: activeTab === 'downloading' }"
                @click="activeTab = 'downloading'"
            >
                <span>下载中</span>
                <span v-if="downloadStore.activeDownloadCount > 0" class="badge">
                    {{ downloadStore.activeDownloadCount }}
                </span>
            </div>
            <div
                class="tab-item"
                :class="{ active: activeTab === 'downloaded' }"
                @click="activeTab = 'downloaded'"
            >
                <span>已下载</span>
                <span v-if="downloadStore.completedCount > 0" class="badge">
                    {{ downloadStore.completedCount }}
                </span>
            </div>
        </div>

        <div class="download-content">
            <!-- 下载中列表 -->
            <div v-if="activeTab === 'downloading'" class="downloading-list">
                <div v-if="downloadStore.downloadingList.length === 0" class="empty-state">
                    <i class="fas fa-download"></i>
                    <p>暂无下载任务</p>
                </div>
                <div v-else class="download-items">
                    <div
                        v-for="item in downloadStore.downloadingList"
                        :key="item.filename"
                        class="download-item"
                    >
                        <img
                            :src="item.songInfo?.picUrl || '/images/default_cover.png'"
                            class="song-cover"
                            @error="handleImageError"
                        />
                        <div class="song-info">
                            <div class="song-name">{{ item.songInfo?.name || item.filename }}</div>
                            <div class="song-artist">
                                {{ getArtistName(item.songInfo) }}
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{ width: item.progress + '%' }"
                                ></div>
                            </div>
                            <div class="download-stats">
                                <span class="progress-text">{{ item.progress || 0 }}%</span>
                                <span v-if="item.speed" class="speed-text">
                                    {{ formatSpeed(item.speed) }}
                                </span>
                            </div>
                        </div>
                        <div class="download-actions">
                            <button
                                v-if="item.status === 'downloading'"
                                class="action-btn pause-btn"
                                @click="pauseDownload(item.filename)"
                                title="暂停"
                            >
                                <i class="fas fa-pause"></i>
                            </button>
                            <button
                                v-else-if="item.status === 'paused'"
                                class="action-btn resume-btn"
                                @click="resumeDownload(item.filename)"
                                title="继续"
                            >
                                <i class="fas fa-play"></i>
                            </button>
                            <button
                                class="action-btn cancel-btn"
                                @click="cancelDownload(item.filename)"
                                title="取消"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 已下载列表 -->
            <div v-if="activeTab === 'downloaded'" class="downloaded-list">
                <div v-if="downloadStore.downloadedList.length === 0" class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>暂无已下载文件</p>
                </div>
                <div v-else class="download-items">
                    <div
                        v-for="item in downloadStore.downloadedList"
                        :key="item.path"
                        class="download-item"
                    >
                        <img
                            :src="item.picUrl || '/images/default_cover.png'"
                            class="song-cover"
                            @error="handleImageError"
                        />
                        <div class="song-info">
                            <div class="song-name">{{ item.name || item.filename }}</div>
                            <div class="song-artist">
                                {{ getArtistName(item) }}
                            </div>
                            <div class="file-info">
                                <span class="file-size">{{ formatFileSize(item.size) }}</span>
                                <span class="file-type">{{ item.type?.toUpperCase() || 'MP3' }}</span>
                            </div>
                        </div>
                        <div class="download-actions">
                            <button
                                class="action-btn play-btn"
                                @click="playDownloadedSong(item)"
                                title="播放"
                            >
                                <i class="fas fa-play"></i>
                            </button>
                            <button
                                class="action-btn folder-btn"
                                @click="openFolder(item.path)"
                                title="打开文件夹"
                            >
                                <i class="fas fa-folder-open"></i>
                            </button>
                            <button
                                class="action-btn delete-btn"
                                @click="deleteDownload(item.path)"
                                title="删除"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 设置抽屉 -->
        <div v-if="showSettings" class="settings-drawer" @click.self="showSettings = false">
            <div class="drawer-content">
                <div class="drawer-header">
                    <h2>下载设置</h2>
                    <button class="save-btn" @click="saveSettings">
                        保存
                    </button>
                </div>
                <div class="drawer-body">
                    <!-- 下载路径设置 -->
                    <div class="setting-section">
                        <div class="setting-title">下载路径</div>
                        <div class="setting-desc">选择音乐文件的保存位置</div>
                        <div class="path-selector">
                            <input
                                type="text"
                                :value="downloadStore.downloadPath || defaultDownloadPath"
                                readonly
                                placeholder="选择下载路径"
                            />
                            <button class="select-btn" @click="selectDownloadPath">选择</button>
                            <button class="open-btn" @click="openDownloadPath">
                                <i class="fas fa-folder-open"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 文件名格式设置 -->
                    <div class="setting-section">
                        <div class="setting-title">文件名格式</div>
                        <div class="setting-desc">自定义下载文件的命名规则</div>

                        <!-- 预设模板 -->
                        <div class="preset-buttons">
                            <button
                                class="preset-btn"
                                :class="{ active: downloadStore.filenameFormat === '{songName} - {artistName}' }"
                                @click="downloadStore.filenameFormat = '{songName} - {artistName}'"
                            >
                                歌曲 - 艺术家
                            </button>
                            <button
                                class="preset-btn"
                                :class="{ active: downloadStore.filenameFormat === '{artistName} - {songName}' }"
                                @click="downloadStore.filenameFormat = '{artistName} - {songName}'"
                            >
                                艺术家 - 歌曲
                            </button>
                            <button
                                class="preset-btn"
                                :class="{ active: downloadStore.filenameFormat === '{songName}' }"
                                @click="downloadStore.filenameFormat = '{songName}'"
                            >
                                仅歌曲名
                            </button>
                        </div>

                        <!-- 分隔符设置 -->
                        <div class="separator-section">
                            <div class="separator-label">分隔符</div>
                            <div class="separator-buttons">
                                <button
                                    class="separator-btn"
                                    :class="{ active: downloadStore.separator === ' - ' }"
                                    @click="downloadStore.separator = ' - '"
                                >
                                    空格-空格
                                </button>
                                <button
                                    class="separator-btn"
                                    :class="{ active: downloadStore.separator === '_' }"
                                    @click="downloadStore.separator = '_'"
                                >
                                    下划线
                                </button>
                                <button
                                    class="separator-btn"
                                    :class="{ active: downloadStore.separator === ' ' }"
                                    @click="downloadStore.separator = ' '"
                                >
                                    空格
                                </button>
                                <input
                                    type="text"
                                    v-model="downloadStore.separator"
                                    class="separator-input"
                                    placeholder="自定义"
                                />
                            </div>
                        </div>

                        <!-- 组件排序 -->
                        <div class="components-section">
                            <div class="components-label">拖拽调整顺序</div>
                            <div class="format-components">
                                <div
                                    v-for="(component, index) in formatComponents"
                                    :key="component.id"
                                    class="format-item"
                                >
                                    <span>{{ getComponentLabel(component.type) }}</span>
                                    <div class="format-actions">
                                        <button
                                            class="action-icon-btn"
                                            @click="moveComponentUp(index)"
                                            :disabled="index === 0"
                                        >
                                            <i class="fas fa-arrow-up"></i>
                                        </button>
                                        <button
                                            class="action-icon-btn"
                                            @click="moveComponentDown(index)"
                                            :disabled="index === formatComponents.length - 1"
                                        >
                                            <i class="fas fa-arrow-down"></i>
                                        </button>
                                        <button
                                            class="action-icon-btn delete"
                                            @click="removeComponent(index)"
                                            :disabled="formatComponents.length <= 1"
                                        >
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="add-components">
                                    <button
                                        class="add-btn"
                                        @click="addComponent('songName')"
                                        :disabled="hasComponent('songName')"
                                    >
                                        + 歌曲名
                                    </button>
                                    <button
                                        class="add-btn"
                                        @click="addComponent('artistName')"
                                        :disabled="hasComponent('artistName')"
                                    >
                                        + 艺术家
                                    </button>
                                    <button
                                        class="add-btn"
                                        @click="addComponent('albumName')"
                                        :disabled="hasComponent('albumName')"
                                    >
                                        + 专辑名
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 自定义格式 -->
                        <div class="custom-format-section">
                            <div class="custom-format-label">自定义格式</div>
                            <input
                                type="text"
                                v-model="downloadStore.filenameFormat"
                                class="custom-format-input"
                                placeholder="{artistName} - {songName} - {albumName}"
                            />
                            <div class="format-hint">
                                <i class="fas fa-info-circle"></i>
                                可用变量: {songName}, {artistName}, {albumName}
                            </div>
                        </div>

                        <!-- 预览 -->
                        <div class="format-preview">
                            <div class="preview-label">预览</div>
                            <div class="preview-content">{{ formatPreview }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useDownloadStore } from '@/stores/download';
import { useDownload } from '@/composables/useDownload';

const downloadStore = useDownloadStore();
const { pauseDownload, resumeDownload, cancelDownload, deleteDownload: deleteDownloadFile } = useDownload();

const activeTab = ref('downloading');
const showSettings = ref(false);
const defaultDownloadPath = ref('');

// 格式组件（用于拖拽排序）
const formatComponents = ref([
    { id: 1, type: 'songName' },
    { id: 2, type: 'artistName' }
]);

onMounted(async () => {
    // 加载下载列表
    await downloadStore.loadDownloads();

    // 获取默认下载路径
    if (window.electronAPI) {
        defaultDownloadPath.value = await window.electronAPI.getDownloadsPath();
        if (!downloadStore.downloadPath) {
            downloadStore.setDownloadPath(defaultDownloadPath.value);
        }
    }

    // 初始化格式组件
    updateFormatComponents();
});

const getArtistName = (songInfo) => {
    if (!songInfo) return '未知艺术家';
    if (songInfo.ar && Array.isArray(songInfo.ar)) {
        return songInfo.ar.map(a => a.name).join(',');
    }
    if (songInfo.SingerName) return songInfo.SingerName;
    return '未知艺术家';
};

const formatSpeed = (speed) => {
    if (speed < 1024) return `${speed.toFixed(0)} B/s`;
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(2)} KB/s`;
    return `${(speed / 1024 / 1024).toFixed(2)} MB/s`;
};

const formatFileSize = (size) => {
    if (!size) return '未知';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const handleImageError = (e) => {
    e.target.src = '/images/default_cover.png';
};

const selectDownloadPath = async () => {
    if (window.electronAPI) {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            downloadStore.setDownloadPath(path);
        }
    }
};

const openDownloadPath = async () => {
    if (window.electronAPI && downloadStore.downloadPath) {
        await window.electronAPI.openDirectory(downloadStore.downloadPath);
    }
};

const saveSettings = async () => {
    // 保存到后端配置
    if (window.electron) {
        try {
            // 保存下载路径
            window.electron.ipcRenderer.send('set-store-value', 'set.downloadPath', downloadStore.downloadPath);

            // 保存文件名格式
            window.electron.ipcRenderer.send('set-store-value', 'set.downloadNameFormat', downloadStore.filenameFormat);

            // 保存分隔符
            window.electron.ipcRenderer.send('set-store-value', 'set.downloadSeparator', downloadStore.separator);

            console.log('下载设置已保存');

            // 显示成功提示
            alert('设置已保存');
        } catch (error) {
            console.error('保存设置失败:', error);
            alert('保存设置失败: ' + error.message);
        }
    }

    // 设置也会自动通过 pinia-plugin-persistedstate 保存到 localStorage
    showSettings.value = false;
};

const playDownloadedSong = (item) => {
    // TODO: 实现播放已下载的歌曲
    console.log('播放歌曲:', item);
};

const openFolder = async (filePath) => {
    if (window.electronAPI) {
        const dirPath = filePath.substring(0, filePath.lastIndexOf('\\'));
        await window.electronAPI.openDirectory(dirPath);
    }
};

const deleteDownload = async (filePath) => {
    if (confirm('确定要删除这个文件吗?')) {
        await deleteDownloadFile(filePath);
    }
};

// 格式组件相关方法
const getComponentLabel = (type) => {
    const labels = {
        songName: '歌曲名',
        artistName: '艺术家',
        albumName: '专辑名'
    };
    return labels[type] || type;
};

const moveComponentUp = (index) => {
    if (index > 0) {
        const temp = formatComponents.value.splice(index, 1)[0];
        formatComponents.value.splice(index - 1, 0, temp);
    }
};

const moveComponentDown = (index) => {
    if (index < formatComponents.value.length - 1) {
        const temp = formatComponents.value.splice(index, 1)[0];
        formatComponents.value.splice(index + 1, 0, temp);
    }
};

const addComponent = (type) => {
    if (!formatComponents.value.some(c => c.type === type)) {
        formatComponents.value.push({
            id: Date.now(),
            type
        });
    }
};

const removeComponent = (index) => {
    if (formatComponents.value.length > 1) {
        formatComponents.value.splice(index, 1);
    }
};

const hasComponent = (type) => {
    return formatComponents.value.some(c => c.type === type);
};

// 根据格式更新组件
const updateFormatComponents = () => {
    const format = downloadStore.filenameFormat;
    const matches = Array.from(format.matchAll(/\{(\w+)\}/g));

    if (matches.length === 0) {
        formatComponents.value = [
            { id: 1, type: 'songName' },
            { id: 2, type: 'artistName' }
        ];
        return;
    }

    formatComponents.value = matches.map((match, index) => ({
        id: index + 1,
        type: match[1]
    }));
};

// 监听组件变化更新格式
watch(formatComponents, (newComponents) => {
    let format = '';
    newComponents.forEach((component, index) => {
        format += `{${component.type}}`;
        if (index < newComponents.length - 1) {
            format += downloadStore.separator;
        }
    });
    downloadStore.filenameFormat = format;
}, { deep: true });

// 监听分隔符变化更新格式
watch(() => downloadStore.separator, (newSeparator) => {
    if (formatComponents.value.length > 1) {
        let format = '';
        formatComponents.value.forEach((component, index) => {
            format += `{${component.type}}`;
            if (index < formatComponents.value.length - 1) {
                format += newSeparator;
            }
        });
        downloadStore.filenameFormat = format;
    }
});

// 格式预览
const formatPreview = computed(() => {
    const format = downloadStore.filenameFormat;
    return format
        .replace(/\{songName\}/g, '莫失莫忘')
        .replace(/\{artistName\}/g, '香蜜沉沉烬如霜')
        .replace(/\{albumName\}/g, '电视剧原声带');
});
</script>

<style scoped>
.download-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--background-color);
    color: var(--text-color);
}

.download-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid var(--border-color);
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.settings-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--background-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s;
}

.settings-btn:hover {
    background: var(--primary-color);
    color: white;
}

.download-tabs {
    display: flex;
    padding: 0 30px;
    border-bottom: 1px solid var(--border-color);
}

.tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    cursor: pointer;
    position: relative;
    color: var(--text-color-secondary);
    transition: color 0.2s;
}

.tab-item:hover {
    color: var(--text-color);
}

.tab-item.active {
    color: var(--primary-color);
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-color);
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--primary-color);
    color: white;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
}

.download-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 30px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: var(--text-color-secondary);
}

.empty-state i {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state p {
    font-size: 16px;
}

.download-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.download-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--background-color-secondary);
    border-radius: 8px;
    transition: all 0.2s;
}

.download-item:hover {
    background: var(--border-color);
}

.song-cover {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
}

.song-info {
    flex: 1;
    min-width: 0;
}

.song-name {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.song-artist {
    font-size: 13px;
    color: var(--text-color-secondary);
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
}

.progress-fill {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s;
}

.download-stats {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-color-secondary);
}

.file-info {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--text-color-secondary);
}

.download-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.settings-drawer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
}

.drawer-content {
    width: 420px;
    height: 100%;
    background: var(--background-color);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
}

.drawer-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text-color);
    cursor: pointer;
    transition: background 0.2s;
}

.close-btn:hover {
    background: var(--border-color);
}

.drawer-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.save-btn {
    padding: 8px 20px;
    background: var(--primary-color);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.save-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.save-btn:active {
    transform: translateY(0);
}

.setting-section {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--background-color-secondary);
    border-radius: 12px;
}

.setting-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-color);
}

.setting-desc {
    font-size: 13px;
    color: var(--text-color-secondary);
    margin-bottom: 12px;
}

.path-selector {
    display: flex;
    gap: 8px;
}

.path-selector input {
    flex: 1;
    padding: 10px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 14px;
}

.select-btn,
.open-btn {
    padding: 10px 16px;
    background: var(--primary-color);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: opacity 0.2s;
    font-size: 14px;
    white-space: nowrap;
}

.open-btn {
    padding: 10px 12px;
}

.select-btn:hover,
.open-btn:hover {
    opacity: 0.9;
}

.preset-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.preset-btn {
    flex: 1;
    padding: 8px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.preset-btn:hover {
    border-color: var(--primary-color);
}

.preset-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.separator-section {
    margin-top: 16px;
}

.separator-label {
    font-size: 13px;
    color: var(--text-color-secondary);
    margin-bottom: 8px;
}

.separator-buttons {
    display: flex;
    gap: 8px;
}

.separator-btn {
    padding: 8px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.separator-btn:hover {
    border-color: var(--primary-color);
}

.separator-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.separator-input {
    width: 80px;
    padding: 8px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 13px;
}

.components-section {
    margin-top: 16px;
}

.components-label {
    font-size: 13px;
    color: var(--text-color-secondary);
    margin-bottom: 8px;
}

.format-components {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.format-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
}

.format-actions {
    display: flex;
    gap: 4px;
}

.action-icon-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 12px;
}

.action-icon-btn:hover:not(:disabled) {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.action-icon-btn.delete:hover:not(:disabled) {
    background: #ff4444;
    border-color: #ff4444;
}

.action-icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.add-components {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.add-btn {
    padding: 8px 12px;
    background: var(--background-color);
    border: 1px dashed var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.add-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.custom-format-section {
    margin-top: 16px;
}

.custom-format-label {
    font-size: 13px;
    color: var(--text-color-secondary);
    margin-bottom: 8px;
}

.custom-format-input {
    width: 100%;
    padding: 10px 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 14px;
    box-sizing: border-box;
}

.format-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: #ff9800;
}

.format-preview {
    margin-top: 16px;
    padding: 12px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
}

.preview-label {
    font-size: 12px;
    color: var(--text-color-secondary);
    margin-bottom: 6px;
}

.preview-content {
    font-size: 14px;
    color: var(--text-color);
    font-weight: 500;
}
</style>
