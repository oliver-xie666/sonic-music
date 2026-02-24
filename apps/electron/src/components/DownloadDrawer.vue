<template>
    <div class="download-drawer-trigger" v-if="!isDownloadPage && isDownloadEnabled">
        <div class="download-badge-wrapper" v-if="downloadStore.activeDownloadCount > 0">
            <span class="download-badge">{{ downloadStore.activeDownloadCount > 99 ? '99+' : downloadStore.activeDownloadCount }}</span>
        </div>
        <button class="download-button" @click="navigateToDownload">
            <i class="fas fa-download"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDownloadStore } from '@/stores/download';

const router = useRouter();
const route = useRoute();
const downloadStore = useDownloadStore();

const isDownloadPage = computed(() => route.path === '/download');

const isDownloadEnabled = ref(false);

const syncDownloadSetting = () => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    isDownloadEnabled.value = settings?.enableDownload === 'on';
};

const onStorageChange = () => syncDownloadSetting();

onMounted(() => {
    syncDownloadSetting();
    window.addEventListener('settings-updated', onStorageChange);
});

onUnmounted(() => {
    window.removeEventListener('settings-updated', onStorageChange);
});

const navigateToDownload = () => {
    router.push('/download');
};
</script>

<style scoped>
.download-drawer-trigger {
    position: fixed;
    right: 24px;
    bottom: 96px;
    z-index: 999;
}

.download-badge-wrapper {
    position: absolute;
    top: -4px;
    right: -4px;
    z-index: 1;
}

.download-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: #ff4444;
    color: white;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
}

.download-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: #666;
}

.download-button:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.download-button i {
    font-size: 18px;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
    .download-button {
        background: rgba(50, 50, 50, 0.8);
        color: #ccc;
    }

    .download-button:hover {
        background: var(--primary-color);
        color: white;
    }
}
</style>
