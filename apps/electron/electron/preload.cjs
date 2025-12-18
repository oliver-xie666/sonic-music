const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, listener) => ipcRenderer.on(channel, (event, ...args) => listener(...args)),
        once: (channel, listener) => ipcRenderer.once(channel, (event, ...args) => listener(...args)),
        removeListener: (channel, func) => {
            ipcRenderer.removeListener(channel, func);
        },
        removeAllListeners: (channel) => {
            ipcRenderer.removeAllListeners(channel);
        }
    },
    platform: process.platform
});

// 添加插件管理 API
contextBridge.exposeInMainWorld('electronAPI', {
    // 插件管理
    getExtensions: () => ipcRenderer.invoke('get-extensions'),
    getExtensionsDetailed: () => ipcRenderer.invoke('get-extensions-detailed'),
    reloadExtensions: () => ipcRenderer.invoke('reload-extensions'),
    openExtensionsDir: () => ipcRenderer.invoke('open-extensions-dir'),
    openExtensionPopup: (extensionId, extensionName) => ipcRenderer.invoke('open-extension-popup', extensionId, extensionName),
    installExtension: (extensionPath) => ipcRenderer.invoke('install-extension', extensionPath),
    uninstallExtension: (extensionId) => ipcRenderer.invoke('uninstall-extension', extensionId),
    validateExtension: (extensionPath) => ipcRenderer.invoke('validate-extension', extensionPath),
    getExtensionsDirectory: () => ipcRenderer.invoke('get-extensions-directory'),
    ensureExtensionsDirectory: () => ipcRenderer.invoke('ensure-extensions-directory'),
    installPluginFromZip: (zipPath) => ipcRenderer.invoke('install-plugin-from-zip', zipPath),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

    // 下载管理
    getDownloadedMusic: () => ipcRenderer.invoke('get-downloaded-music'),
    deleteDownloadedMusic: (filePath) => ipcRenderer.invoke('delete-downloaded-music', filePath),
    clearDownloadedMusic: () => ipcRenderer.invoke('clear-downloaded-music'),
    checkMusicDownloaded: (filename) => ipcRenderer.invoke('check-music-downloaded', filename),
    checkSongDownloaded: (songId) => ipcRenderer.invoke('check-song-downloaded', songId),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    openDirectory: (dirPath) => ipcRenderer.invoke('open-directory', dirPath),
    getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
    getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
    setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
});