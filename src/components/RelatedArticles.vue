<template>
  <div class="related-articles">
    <div class="related-header">
      <Icon icon="mdi:link-variant" class="related-icon" />
      <span class="related-title">相关推荐</span>
    </div>
    <div class="related-list">
      <div v-for="article in relatedArticles" 
           :key="article.id" 
           class="related-item"
           @click="navigateToArticle(article)">
        <div class="article-cover">
          <img :src="article.cover" :alt="article.title">
        </div>
        <div class="article-info">
          <div class="article-title">{{ article.title }}</div>
          <div class="article-desc">{{ article.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { timelineData } from '../data/articles'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  currentArticle: {
    id: number
    title: string
    description?: string
  }
}>()

// 计算文本相似度（简单实现）
const calculateSimilarity = (text1: string, text2: string) => {
  const set1 = new Set(text1.toLowerCase().split(''))
  const set2 = new Set(text2.toLowerCase().split(''))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  return intersection.size / union.size
}

// 获取相关文章
const relatedArticles = computed(() => {
  const allArticles = timelineData.flatMap(year => year.articles)
  
  return allArticles
    .filter(article => article.id !== props.currentArticle.id)
    .map(article => ({
      ...article,
      similarity: calculateSimilarity(
        `${props.currentArticle.title} ${props.currentArticle.description || ''}`,
        `${article.title} ${article.description || ''}`
      )
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 4)
})

const navigateToArticle = (article: any) => {
  router.push({
    name: 'article',
    params: { id: article.id }
  })
}
</script>

<style scoped>
.related-articles {
  margin: 40px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.related-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  
  .related-icon {
    font-size: 1.4em;
    color: #2196F3;
  }
  
  .related-title {
    font-size: 1.2em;
    color: #fff;
  }
}

.related-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.related-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(33, 150, 243, 0.1);
    
    .article-cover img {
      transform: scale(1.05);
    }
  }
}

.article-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
}

.article-info {
  flex: 1;
  overflow: hidden;
  
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
  
  .article-desc {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style> 