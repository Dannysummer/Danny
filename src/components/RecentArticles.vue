<template>
  <div class="recent-articles">
    <div class="recent-header">
      <Icon icon="mdi:clock-outline" class="recent-icon" />
      <span class="recent-title">最新文章</span>
    </div>
    <div class="recent-list">
      <div
        v-for="article in recentArticles" 
        :key="article.id"
        class="recent-item"
        @click="navigateToArticle(article)"
      >
        <div class="article-cover">
          <img :src="article.cover" :alt="article.title">
        </div>
        <div class="article-info">
          <div class="article-title">{{ article.title }}</div>
          <div class="article-meta">
            <span class="article-date">{{ article.createTime }}</span>
            <span class="article-views">{{ article.views }} 阅读</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { timelineData } from '../data/articles'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const recentArticles = ref(
  timelineData
    .flatMap(year => year.articles)
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 2)
)

const navigateToArticle = (article: any) => {
  router.push({
    name: 'article',
    params: { id: article.id },
    query: { from: 'recent' }
  })
}
</script>

<style scoped>
.recent-articles {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 168, 255, 0.2);
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  .recent-icon {
    font-size: 1.5em;
    color: #2196F3;
  }
  
  .recent-title {
    font-size: 1.2em;
    color: #fff;
    font-weight: bold;
  }
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
  
  .article-cover {
    width: 80px;
    height: 60px;
    overflow: hidden;
    border-radius: 8px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }
  
  .article-info {
    flex: 1;
    
    .article-title {
      font-size: 1em;
      color: #fff;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .article-meta {
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style> 