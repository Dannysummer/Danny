<template>
  <div class="article-archiving">
    <!-- Banner 区域 -->
    <div class="archiving-banner">
      <h1 class="banner-title">文章整理</h1>
      <p class="banner-subtitle">记录生活，分享感悟</p>
    </div>

    <!-- 导航栏 -->
    <div class="archiving-nav">
      <div class="nav-container">
        <div class="nav-item" 
             v-for="item in navItems" 
             :key="item.key"
             :class="{ active: currentTab === item.key }"
             @click="currentTab = item.key">
          <Icon :icon="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.text }}</span>
          <span class="nav-count">({{ item.count }})</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <img class="bg-image" src="/archiving/article-archiving-bg.jpg" alt="背景" />
      <div class="content-container">
        <!-- 诗歌组件 -->
        <div class="poetry-section">
          <MyPoetry />
        </div>
        
        <!-- 主要内容区域 -->
        <div class="main-content">
          <!-- 左侧时光轴 -->
          <div class="timeline-container">
            <transition name="fade" mode="out-in">
              <div v-if="currentTab === 'time'" class="timeline-container">
                <!-- 加载状态 -->
                <div v-if="isLoading" class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>正在加载文章数据...</p>
                </div>
                
                <!-- 空状态 -->
                <div v-else-if="archiveData.length === 0" class="empty-state">
                  <div class="empty-icon">📝</div>
                  <h3>暂无文章数据</h3>
                  <p>API接口未实现或返回空数据</p>
                  <p class="api-hint">请实现: <code>GET /api/articles/archive</code></p>
                  <p class="doc-link">详见: <a href="/src/docs/api-interfaces-required.md" target="_blank">API接口文档</a></p>
                </div>
                
                <!-- 正常内容 -->
                <template v-else>
                  <div class="timeline-header">
                    <Icon icon="mdi:text-box-multiple" class="header-icon" />
                    <span class="header-text">全部文章 - 
                      <span class="article-count" ref="countEl">
                        {{ currentCount }}
                      </span>
                    </span>
                  </div>
                <div class="year-filter">
                  <button 
                    class="all-articles-btn"
                    :class="{ active: selectedYear === 'all' }"
                    @click="selectedYear = 'all'"
                  >
                    <Icon icon="mdi:view-list" class="btn-icon" />
                    全部文章
                  </button>
                  <div class="year-selector"
                      ref="yearSelector"
                      @mousedown="startYearDrag"
                      @touchstart.passive="startYearDrag"
                      @mousemove="dragYear"
                      @touchmove="dragYear"
                      @mouseup="stopYearDrag"
                      @touchend="stopYearDrag"
                      @mouseleave="handleMouseLeave">
                    <div class="year-carousel">
                      <div v-for="year in yearOptions" 
                           :key="year"
                           class="year-number"
                           :class="{ active: selectedYear === year }">
                        {{ year }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="timeline">
                  <div class="year-section" v-for="year in currentPageData" :key="year.year">
                    <div class="year-point"></div>
                    <h2 class="year-title">{{ year.year }}</h2>
                    <template v-if="selectedYear !== 'all' && year.monthGroups">
                      <div v-for="monthGroup in year.monthGroups" :key="monthGroup.month" class="month-section">
                        <div class="month-point"></div>
                        <h3 class="month-title">{{ monthGroup.month }}月</h3>
                        <div class="article-item" v-for="article in monthGroup.articles" :key="article.id"
                             @click="navigateToArticle(article)">
                          <div class="time-point"></div>
                          <div class="article-content">
                            <div class="article-main">
                              <div class="article-cover">
                                <img :src="article.cover" :alt="article.title">
                              </div>
                              <div class="article-info">
                                <div class="article-date">
                                  <Icon icon="mdi:calendar" />
                                  {{ formatDate(article.createTime) }}
                                </div>
                                <h3 class="article-title">{{ article.title }}</h3>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="article-item" v-for="article in year.articles" :key="article.id"
                           @click="navigateToArticle(article)">
                        <div class="time-point"></div>
                        <div class="article-content">
                          <div class="article-main">
                            <div class="article-cover">
                              <img :src="article.cover" :alt="article.title">
                            </div>
                            <div class="article-info">
                              <div class="article-date">
                                <Icon icon="mdi:calendar" />
                                {{ formatDate(article.createTime) }}
                              </div>
                              <h3 class="article-title">{{ article.title }}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                
                <!-- 添加分页器 -->
                <div class="pagination">
                  <button 
                    class="page-btn" 
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                  >
                    <Icon icon="mdi:chevron-left" />
                  </button>
                  
                  <div class="page-numbers">
                    <button 
                      v-for="page in totalPages" 
                      :key="page"
                      class="page-number"
                      :class="{ active: currentPage === page }"
                      @click="currentPage = page"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button 
                    class="page-btn" 
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                  >
                    <Icon icon="mdi:chevron-right" />
                  </button>
                </div>
                </template>
              </div>
              
              <div v-else-if="currentTab === 'tags'" class="timeline-container">
                <TagCloud :tags="tagsList" @select-tag="handleTagSelect" />
                <TagBarChart :tags="tagsList" />
              </div>
              
              <div v-else-if="currentTab === 'category'" class="timeline-container">
                <CategoryPieChart :data="categoryData" />
              </div>

              <div v-else-if="currentTab === 'archive'" class="timeline-container">
                <ArticleLineChart :data="monthlyData" />
              </div>
            </transition>
          </div>

          <!-- 右侧功能卡片 -->
          <div class="sidebar">
            <profile-card />
            <WelcomeBoard />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { getArticleArchive, type Article, type ArchiveData } from '../services/article'
import { formatDate } from '../utils/formatDate'
import WelcomeBoard from '../components/WelcomeBoard.vue'
import ProfileCard from '../components/ProfileCard.vue'
import MyPoetry from '../components/MyPoetry.vue'
import TagCloud from '../components/TagCloud.vue'
import TagBarChart from '../components/TagBarChart.vue'
import CategoryPieChart from '../components/CategoryPieChart.vue'
import ArticleLineChart from '../components/ArticleLineChart.vue'

const router = useRouter()
const currentTab = ref('time')
const currentCount = ref(0)

// 归档数据
const archiveData = ref<ArchiveData[]>([])
const isLoading = ref(true)

const navItems = [
  { key: 'time', text: '时光轴', icon: 'mdi:timeline-clock', count: currentCount },
  { key: 'category', text: '文章分类', icon: 'mdi:folder-multiple', count: 12 },
  { key: 'tags', text: '文章标签', icon: 'mdi:tag-multiple', count: 36 },
  { key: 'archive', text: '文章归档', icon: 'mdi:archive', count: 15 }
]

// 计算文章总数
const targetCount = computed(() => {
  return archiveData.value.reduce((sum, year) => sum + year.articles.length, 0)
})

const currentPage = ref(1)
const pageSize = 10 // 每页显示的文章数

// 计算总页数
const totalPages = computed(() => {
  const totalArticles = filteredData.value.reduce((sum, year) => sum + year.articles.length, 0)
  return Math.ceil(totalArticles / pageSize)
})

// 年份选择器相关
const yearOptions = computed(() => {
  const years = archiveData.value.map((item: ArchiveData) => item.year)
  const sortedYears = years.sort((a: string, b: string) => Number(b) - Number(a))
  return sortedYears.length > 0 ? sortedYears : ['—']
})

const selectedYear = ref('all')

const yearSelector = ref<HTMLElement | null>(null)
let isDragging = ref(false)
let startX = ref(0)
let currentOffset = ref(0)
let targetOffset = ref(0)

const dragYear = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || yearOptions.value[0] === '—') return
  e.preventDefault()
  
  const event = e instanceof MouseEvent ? e : e.touches[0]
  const deltaX = event.clientX - startX.value
  const newOffset = currentOffset.value + deltaX
  
  // 计算拖动边界
  const carousel = yearSelector.value?.querySelector('.year-carousel') as HTMLElement
  if (carousel) {
    const itemWidth = carousel.offsetWidth / 3  // 每个年份占据容器的三分之一
    // const currentIndex = yearOptions.value.indexOf(selectedYear.value)
    // 计算偏移量，使选中项居中
    const centerOffset = (carousel.offsetWidth - itemWidth) / 2
    const maxOffset = centerOffset
    const minOffset = -((yearOptions.value.length - 1) * itemWidth - centerOffset)
    const boundedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))
    
    carousel.style.transform = `translateX(${boundedOffset}px)`
  }
}

