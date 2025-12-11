// Sonic Music Demo Plugin - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    const testBtn = document.getElementById('testBtn');
    const clearBtn = document.getElementById('clearBtn');
    const messageDiv = document.getElementById('message');
    const statusDiv = document.getElementById('status');

    // 显示消息
    function showMessage(text, type = 'success') {
        messageDiv.textContent = text;
        messageDiv.className = `status ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // 测试功能按钮
    testBtn.addEventListener('click', async function() {
        try {
            // 保存测试数据到 storage
            const testData = {
                timestamp: new Date().toISOString(),
                message: 'Hello from Sonic Music Plugin!',
                clickCount: 0
            };

            // 获取之前的点击次数
            const result = await chrome.storage.local.get(['testData']);
            if (result.testData) {
                testData.clickCount = (result.testData.clickCount || 0) + 1;
            }

            await chrome.storage.local.set({ testData });

            showMessage(`✅ 测试成功！点击次数: ${testData.clickCount}`, 'success');
            statusDiv.textContent = `✅ 运行中 (${testData.clickCount} 次点击)`;

            // 发送消息到 background script
            chrome.runtime.sendMessage({
                type: 'TEST_CLICK',
                data: testData
            }, (response) => {
                console.log('Background response:', response);
            });

        } catch (error) {
            console.error('测试失败:', error);
            showMessage('❌ 测试失败: ' + error.message, 'error');
        }
    });

    // 清除数据按钮
    clearBtn.addEventListener('click', async function() {
        try {
            await chrome.storage.local.clear();
            showMessage('🗑️ 数据已清除', 'success');
            statusDiv.textContent = '✅ 运行中';
        } catch (error) {
            console.error('清除失败:', error);
            showMessage('❌ 清除失败: ' + error.message, 'error');
        }
    });

    // 加载初始数据
    chrome.storage.local.get(['testData'], function(result) {
        if (result.testData) {
            statusDiv.textContent = `✅ 运行中 (${result.testData.clickCount || 0} 次点击)`;
        }
    });

    console.log('Sonic Demo Plugin popup loaded!');
});
