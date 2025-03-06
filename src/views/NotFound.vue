<template>
  <div class="not-found">
    <div class="container">
      <div class="error-code">404</div>
      <div class="error-message">页面未找到</div>
      <p class="error-description">您访问的页面不存在或已被移除</p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  text-align: center;
  padding: 2rem;
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #1a73e8;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.error-description {
  color: #666;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #1a73e8;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #1557b0;
}
</style> 