const stopYearDrag = () => {
  if (yearOptions.value[0] === '—') return
  isDragging.value = false
  
  if (yearSelector.value) {
    const carousel = yearSelector.value.querySelector('.year-carousel') as HTMLElement
    if (carousel) {
      const itemWidth = carousel.offsetWidth / 3
      const deltaX = (event as MouseEvent)?.clientX ? (event as MouseEvent).clientX - startX.value : 0
      
      // 计算最近的年份位置
      const currentIndex = yearOptions.value.indexOf(selectedYear.value)
      let newIndex = currentIndex
      
      if (Math.abs(deltaX) > itemWidth / 4) {
        newIndex = deltaX > 0 ? currentIndex - 1 : currentIndex + 1
        newIndex = Math.max(0, Math.min(newIndex, yearOptions.value.length - 1))
      }
      
      // 更新选中的年份
      selectedYear.value = yearOptions.value[newIndex]
      
      // 计算使选中项精确居中的偏移量
      const centerOffset = (carousel.offsetWidth - itemWidth) / 2
      targetOffset.value = centerOffset - (newIndex * itemWidth)
      
      // 添加弹性动画效果
      carousel.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      carousel.style.transform = `translateX(${targetOffset.value}px)`
      
      setTimeout(() => {
        carousel.style.transition = ''
      }, 300)
    }
  }
}

