// Sonic Music Demo Plugin - Background Script

console.log('🎵 Sonic Demo Plugin background script loaded!');

// 监听插件安装事件
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Plugin installed:', details);

    if (details.reason === 'install') {
        console.log('✅ Sonic Demo Plugin 首次安装');

        // 初始化存储
        chrome.storage.local.set({
            installTime: new Date().toISOString(),
            version: '1.0.0'
        });
    } else if (details.reason === 'update') {
        console.log('🔄 Sonic Demo Plugin 已更新');
    }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);

    if (request.type === 'TEST_CLICK') {
        console.log('测试点击事件:', request.data);

        // 响应消息
        sendResponse({
            success: true,
            message: 'Background script received your message!',
            timestamp: new Date().toISOString()
        });
    }

    return true; // 保持消息通道开放
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('存储变化:', areaName, changes);

    for (let key in changes) {
        const change = changes[key];
        console.log(`  ${key}: ${change.oldValue} -> ${change.newValue}`);
    }
});

// 定期输出日志（每30秒）
setInterval(() => {
    chrome.storage.local.get(['testData'], (result) => {
        if (result.testData) {
            console.log('📊 当前统计:', result.testData);
        }
    });
}, 30000);

console.log('✅ Sonic Demo Plugin background script initialized!');
