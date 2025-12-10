import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        // 关闭行为: 'ask' | 'minimize' | 'close'
        closeAction: 'ask',
        // 其他设置可以在这里添加
        theme: 'light',
        language: 'zh-CN',
    }),
    actions: {
        setCloseAction(action) {
            this.closeAction = action;
        },
        setTheme(theme) {
            this.theme = theme;
        },
        setLanguage(language) {
            this.language = language;
        },
        resetSettings() {
            this.closeAction = 'ask';
            this.theme = 'light';
            this.language = 'zh-CN';
        }
    },
    getters: {
        shouldAskOnClose: (state) => state.closeAction === 'ask',
        shouldMinimizeOnClose: (state) => state.closeAction === 'minimize',
        shouldCloseOnClose: (state) => state.closeAction === 'close',
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'sonic-music-settings',
                storage: localStorage,
                paths: ['closeAction', 'theme', 'language'],
            },
        ],
    },
});
