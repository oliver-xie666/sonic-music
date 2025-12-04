<template>
  <div class="streaming-page">
    <div class="page-header">
      <h1>流媒体</h1>
      <p class="subtitle">在线音乐流媒体服务</p>
    </div>

    <div class="empty-state">
      <i class="fas fa-broadcast-tower"></i>
      <h2>流媒体功能开发中</h2>
      <p>敬请期待...</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.streaming-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 10px 0;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-state i {
  font-size: 80px;
  color: var(--secondary-color);
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0 0 10px 0;
}

.empty-state p {
  font-size: 16px;
  color: #999;
  margin: 0;
}
</style>
