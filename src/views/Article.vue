<template>
  <div class="article-page">
    <div class="bg-image">
      <img src="/archiving/article-archiving-bg.jpg" alt="背景" />
      <div class="bg-overlay"></div>
    </div>
    
    <!-- 使用 ArticleContent 组件 -->
    <ArticleContent 
      v-if="article"
      :article="article"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleById } from '../data/articles'
import ArticleContent from '../components/ArticleContent.vue'
import type { Article } from '../data/articles'

const route = useRoute()
const router = useRouter()
const article = ref<Article | null>(null)

onMounted(() => {
  const articleId = Number(route.params.id)
  const foundArticle = getArticleById(articleId)
  
  if (foundArticle) {
    article.value = foundArticle
  } else {
    // 文章不存在时重定向
    router.push('/404')
  }
})
</script>

<style scoped>
.article-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  /* backdrop-filter: brightness(0.7); */
}

/* 暗色主题适配 */
html.dark-theme .article-page {
  .bg-overlay {
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: brightness(0.5);
  }
}
</style> 