const handleMouseLeave = () => {
  if (isDragging.value) {
    isDragging.value = false
    // 恢复到当前选中项的位置
    if (yearSelector.value) {
      const carousel = yearSelector.value.querySelector('.year-carousel') as HTMLElement
      if (carousel) {
        carousel.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        carousel.style.transform = `translateX(${targetOffset.value}px)`
        setTimeout(() => {
          carousel.style.transition = ''
        }, 300)
      }
    }
  }
}

// 修改文章数据过滤逻辑
const filteredData = computed(() => {
  if (selectedYear.value === 'all') {
    return archiveData.value
  }
  return archiveData.value.filter((year: ArchiveData) => year.year === selectedYear.value)
})

// 在 script 部分添加
interface ArticleWithMonth {
  month: string
  articles: Article[]
}

const groupArticlesByMonth = (articles: Article[]) => {
  const grouped: { [key: string]: Article[] } = {}
  
  articles.forEach(article => {
    const month = article.createTime.slice(5, 7)
    if (!grouped[month]) {
      grouped[month] = []
    }
    grouped[month].push(article)
  })
  
  return Object.entries(grouped)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([month, articles]) => ({
      month,
      articles
    }))
}

// 修改 currentPageData 的计算逻辑
const currentPageData = computed(() => {
  const allArticles = []
  for (const year of filteredData.value) {
    for (const article of year.articles) {
      allArticles.push({ ...article, year: year.year })
    }
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const pageArticles = allArticles.slice(start, end)
  
  // 重新按年份分组
  const result = []
  const groupedByYear: { [key: string]: { year: string; articles: Article[], monthGroups?: ArticleWithMonth[] } } = {}
  
  for (const article of pageArticles) {
    if (!groupedByYear[article.year]) {
      groupedByYear[article.year] = {
        year: article.year,
        articles: []
      }
      result.push(groupedByYear[article.year])
    }
    groupedByYear[article.year].articles.push(article)
  }
  
  // 如果不是"全部文章"模式，则按月份分组
  if (selectedYear.value !== 'all') {
    result.forEach(yearGroup => {
      yearGroup.monthGroups = groupArticlesByMonth(yearGroup.articles)
    })
  }
  
  return result
})

// 加载归档数据
const loadArchiveData = async () => {
  try {
    isLoading.value = true
    const data = await getArticleArchive()
    archiveData.value = data
    console.log('归档数据加载成功:', data.length)
  } catch (error) {
    console.error('加载归档数据失败:', error)
    archiveData.value = []
  } finally {
    isLoading.value = false
  }
}

// 数字滚动动画
const startCountAnimation = () => {
  const duration = 1000
  const start = 0
  const end = targetCount.value
  const startTime = performance.now()

  function updateCount(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    currentCount.value = Math.floor(start + (end - start) * progress)
    
    if (progress < 1) {
      requestAnimationFrame(updateCount)
    }
  }

  requestAnimationFrame(updateCount)
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadArchiveData()
  // 数据加载完成后开始计数动画
  if (targetCount.value > 0) {
    startCountAnimation()
  }
  
  // 初始化时居中当前选中的年份
  if (yearSelector.value) {
    const carousel = yearSelector.value.querySelector('.year-carousel') as HTMLElement
    if (carousel) {
      const itemWidth = carousel.offsetWidth / 3
      const currentIndex = yearOptions.value.indexOf(selectedYear.value)
      const centerOffset = (carousel.offsetWidth - itemWidth) / 2
      targetOffset.value = centerOffset - (currentIndex * itemWidth)
      carousel.style.transform = `translateX(${targetOffset.value}px)`
    }
  }
})

