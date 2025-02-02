<template>
  <div class="memoir-container">
    <h1 class="memoir-title">朝花夕拾</h1>
    <div class="memoir-nav">
      <router-link to="/memoir/essays" class="nav-item">
        <Icon icon="mdi:pencil-outline" />
        <span>随笔</span>
      </router-link>
      <router-link to="/memoir/gallery" class="nav-item">
        <Icon icon="mdi:image-multiple-outline" />
        <span>相册</span>
      </router-link>
      <router-link to="/memoir/reading" class="nav-item">
        <Icon icon="mdi:book-open-page-variant-outline" />
        <span>阅读</span>
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<style scoped>
.memoir-container {
  padding: 20px;
}

.memoir-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
  color: var(--text-color);
}

.memoir-nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.nav-item:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.nav-item .iconify {
  font-size: 2rem;
  margin-bottom: 8px;
}

.nav-item.router-link-active {
  opacity: 1;
  color: var(--primary-color);
}
</style> 