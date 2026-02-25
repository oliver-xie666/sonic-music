<template>
  <header>
    <div class="header-content">
      <div class="header-left">
        <img src="@/assets/images/logo.svg" alt="Sonic Music" class="logo">
        <h1 class="app-name">Sonic Music</h1>
      </div>

      <div class="header-right">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('sou-suo-yin-le-ge-shou-ge-dan')"
            @keydown.enter="getSearch"
          >
          <i class="fas fa-search search-icon" @click="getSearch"></i>
        </div>

        <div class="profile" @click="toggleProfile">
          <img
            :src="MoeAuth.UserInfo ? MoeAuth.UserInfo.pic : './assets/images/profile.jpg'"
            alt="Profile Picture"
          >
          <div v-if="showProfile" class="profile-menu">
            <!-- 用户信息区域 -->
            <div class="user-info-header">
              <img
                :src="MoeAuth.UserInfo ? MoeAuth.UserInfo.pic : './assets/images/profile.jpg'"
                alt="Profile"
                class="user-avatar"
              >
              <div class="user-details">
                <p class="user-name">{{ MoeAuth.UserInfo ? MoeAuth.UserInfo.nickname : $t('you-ke') }}</p>
              </div>
            </div>

            <!-- 菜单项 -->
            <ul>
              <li>
                <router-link to="/settings">
                  <i class="fas fa-cog" /> {{ $t('she-zhi') }}
                </router-link>
              </li>
              <li>
                <a v-if="MoeAuth.isAuthenticated" @click="logout">
                  <i class="fas fa-sign-out-alt" /> {{ $t('tui-chu-deng-lu') }}
                </a>
                <router-link v-else to="/login">
                  <i class="fas fa-sign-in-alt" /> {{ $t('deng-lu') }}
                </router-link>
              </li>
              <li class="theme-toggle-item" @click.stop>
                <span class="theme-label">
                  <i :class="isDarkTheme ? 'fas fa-moon' : 'fas fa-sun'" /> {{ $t('zhu-ti') }}
                </span>
                <label class="theme-switch" @click.stop>
                  <input type="checkbox" :checked="isDarkTheme" @change="toggleTheme">
                  <span class="slider"></span>
                </label>
              </li>
              <!-- <li v-if="isElectron">
                <a @click="restartApp">
                  <i class="fas fa-redo" /> {{ $t('zhong-qi') }}
                </a>
              </li> -->
              <li>
                <a @click="refreshPage">
                  <i class="fas fa-sync-alt" /> {{ $t('shua-xin') }}
                </a>
              </li>
              <li>
                <a
                  style="position: relative;"
                  @click="openRegisterUrl(downloadUrl || 'https://github.com/oliver-xie666/sonic-music/releases')"
                >
                  <i class="fab fa-github" /> {{ $t('geng-xin') }}
                  <i v-if="showNewBadge" class="new-badge">new</i>
                </a>
              </li>
              <li>
                <a @click="Disclaimer()">
                  <i class="fas fa-info-circle" /> {{ $t('guan-yu') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div v-if="isDisclaimerVisible" class="modal-overlay" @click="Disclaimer">
    <div class="modal-content" @click.stop>
      <h2>{{ $t('mian-ze-sheng-ming') }}</h2>
      <p>{{ $t('0-ben-cheng-xu-shi-ku-gou-di-san-fang-ke-hu-duan-bing-fei-ku-gou-guan-fang-xu-yao-geng-wan-shan-de-gong-neng-qing-xia-zai-guan-fang-ke-hu-duan-ti-yan') }}</p>
      <p>{{ $t('1-ben-xiang-mu-jin-gong-xue-xi-shi-yong-qing-zun-zhong-ban-quan-qing-wu-li-yong-ci-xiang-mu-cong-shi-shang-ye-hang-wei-ji-fei-fa-yong-tu') }}</p>
      <p>{{ $t('2-shi-yong-ben-xiang-mu-de-guo-cheng-zhong-ke-neng-hui-chan-sheng-ban-quan-shu-ju-dui-yu-zhe-xie-ban-quan-shu-ju-ben-xiang-mu-bu-yong-you-ta-men-de-suo-you-quan-wei-le-bi-mian-qin-quan-shi-yong-zhe-wu-bi-zai-24-xiao-shi-nei-qing-chu-shi-yong-ben-xiang-mu-de-guo-cheng-zhong-suo-chan-sheng-de-ban-quan-shu-ju') }}</p>
      <p>{{ $t('3-you-yu-shi-yong-ben-xiang-mu-chan-sheng-de-bao-kuo-you-yu-ben-xie-yi-huo-you-yu-shi-yong-huo-wu-fa-shi-yong-ben-xiang-mu-er-yin-qi-de-ren-he-xing-zhi-de-ren-he-zhi-jie-jian-jie-te-shu-ou-ran-huo-jie-guo-xing-sun-hai-bao-kuo-dan-bu-xian-yu-yin-shang-yu-sun-shi-ting-gong-ji-suan-ji-gu-zhang-huo-gu-zhang-yin-qi-de-sun-hai-pei-chang-huo-ren-he-ji-suo-you-qi-ta-shang-ye-sun-hai-huo-sun-shi-you-shi-yong-zhe-fu-ze') }}</p>
      <p>{{ $t('4-jin-zhi-zai-wei-fan-dang-di-fa-lv-fa-gui-de-qing-kuang-xia-shi-yong-ben-xiang-mu-dui-yu-shi-yong-zhe-zai-ming-zhi-huo-bu-zhi-dang-di-fa-lv-fa-gui-bu-yun-xu-de-qing-kuang-xia-shi-yong-ben-xiang-mu-suo-zao-cheng-de-ren-he-wei-fa-wei-gui-hang-wei-you-shi-yong-zhe-cheng-dan-ben-xiang-mu-bu-cheng-dan-you-ci-zao-cheng-de-ren-he-zhi-jie-jian-jie-te-shu-ou-ran-huo-jie-guo-xing-ze-ren') }}</p>
      <p>{{ $t('5-yin-le-ping-tai-bu-yi-qing-zun-zhong-ban-quan-zhi-chi-zheng-ban') }}</p>
      <p>{{ $t('6-ben-xiang-mu-jin-yong-yu-dui-ji-shu-ke-hang-xing-de-tan-suo-ji-yan-jiu-bu-jie-shou-ren-he-shang-ye-bao-kuo-dan-bu-xian-yu-guang-gao-deng-he-zuo-ji-juan-zeng') }}</p>
      <p>{{ $t('7-ru-guo-guan-fang-yin-le-ping-tai-jue-de-ben-xiang-mu-bu-tuo-ke-lian-xi-ben-xiang-mu-geng-gai-huo-yi-chu') }}</p>
      <button @click="Disclaimer">{{ $t('guan-bi') }}</button>
      <div class="version-number">
        © Sonic Music <span v-if="appVersion">V{{ appVersion }} - {{ platform }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { MoeAuthStore } from '../stores/store';
import { openRegisterUrl } from '../utils/utils';
import { useI18n } from 'vue-i18n';

const MoeAuth = MoeAuthStore();
const searchQuery = ref('');
const isDisclaimerVisible = ref(false);
const router = useRouter();
const { t } = useI18n();
const showNewBadge = ref(false);
const downloadUrl = ref('');
const appVersion = ref('');
const platform = ref('');
const showProfile = ref(false);
const isDarkTheme = ref(false);
const isElectron = typeof window !== 'undefined' && typeof window.electron !== 'undefined';

onMounted(() => {
  if (window.electron) {
    window.electron.ipcRenderer.on('version', (version) => {
      appVersion.value = version;
      fetchLatestVersion();
      platform.value = window.electron.platform;
      localStorage.setItem('version', version);
    });
  }
  document.addEventListener('click', handleClickOutside);

  // 初始化主题
  const savedTheme = localStorage.getItem('theme');
  isDarkTheme.value = savedTheme === 'dark';
  document.documentElement.classList.toggle('dark', isDarkTheme.value);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const Disclaimer = () => {
  isDisclaimerVisible.value = !isDisclaimerVisible.value;
};

const logout = async () => {
  const result = await window.$modal.confirm(t('ni-que-ren-yao-tui-chu-deng-lu-ma'));
  if (result) {
    MoeAuth.clearData();
    router.push({ path: '/' });
  }
};

const toggleProfile = () => {
  showProfile.value = !showProfile.value;
};

const getSearch = () => {
  if (searchQuery.value.trim() !== '') {
    if (searchQuery.value.includes('collection_')) {
      router.push({
        path: '/PlaylistDetail',
        query: { global_collection_id: searchQuery.value }
      });
      return;
    }
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    });
  }
};

const handleClickOutside = (event) => {
  const queueProfile = document.querySelector('.profile-menu');
  if (queueProfile && !queueProfile.contains(event.target) && !event.target.closest('.profile')) {
    showProfile.value = false;
  }
};

const fetchLatestVersion = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/oliver-xie666/sonic-music/releases/latest');
    const data = await response.json();
    downloadUrl.value = data.html_url;
    const latestVersion = data.tag_name.replace(/^v/, '');
    if (isVersionLower(appVersion.value, latestVersion)) {
      showNewBadge.value = true;
    }
  } catch (error) {
    console.error('获取最新版本号失败:', error);
  }
};

const isVersionLower = (current, latest) => {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
      return true;
    } else if ((latestParts[i] || 0) < (currentParts[i] || 0)) {
      return false;
    }
  }
  return false;
};