const startYearDrag = (e: MouseEvent | TouchEvent) => {
  if (yearOptions.value[0] === '—') return
  isDragging.value = true
  const event = e instanceof MouseEvent ? e : e.touches[0]
  startX.value = event.clientX
  currentOffset.value = targetOffset.value
}

// 生成标签数据
const tagsList = computed(() => {
  const tagsMap = new Map()
  
  // 从文章数据中统计标签
  archiveData.value.forEach((year: ArchiveData) => {
    year.articles.forEach((article: Article) => {
      if (article.tags) {
        article.tags.forEach((tag: string) => {
          const count = tagsMap.get(tag) || 0
          tagsMap.set(tag, count + 1)
        })
      }
    })
  })
  
  // 转换为数组格式
  return Array.from(tagsMap.entries()).map(([name, count]) => ({
    name,
    count: count as number
  }))
})

// 处理标签选择
const handleTagSelect = (tag: string) => {
  // 这里可以添加标签筛选逻辑
  console.log('Selected tag:', tag)
}

// 生成分类数据
const categoryData = computed(() => {
  const categoryMap = new Map()
  
  archiveData.value.forEach((year: ArchiveData) => {
    year.articles.forEach((article: Article) => {
      // 这里假设每篇文章都有一个category属性，如果没有可以根据实际情况调整
      const category = article.category || '未分类'
      const count = categoryMap.get(category) || 0
      categoryMap.set(category, count + 1)
    })
  })
  
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: value as number
  }))
})

// 计算每月文章数量
const monthlyData = computed(() => {
  const monthMap = new Map()
  
  archiveData.value.forEach((year: ArchiveData) => {
    year.articles.forEach((article: Article) => {
      const month = article.createTime.substring(0, 7) // 获取 YYYY-MM
      const count = monthMap.get(month) || 0
      monthMap.set(month, count + 1)
    })
  })
  
  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({
      month,
      count: count as number
    }))
})

const navigateToArticle = (article: Article) => {
  console.log('Navigating to article:', article) // 调试日志
  router.push({
    name: 'article',
    params: { id: article.id },
    query: { from: 'archive' }
  })
}
</script>

<style scoped>
.article-archiving {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: calc(var(--footer-height) + 40px);
  z-index: 1;  /* 确保整体内容在背景之上 */
}

.archiving-banner {
  position: relative;
  height: 600px;
  width: 100%;
  padding: 60px 40px;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/archiving/archiving-banner-bg.png') center/cover;
  color: #fff;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  z-index: 2;  /* 确保 banner 在背景之上 */
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.banner-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.archiving-nav {
  width: 100%;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  z-index: 100;
  flex-shrink: 0;
}

.nav-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 12px 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.nav-item:hover {
  background: rgba(52, 152, 219, 0.1);
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 暗色主题适配 */
html.dark-theme .archiving-nav {
  background: var(--bg-primary);
}

html.dark-theme .nav-item:hover {
  background: rgba(135, 206, 235, 0.15);
}

html.dark-theme .nav-item.active {
  background: rgba(135, 206, 235, 0.25);
  color: #87CEEB;
}

.content-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  z-index: 1;  /* 确保内容在背景之上 */
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;  /* 确保背景在最底层 */
}

.content-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  margin-bottom: 60px;
  width: 100%;
}

.poetry-section {
  width: 100%;
}

.main-content {
  display: flex;
  gap: 20px;
  width: 100%;
}

.timeline-container {
  flex: 1;
  max-width: 1040px!important;
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  color: #fff;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline {
  position: relative;
  padding-left: 46px;
  padding-right: 8px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(52, 152, 219, 0.3) transparent;
}

/* 添加时间线 */
.timeline::before {
  content: '';
  position: absolute;
  left: 27px;
  top: 24px;
  bottom: 10px;
  width: 2px;
  background: rgb(52, 152, 219);
  opacity: 0.2;
  z-index: 1;
}

/* 自定义滚动条样式 */
.timeline::-webkit-scrollbar {
  width: 6px;
}

.timeline::-webkit-scrollbar-track {
  background: transparent;
}

.timeline::-webkit-scrollbar-thumb {
  background-color: rgba(52, 152, 219, 0.3);
  border-radius: 3px;
}

.timeline::-webkit-scrollbar-thumb:hover {
  background-color: rgba(52, 152, 219, 0.5);
}

.year-section {
  position: relative;
  margin-bottom: 0px;
  padding-top: 8px;
  padding-bottom: 4px;
}

.year-point {
  position: absolute;
  left: -25px;
  top: 24px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgb(255, 140, 0);
  background: transparent;
  z-index: 2;
}

