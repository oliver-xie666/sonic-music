<template>
    <div>
        <!-- Alert 模态框 -->
        <div v-if="showAlert" class="modal-overlay">
            <div class="modal">
                <h3>{{ alertMessage }}</h3>
                <button @click="confirmAlert" class="btn">{{ i18n.global.t('que-ding') }}</button>
            </div>
        </div>

        <!-- Confirm 模态框 -->
        <div v-if="showConfirm" class="modal-overlay">
            <div class="modal">
                <h3>{{ confirmMessage }}</h3>
                <div class="buttons">
                    <button @click="confirmAction(true)" class="btn">{{ i18n.global.t('que-ding') }}</button>
                    <button @click="confirmAction(false)" class="btn">{{ i18n.global.t('qu-xiao') }}</button>
                </div>
            </div>
        </div>

        <!-- Prompt 模态框 -->
        <div v-if="showPrompt" class="modal-overlay">
            <div class="modal">
                <h3>{{ promptMessage }}</h3>
                <input type="text" v-model="promptInput" class="prompt-input" />
                <div class="buttons">
                    <button @click="submitPrompt" class="btn">{{ i18n.global.t('que-ding') }}</button>
                    <button @click="closePrompt" class="btn">{{ i18n.global.t('qu-xiao') }}</button>
                </div>
            </div>
        </div>

        <!-- Loading 遮罩 -->
        <div v-if="showLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p class="loading-text">{{ i18n.global.t('shao-nv-qi-dao-zhong') }}</p>
        </div>

        <!-- 关闭确认弹窗 -->
        <div v-if="showCloseConfirm" class="modal-overlay">
            <div class="modal close-confirm-modal">
                <h3>{{ i18n.global.t('close-app-title') }}</h3>
                <p class="close-description">{{ i18n.global.t('close-app-description') }}</p>

                <div class="remember-choice">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="rememberChoice" class="checkbox-input" />
                        <span class="checkbox-text">{{ i18n.global.t('remember-choice') }}</span>
                    </label>
                </div>

                <div class="buttons close-buttons">
                    <button @click="handleCloseAction('minimize')" class="btn btn-primary">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
                        </svg>
                        {{ i18n.global.t('minimize-to-tray') }}
                    </button>
                    <button @click="handleCloseAction('close')" class="btn btn-secondary">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                        </svg>
                        {{ i18n.global.t('exit-app') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import i18n from '@/utils/i18n';
// Custom Modal Component for Sonic Music
// window.$modal.alert('这是一个 Alert'); // 直接调用 window.$modal
// const result = await window.$modal.confirm('这是一个 Confirm');
// const result = await window.$modal.prompt('请输入内容：', '默认值');
// window.$modal.showLoading(); //开启
// window.$modal.hideLoading(); //关闭

// 控制模态框的状态
const showAlert = ref(false);
const showConfirm = ref(false);
const showPrompt = ref(false);
const showLoading = ref(false);
const showCloseConfirm = ref(false);

// 消息内容
const alertMessage = ref('');
const confirmMessage = ref('');
const promptMessage = ref('');
const promptInput = ref('');
const rememberChoice = ref(false);

// Alert 方法
let alertResolve;
const customAlert = (message) => {
    alertMessage.value = message;
    showAlert.value = true;
    return new Promise((resolve) => {
        alertResolve = resolve;
    });
};

const confirmAlert = () => {
    showAlert.value = false;
    alertResolve(); // 在点击确定按钮时，执行 resolve 以继续后续代码
};

// Confirm 方法
let confirmResolve;
const customConfirm = (message) => {
    confirmMessage.value = message;
    showConfirm.value = true;
    return new Promise((resolve) => {
        confirmResolve = resolve;
    });
};

const confirmAction = (confirmed) => {
    showConfirm.value = false;
    confirmResolve(confirmed);
};

// Prompt 方法
let promptResolve;
const customPrompt = (message, defaultValue = '') => {
    promptMessage.value = message;
    promptInput.value = defaultValue;
    showPrompt.value = true;
    return new Promise((resolve) => {
        promptResolve = resolve;
    });
};

const submitPrompt = () => {
    showPrompt.value = false;
    promptResolve(promptInput.value);
};

const closePrompt = () => {
    showPrompt.value = false;
};

// Loading 方法
const showCustomLoading = () => {
    showLoading.value = true;
};

const hideCustomLoading = () => {
    showLoading.value = false;
};

// 关闭确认弹窗方法
let closeConfirmResolve;
const showCloseConfirmDialog = () => {
    showCloseConfirm.value = true;
    rememberChoice.value = false;
    return new Promise((resolve) => {
        closeConfirmResolve = resolve;
    });
};

const handleCloseAction = (action) => {
    showCloseConfirm.value = false;
    closeConfirmResolve({ action, remember: rememberChoice.value });
};

// 暴露方法供父组件使用
defineExpose({
    customAlert,
    customConfirm,
    customPrompt,
    showCustomLoading,
    hideCustomLoading,
    showCloseConfirmDialog
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999999;
}

.modal {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 400px;
}

.modal h3{
    overflow-wrap: anywhere;
    color: var(--primary-color);
}

.buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 15px;
}

.prompt-input {
    width: 379px;
    padding: 10px;
    margin-top: 15px;
    border-radius: 5px;
    border: 1px solid var(--primary-color);
}

.btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 10px;
    font-size: 20px;
    width: auto;
}


.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    flex-direction: column;
}

.loading-spinner {
    border: 8px solid rgba(255, 255, 255, 0.3);
    border-top: 8px solid var(--primary-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}
/* 文字样式 */
.loading-text {
    margin-top: 11px;
    font-size: 1.1rem;
    color: #ff85a2;
    font-weight: bold;
    font-family: 'Poppins', sans-serif;
    text-align: center;
    letter-spacing: 1px;
    margin-left: 24px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 关闭确认弹窗样式 */
.close-confirm-modal {
    max-width: 450px;
    padding: 35px;
}

.close-description {
    color: #666;
    font-size: 15px;
    margin: 15px 0 25px;
    line-height: 1.6;
}

.remember-choice {
    margin: 20px 0;
    padding: 15px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
    border-radius: 8px;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.checkbox-input {
    width: 18px;
    height: 18px;
    margin-right: 10px;
    cursor: pointer;
    accent-color: var(--primary-color);
}

.checkbox-text {
    color: #555;
    font-size: 14px;
}

.close-buttons {
    display: flex;
    gap: 12px;
    margin-top: 25px;
    flex-direction: column;
}

.btn-primary {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #2563EB, #7C3AED);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-secondary:hover {
    background: linear-gradient(135deg, #DC2626, #B91C1C);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-icon {
    width: 18px;
    height: 18px;
}

.btn:active {
    transform: translateY(0);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .modal {
        background-color: #1f2937;
        color: #f3f4f6;
    }

    .modal h3 {
        color: #60a5fa;
    }

    .close-description {
        color: #d1d5db;
    }

    .checkbox-text {
        color: #d1d5db;
    }

    .remember-choice {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
        border-color: rgba(59, 130, 246, 0.2);
    }
}
</style>