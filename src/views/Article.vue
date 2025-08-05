<template>
  <div class="article-page">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">返回首页</button>
    </div>

    <!-- 文章未发布状态 -->
    <div v-else-if="article && !isPublished" class="unpublished-container">
      <div class="unpublished-icon">🔒</div>
      <h2>文章未发布</h2>
      <p>该文章尚未发布或已下线</p>
      <button @click="goBack" class="back-button">返回首页</button>
    </div>

    <!-- 正常显示文章 -->
    <template v-else-if="article && isPublished">
      <div class="bg-image">
        <img src="/archiving/article-archiving-bg.jpg" alt="背景" />
        <div class="bg-overlay"></div>
      </div>
      

      
      <!-- 使用 ArticleContent 组件 -->
      <ArticleContent 
        :article="article"
      />
    </template>

    <!-- 文章不存在 -->
    <div v-else class="not-found-container">
      <div class="not-found-icon">❓</div>
      <h2>文章不存在</h2>
      <p>未找到指定的文章</p>
      <button @click="goBack" class="back-button">返回首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleContent from '../components/ArticleContent.vue'
import { getPublishedArticleById, type Article } from '../services/article'

// 转换服务返回的 Article 类型为 ArticleContent 组件期望的格式
interface ArticleContentProps {
  id: number
  title: string
  content: string
  createTime: string
  updateTime: string
  views: number
  cover: string
  category?: string
  tags?: string[]
  aiSummary?: string
  readingTime?: string
  wordCount?: number
  commentCount?: number
  author?: string
  license?: string
}

const route = useRoute()
const router = useRouter()

// 响应式数据
const article = ref<ArticleContentProps | null>(null)
const isLoading = ref(true)
const error = ref<string>('')

// 计算属性 - 检查文章是否已发布（简化逻辑，因为服务只返回已发布文章）
const isPublished = computed(() => {
  return article.value !== null
})

// 返回首页
const goBack = () => {
  router.push('/')
}

// 转换服务文章类型为组件期望格式
const convertToArticleContentProps = (serviceArticle: Article): ArticleContentProps => {
  return {
    id: serviceArticle.id,
    title: serviceArticle.title,
    content: serviceArticle.content,
    createTime: serviceArticle.createTime,
    updateTime: serviceArticle.updateTime,
    views: serviceArticle.views,
    cover: serviceArticle.cover,
    category: serviceArticle.category,
    tags: serviceArticle.tags,
    aiSummary: serviceArticle.aiSummary,
    readingTime: '5', // 默认阅读时长
    wordCount: Math.floor(serviceArticle.content.length / 4), // 估算字数
    commentCount: 0,
    author: serviceArticle.author,
    license: serviceArticle.license
  }
}

// 加载文章数据
const loadArticle = async () => {
  const articleId = Number(route.params.id)
  
  if (!articleId || isNaN(articleId)) {
    error.value = '无效的文章ID'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    
    // 使用服务获取已发布文章
    const serviceArticle = await getPublishedArticleById(articleId)
    
    if (serviceArticle) {
      // 转换为组件期望的格式
      article.value = convertToArticleContentProps(serviceArticle)
      console.log('文章加载成功:', article.value.title)
    } else {
      error.value = '文章不存在或未发布'
    }
    
  } catch (fetchError) {
    console.error('加载文章失败:', fetchError)
    error.value = fetchError instanceof Error ? fetchError.message : '加载文章失败'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载文章
onMounted(() => {
  loadArticle()
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

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-primary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-container,
.unpublished-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-icon,
.unpublished-icon,
.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2,
.unpublished-container h2,
.not-found-container h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.error-container p,
.unpublished-container p,
.not-found-container p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #3a7bc8;
  transform: translateY(-2px);
}

/* 暗色主题适配 */
html.dark-theme .article-page {
  .bg-overlay {
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: brightness(0.5);
  }
}

html.dark-theme .error-container,
html.dark-theme .unpublished-container,
html.dark-theme .not-found-container {
  background: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.9);
}

html.dark-theme .error-container h2,
html.dark-theme .unpublished-container h2,
html.dark-theme .not-found-container h2 {
  color: rgba(255, 255, 255, 0.9);
}

html.dark-theme .error-container p,
html.dark-theme .unpublished-container p,
html.dark-theme .not-found-container p {
  color: rgba(255, 255, 255, 0.7);
}

html.dark-theme .loading-container {
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .article-page {
    padding: 10px;
  }
  
  .error-container,
  .unpublished-container,
  .not-found-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .error-icon,
  .unpublished-icon,
  .not-found-icon {
    font-size: 3rem;
  }
  
  .error-container h2,
  .unpublished-container h2,
  .not-found-container h2 {
    font-size: 1.5rem;
  }
}
</style> 