.year-point::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(255, 140, 0);
}

.year-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #fff;
  padding-left: 10px;
  line-height: 1.8;
}

.article-item {
  position: relative;
  padding-left: 30px;
  margin-bottom: 12px;
  cursor: pointer;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.time-point {
  position: absolute;
  left: -23px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(52, 152, 219);
  border: 2px solid rgb(52, 152, 219);
  z-index: 1;
}

.article-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  transition: all 0.3s ease;
  width: 98%;
  border-radius: 10px;
  border: none !important;
}

.article-content:hover {
  transform: translateX(5px);
}

.article-main {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.article-info {
  flex: 1;
}

.article-cover {
  width: 120px;
  min-width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 10px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-content:hover .article-cover img {
  transform: scale(1.05);
}

.article-title {
  color: #fff;
  font-weight: normal;
  transition: color 0.3s ease;
  margin-bottom: 8px;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-content:hover .article-title {
  color: #3498db;
}

.article-date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.6rem;
  margin-bottom: 16px;
  color: #fff;
  padding-left: 16px;
}

.header-icon {
  font-size: 1.4rem;
  color: #fff;
}

.header-text {
  font-weight: 500;
  letter-spacing: 1px;
}

.article-count {
  color: rgb(52, 152, 219);
  text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
  font-weight: bold;
  margin-left: 4px;
}

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-header, .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.stat-content {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-item strong {
  font-size: 1.2rem;
  color: #3498db;
}

/* 暗色主题适配 */
html.dark-theme .timeline-container {
  background: rgba(30, 30, 30, 0.6);
}

html.dark-theme .article-content {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: none !important;
}

html.dark-theme .article-content:hover {
  background: rgba(135, 206, 235, 0.1);
}

@media (max-width: 768px) {
  .content-container {
    padding: 20px;
  }

  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}

/* 分页器样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(52, 152, 219, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: rgba(52, 152, 219, 0.2);
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: rgba(52, 152, 219, 0.1);
}

.page-number.active {
  background: rgb(52, 152, 219);
  color: #fff;
}

/* 暗色主题适配 */
html.dark-theme .page-btn,
html.dark-theme .page-number {
  color: #fff;
}

html.dark-theme .page-number.active {
  background: rgb(52, 152, 219);
}

/* 年份选择器样式 */
.year-filter {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 0 16px 20px;
  padding: 8px;
}

.all-articles-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
}

.all-articles-btn.active {
  background: #3498db;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
}

.year-selector {
  position: relative;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  margin-left: auto;
  width: 300px;
  padding: 0;
  cursor: grab;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 修改中央选择框样式 */
.year-selector::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 32px;
  background: #3498db;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
  z-index: 1;
  /* opacity: 0.3; */
}

.year-carousel {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  overflow: visible;
}

.year-number {
  padding: 6px 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
  width: calc(100% / 3);  /* 每个年份占据容器的三分之一 */
  text-align: center;
  flex-shrink: 0;
  opacity: 0.6;
  transform: scale(0.9);
}

.year-number.active {
  color: #fff;
  font-weight: bold;
  transform: scale(1.1);
  text-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
  z-index: 3;
  opacity: 1;
}

/* 当只有占位符时的样式 */
.year-number:only-child {
  cursor: default;
  transform: none;
  opacity: 0.4;
}

/* 添加月份节点的样式 */
.month-section {
  position: relative;
  margin-bottom: 20px;
  padding-left: 10px;
}

.month-point {
  position: absolute;
  left: -25px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #39ff14;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.5);
  z-index: 2;
}

.month-title {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
}

/* 修改时间轴样式 */
.timeline::before {
  content: '';
  position: absolute;
  left: 27px;
  top: 24px;
  bottom: 10px;
  width: 2px;
  background: rgb(52, 152, 219);
  opacity: 0.2;
  z-index: 1;
}

/* 修改节点样式，确保穿过时间轴 */
.year-point,
.month-point,
.time-point {
  z-index: 3;
  box-shadow: 0 0 0 4px var(--bg-primary);
}

.time-point {
  background: rgb(52, 152, 219);
  border: 2px solid rgb(52, 152, 219);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 确保图表容器样式适配 */
.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #fff;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #fff;
}

.empty-state p {
  margin-bottom: 8px;
  opacity: 0.8;
  line-height: 1.6;
}

.api-hint {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
  color: #ffc107;
}

.api-hint code {
  background: rgba(255, 193, 7, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}

.doc-link a {
  color: #3498db;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.doc-link a:hover {
  color: #5dade2;
}
</style> 