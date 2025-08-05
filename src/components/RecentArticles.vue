<template>
  <div class="recent-articles">
    <div class="recent-header">
      <Icon icon="mdi:clock-outline" class="recent-icon" />
      <span class="recent-title">最新文章</span>
    </div>
    <div class="recent-list" v-if="!isLoading && recentArticles.length > 0">
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
            <span class="article-date">{{ formatDate(article.createTime) }}</span>
            <span class="article-views">{{ article.views }} 阅读</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📰</div>
      <span class="empty-text">暂无最新文章</span>
      <span class="api-hint">请实现 API: GET /api/articles/recent</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { getRecentArticles, type Article } from '../services/article'
import { formatDate } from '../utils/formatDate'

const router = useRouter()

const recentArticles = ref<Article[]>([])
const isLoading = ref(true)

// 加载最新文章
const loadRecentArticles = async () => {
  try {
    isLoading.value = true
    const articles = await getRecentArticles(2) // 获取最新2篇文章
    recentArticles.value = articles
    console.log('最新文章加载成功:', articles.length)
  } catch (error) {
    console.error('加载最新文章失败:', error)
    recentArticles.value = []
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRecentArticles()
})

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

/* 加载和空状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(52, 152, 219, 0.2);
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.empty-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.api-hint {
  font-size: 0.8rem;
  color: rgba(255, 193, 7, 0.8);
  background: rgba(255, 193, 7, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}
</style> 