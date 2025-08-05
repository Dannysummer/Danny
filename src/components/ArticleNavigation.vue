<template>
  <div class="article-navigation">
    <div class="nav-item prev" 
         v-if="prevArticle" 
         @click="navigateToArticle(prevArticle)"
         :style="{ backgroundImage: `url(${prevArticle.cover})` }">
      <div class="nav-overlay">
        <div class="nav-content">
            <div class="desc-icon">
                <div class="nav-icon">
                    <Icon icon="mdi:chevron-left" />
                </div>
                <div class="nav-label">上一篇</div>
            </div>
            <div class="title-description">
                <div class="nav-title">{{ prevArticle.title }}</div>
                <div class="nav-desc">{{ prevArticle.description || '暂无描述' }}</div>    
            </div>  
        </div>
      </div>
    </div>
    <div class="nav-item next" 
         v-if="nextArticle" 
         @click="navigateToArticle(nextArticle)"
         :style="{ backgroundImage: `url(${nextArticle.cover})` }">
      <div class="nav-overlay">
        <div class="nav-content">
            <div class="title-description">
                <div class="nav-title">{{ nextArticle.title }}</div>
                <div class="nav-desc">{{ nextArticle.description || '暂无描述' }}</div>    
            </div>
            <div class="desc-icon">
                <div class="nav-icon">
                    <Icon icon="mdi:chevron-right" />
                </div>
                <div class="nav-label">下一篇</div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { getArticleNavigation, type Article } from '../services/article'

const router = useRouter()

const props = defineProps<{
  currentArticleId: number
}>()

const prevArticle = ref<Article | null>(null)
const nextArticle = ref<Article | null>(null)
const isLoading = ref(true)

// 加载文章导航信息
const loadArticleNavigation = async () => {
  if (!props.currentArticleId) return
  
  try {
    isLoading.value = true
    const navigation = await getArticleNavigation(props.currentArticleId)
    prevArticle.value = navigation.prevArticle
    nextArticle.value = navigation.nextArticle
    console.log('文章导航加载成功')
  } catch (error) {
    console.error('加载文章导航失败:', error)
    prevArticle.value = null
    nextArticle.value = null
  } finally {
    isLoading.value = false
  }
}

// 当当前文章ID变化时重新加载导航
watch(() => props.currentArticleId, (newId) => {
  if (newId) {
    loadArticleNavigation()
  }
}, { immediate: true })

// 组件挂载时加载数据
onMounted(() => {
  loadArticleNavigation()
})

const navigateToArticle = (article: any) => {
  router.push({
    name: 'article',
    params: { id: article.id }
  })
}
</script>

<style scoped>
.article-navigation {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 40px 0;
}

.nav-item {
  flex: 1;
  position: relative;
  height: 120px;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: inherit;
    background-size: cover;
    background-position: center;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    
    &::before {
      transform: scale(1.5);
    }
    
    .nav-overlay {
      background: rgba(0, 0, 0, 0.5);
    }
    
    .nav-icon {
      background: rgba(33, 150, 243, 0.3);
      color: #2196F3;
    }
  }
}

.nav-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 0px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.nav-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 1.4em;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nav-content {
  flex: right;
  margin: 10px 0px;
  
  .nav-label {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }
  
  .nav-title {
    color: #fff;
    font-size: 1.1em;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  
  .title-description {
    margin: 0px 10px 0px;
  }

  .nav-desc {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.desc-icon {
  margin: 10px 10px 0px 10px;
}

.next .nav-overlay {
  flex-direction: row-reverse;
  text-align: right;
}
</style> 