// 主题切换
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  document.documentElement.classList.toggle('dark', isDarkTheme.value);
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
};

// 重启应用（仅 Electron）
const restartApp = () => {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('restart');
  }
};

// 刷新页面
const refreshPage = () => {
  window.location.reload();
};
</script>

<style scoped>
header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  right: 0;
  top: 32px;
  height: 60px;
  z-index: 9;
  -webkit-app-region: drag;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30px 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
}

.logo {
  width: 60px;
  height: 60px;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--background-color);
  border-radius: 20px;
  padding: 8px 15px;
  -webkit-app-region: no-drag;
}

.search-icon {
  color: var(--secondary-color);
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  -webkit-app-region: no-drag;
}

.search-icon:hover,
.search-icon:active {
  color: var(--primary-color);
  transform: scale(1.2);
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--text-color);
  width: 300px;
  -webkit-app-region: no-drag;
}

.search-bar input::placeholder {
  color: #999;
}

.profile {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  -webkit-app-region: no-drag;
}

.profile img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: var(--background-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  animation: fadeInOut 0.3s ease-in-out;
  overflow: hidden;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户信息区域 */
.user-info-header {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info-header img {
  width: 30px;
}

.user-info-header:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 菜单列表 */
.profile-menu ul {
  list-style: none;
  padding: 8px 0;
  margin: 0;
}

.profile-menu li {
  margin: 0;
}

.profile-menu li a {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px 15px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 14px;
}

.profile-menu li a:hover {
  background-color: var(--hover-color);
}

.profile-menu li a i {
  width: 18px;
  font-size: 16px;
  color: var(--secondary-color);
}

/* 主题切换项特殊样式 */
.theme-toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  cursor: default;
  transition: background-color 0.2s;
}

.theme-toggle-item:hover {
  background-color: #f5f5f5;
}

.theme-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-color);
  font-size: 14px;
}

