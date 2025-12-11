<template>
    <transition name="fade">
        <div v-if="showQueue" class="queue-popup">
            <div class="queue-header">
                <div class="queue-title">
                    <span>{{ $t('bo-fang-lie-biao') }}</span>
                    <span class="queue-count">({{ musicQueueStore.queue.length }})</span>
                </div>
                <div class="queue-header-actions">
                    <i class="fas fa-trash-alt action-btn" @click="musicQueueStore.clearQueue()" title="清空列表"></i>
                    <i class="fas fa-times close-btn" @click="showQueue = false" title="关闭"></i>
                </div>
            </div>

            <RecycleScroller :items="musicQueueStore.queue" :item-size="62" key-field="id" :buffer="200"
                :items-limit="2000" :prerender="Math.min(10, musicQueueStore.queue.length)" ref="queueScroller"
                class="queue-list">
                <template #default="{ item, index }">
                    <li class="queue-item" :class="{ 'playing': currentSong.hash == item.hash }" :key="item.id">
                        <div class="queue-item-left">
                            <div class="queue-cover">
                                <img v-if="item.img" :src="item.img" alt="封面" />
                                <i v-else class="fas fa-music"></i>
                            </div>
                            <div class="queue-song-info">
                                <div class="queue-song-title">{{ item.name }}</div>
                                <div class="queue-artist">{{ item.author }}</div>
                            </div>
                        </div>
                        <div class="queue-actions">
                            <button v-if="currentSong.hash == item.hash"
                                class="queue-play-btn">
                                <i class="fas fa-music"></i>
                            </button>
                            <template v-else>
                                <button class="queue-play-btn" @click="playQueueItem(item)">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="queue-delete-btn" @click="removeSongFromQueue(index)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </template>
                        </div>
                    </li>
                </template>
            </RecycleScroller>
        </div>
    </transition>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { RecycleScroller } from 'vue3-virtual-scroller';
import { useMusicQueueStore } from '../stores/musicQueue';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

const props = defineProps({
    currentSong: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:showQueue', 'addSongToQueue', 'addCloudMusicToQueue', 'addLocalMusicToQueue']);

const musicQueueStore = useMusicQueueStore();
const queueScroller = ref(null);
const showQueue = ref(false);

// 从队列中删除歌曲
const removeSongFromQueue = (index) => {
    const updatedQueue = [...musicQueueStore.queue];
    updatedQueue.splice(index, 1);
    updatedQueue.forEach((song, i) => {
        song.id = i + 1;
    });
    musicQueueStore.setQueue(updatedQueue);
};

// 播放队列中的歌曲项
const playQueueItem = (item) => {
    console.log('[QueueList] 点击播放队列中的歌曲:', item.name);
    showQueue.value = false; // 点击后关闭播放队列面板
    if (item.isCloud) {
        emit('addCloudMusicToQueue', item.hash, item.name, item.author, item.timeLength, item.img);
    }else if(item.isLocal){
        emit('addLocalMusicToQueue', item);
    } else {
        emit('addSongToQueue', item.hash, item.name, item.img, item.author);
    }
};

// 滚动到当前播放歌曲位置
const openQueue = async () => {
    showQueue.value = !showQueue.value;
    if (showQueue.value) {
        await nextTick();
        setTimeout(() => {
            const currentIndex = musicQueueStore.queue.findIndex(song => song.hash === props.currentSong.hash);
            queueScroller.value.scrollToItem(currentIndex - 3);
        }, 100);
    }
};

const handleClickOutside = (event) => {
    const queuePopup = document.querySelector('.queue-popup');
    if (queuePopup && !queuePopup.contains(event.target) && !event.target.closest('.extra-btn')) {
        showQueue.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

defineExpose({
    openQueue,
    removeSongFromQueue
});
</script>
<style scoped>
.queue-popup {
    position: fixed;
    right: 20px;
    bottom: 100px;
    width: 350px;
    max-height: 500px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    overflow: hidden;
    z-index: 2;
}

/* 队列头部 */
.queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
}

.queue-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.queue-count {
    margin-left: 6px;
    font-size: 14px;
    color: #999;
    font-weight: normal;
}

.queue-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-btn,
.close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    color: #666;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
}

/* 队列列表 */
.queue-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    height: 440px;
    scroll-behavior: smooth;
}

/* 队列项 */
.queue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.queue-item:hover {
    background: rgba(0, 0, 0, 0.03);
}

.queue-item.playing {
    background: rgba(var(--primary-color-rgb, 72, 153, 248), 0.08);
}

/* 左侧区域 */
.queue-item-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.queue-cover {
    width: 46px;
    height: 46px;
    border-radius: 6px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.queue-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.queue-cover i {
    font-size: 20px;
    color: #999;
}

.queue-song-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
}

.queue-song-title {
    font-weight: 500;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.queue-artist {
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 正在播放状态 */
.queue-item.playing .queue-song-title {
    color: var(--primary-color);
    font-weight: 600;
}

.queue-item.playing .queue-artist {
    color: var(--primary-color);
    opacity: 0.8;
}

/* 右侧操作按钮 */
.queue-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.queue-play-btn,
.queue-delete-btn {
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.queue-play-btn {
    color: var(--primary-color);
    font-size: 14px;
}

.queue-play-btn:hover {
    background: rgba(var(--primary-color-rgb, 72, 153, 248), 0.1);
    transform: scale(1.1);
}

.queue-delete-btn {
    color: #999;
    font-size: 16px;
    opacity: 0;
    transition: all 0.3s ease;
}

.queue-item:hover .queue-delete-btn {
    opacity: 1;
}

.queue-delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: scale(1.1);
}

/* 滚动条样式 */
.queue-list::-webkit-scrollbar {
    width: 6px;
}

.queue-list::-webkit-scrollbar-track {
    background: transparent;
}

.queue-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.queue-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>