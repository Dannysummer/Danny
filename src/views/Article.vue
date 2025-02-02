<template>
  <div class="article-page">
    <!-- Banner 区域 -->
    <div class="article-banner">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <div class="meta-item">
          <Icon icon="mdi:calendar" />
          <span>发表于 {{ article.createTime }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:clock-outline" />
          <span>更新于 {{ article.updateTime }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:eye" />
          <span>{{ article.views }} 次浏览</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:message-text" />
          <span>{{ article.comments }} 条评论</span>
        </div>
      </div>
    </div>

    <!-- 文章内容区域 -->
    <div class="article-content">
      <!-- 文章内容将在这里渲染 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// 模拟文章数据
const article = ref({
  title: '疫情下的大学生活',
  createTime: '2021-03-06',
  updateTime: '2022-01-05',
  views: 558,
  comments: 44,
  content: ''
})
</script>

<style scoped>
.article-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
}

.article-banner {
  position: relative;
  width: 100%;
  padding: 60px 40px;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/images/article-banner-bg.jpg') center/cover;
  color: #fff;
  text-align: center;
  overflow: hidden;
}

.article-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(4px);
  z-index: 0;
}

.article-title {
  position: relative;
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  z-index: 1;
}

.article-meta {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  z-index: 1;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item .iconify {
  font-size: 1.1rem;
}

.article-content {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

/* 暗色主题适配 */
html.dark-theme .article-banner {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
              url('/images/article-banner-bg.jpg') center/cover;
}

@media (max-width: 768px) {
  .article-banner {
    padding: 40px 20px;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 16px;
  }

  .meta-item {
    font-size: 0.9rem;
  }
}
</style> 