.theme-label i {
  width: 18px;
  font-size: 16px;
  color: var(--secondary-color);
}

/* Switch 开关样式 */
.theme-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.theme-switch input:checked + .slider {
  background-color: var(--primary-color);
}

.theme-switch input:checked + .slider:before {
  transform: translateX(18px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: left;
  animation: fadeIn 0.3s ease;
}

.modal-content h2 {
  margin-top: 0;
  color: var(--primary-color);
}

.modal-content p {
  margin: 10px 0;
  line-height: 1.6;
}

.modal-content button {
  margin-top: 15px;
  padding: 8px 12px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.new-badge {
  position: absolute;
  top: 1px;
  left: 67px;
  background-color: red;
  color: white;
  padding: 0px 4px;
  border-radius: 5px;
  font-size: 14px;
}

.version-number {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #666;
}

/* 平板端适配 (≤1024px) */
@media screen and (max-width: 1024px) {
  .header-content {
    padding: 0 20px 0 15px;
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .app-name {
    font-size: 18px;
  }

  .search-bar input {
    width: 200px;
  }
}

/* 移动端适配 (≤768px) */
@media screen and (max-width: 768px) {
  header {
    top: 0;
    height: 56px;
  }

  .header-content {
    padding: 0 15px;
  }

  .header-left {
    gap: 8px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .app-name {
    font-size: 16px;
  }

  .header-right {
    gap: 12px;
  }

  .search-bar {
    padding: 6px 12px;
  }

  .search-bar input {
    width: 150px;
    font-size: 13px;
  }

  .profile {
    width: 36px;
    height: 36px;
  }

  .profile-menu {
    top: 46px;
  }
}

/* 小屏手机适配 (≤480px) */
@media screen and (max-width: 480px) {
  header {
    height: 52px;
  }

  .header-content {
    padding: 0 12px;
  }

  .header-left {
    gap: 6px;
  }

  .logo {
    width: 36px;
    height: 36px;
  }

  .app-name {
    display: none; /* 隐藏应用名称以节省空间 */
  }

  .header-right {
    gap: 8px;
  }

  .search-bar {
    padding: 5px 10px;
    border-radius: 16px;
  }

  .search-bar input {
    width: 120px;
    font-size: 12px;
  }

  .profile {
    width: 32px;
    height: 32px;
  }

  .profile-menu {
    top: 42px;
    right: -10px;
  }

  .modal-content {
    padding: 15px;
    max-width: calc(100% - 30px);
  }

  .modal-content h2 {
    font-size: 18px;
  }

  .modal-content p {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* 超小屏手机适配 (≤375px) */
@media screen and (max-width: 375px) {
  .search-bar input {
    width: 100px;
  }

  .search-bar i {
    font-size: 12px;
  }
}
</style>
