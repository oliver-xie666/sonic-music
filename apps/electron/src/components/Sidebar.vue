<template>
  <div class="side-nav">
    <router-link to="/" class="nav-button" :class="{ active: $route.path === '/' }" data-tip="首页">
      <i class="fas fa-home"></i>
    </router-link>

    <router-link to="/discover" class="nav-button" :class="{ active: $route.path === '/discover' }" data-tip="发现">
      <i class="fas fa-compass"></i>
    </router-link>

    <router-link to="/library" class="nav-button" :class="{ active: $route.path === '/library' }" data-tip="音乐库">
      <i class="fas fa-music"></i>
    </router-link>

    <div class="nav-divider"></div>

    <router-link to="/streaming" class="nav-button" :class="{ active: $route.path === '/streaming' }" data-tip="流媒体">
      <i class="fas fa-broadcast-tower"></i>
    </router-link>

    <router-link to="/local-music" class="nav-button" :class="{ active: $route.path === '/local-music' }" data-tip="本地音乐">
      <i class="fas fa-folder"></i>
    </router-link>

    <div class="nav-divider"></div>

    <router-link to="/settings" class="nav-button" :class="{ active: $route.path === '/settings' }" data-tip="设置">
      <i class="fas fa-cog"></i>
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.side-nav {
  position: fixed;
  top: 50%;
  left: 20px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-app-region: drag;
  z-index: 15;
  background-color: var(--background-color-secondary);
  border-radius: 12px;
  transform: translate(0, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-button {
  height: 46px;
  width: 46px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  text-decoration: none;
  border-radius: 10px;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.nav-button i {
  font-size: 20px;
  color: var(--text-color);
  transition: color 0.2s ease;
}

.nav-button:hover {
  background-color: var(--primary-color);
}

.nav-button:hover i {
  color: white;
}

.nav-button:active {
  transform: scale(0.92);
  transition: 0.2s;
}

.nav-button.active {
  background-color: var(--primary-color);
}

.nav-button.active i {
  color: white;
}

.nav-divider {
  width: 30px;
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}

/* Tooltip效果 */
.nav-button::after {
  content: attr(data-tip);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  position: absolute;
  top: 50%;
  left: 100%;
  margin-left: 15px;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 14px;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.nav-button:hover::after {
  opacity: 1;
}

/* 平板端适配 (≤1024px) */
@media screen and (max-width: 1024px) {
  .side-nav {
    left: 10px;
    padding: 12px;
  }

  .nav-button {
    height: 42px;
    width: 42px;
    margin: 6px 0;
  }

  .nav-button i {
    font-size: 18px;
  }
}

/* 移动端适配 (≤768px) - 底部导航栏 */
@media screen and (max-width: 768px) {
  .side-nav {
    top: auto;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
    padding: 10px 15px;
    border-radius: 20px;
    width: auto;
    max-width: calc(100% - 40px);
  }

  .nav-button {
    height: 44px;
    width: 44px;
    margin: 0 6px;
  }

  .nav-button i {
    font-size: 20px;
  }

  .nav-divider {
    width: 1px;
    height: 30px;
    margin: 0 6px;
  }

  /* 移动端隐藏 Tooltip */
  .nav-button::after {
    display: none;
  }
}

/* 小屏手机适配 (≤480px) */
@media screen and (max-width: 480px) {
  .side-nav {
    bottom: 70px;
    padding: 8px 12px;
    border-radius: 18px;
  }

  .nav-button {
    height: 40px;
    width: 40px;
    margin: 0 4px;
  }

  .nav-button i {
    font-size: 18px;
  }

  .nav-divider {
    height: 26px;
    margin: 0 4px;
  }
}
</style>
