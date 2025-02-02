<template>
  <div class="essays-container">
    <!-- 添加头部 banner -->
    <div class="essays-banner">
      <div class="banner-content">
        <h1>心情随笔</h1>
        <p>记录生活中的点点滴滴</p>
      </div>
      <div class="banner-overlay"></div>
    </div>

    <div class="timeline">
      <!-- 左侧感悟 -->
      <div class="timeline-left">
        <div v-for="(essay, index) in leftEssays" 
             :key="index"
             class="essay-card left"
             :data-essay-id="essay.id"
             :style="getCardStyle(index, 'left')"
             :class="{ 'fade-in': true }">
          <div class="timeline-dot"></div>
          <div class="essay-content"
               :style="{ '--essay-bg': `url(${essayBackgroundMap.get(essay.id)})` }">
            <div class="essay-header">
              <img :src="essay.avatar" :alt="essay.author" class="author-avatar">
              <div class="essay-info">
                <div class="essay-time">{{ formatDateTime(essay.date) }}</div>
                <div class="essay-weather">
                  <i :class="getWeatherIcon(essay.weather.type)"></i>
                  {{ essay.weather.temperature }}°C
                </div>
              </div>
            </div>
            <div class="essay-text">{{ essay.content }}</div>
            <div class="essay-footer">
              <button class="like-btn" 
                      @click="toggleLike(essay)"
                      :class="{ 'liked': essay.isLiked }">
                <i class="fas fa-heart"></i>
                <span class="floating-heart" v-if="floatingHearts[essay.id]">❤</span>
                <span class="breaking-heart" v-if="breakingHearts[essay.id]">💔</span>
                <span>{{ essay.likes }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间轴 -->
      <div class="timeline-center">
        <div class="timeline-line"></div>
        <div v-for="node in timeNodes" 
             :key="node.essayId"
             class="timeline-node"
             :style="getTimeNodeStyle(node)">
          {{ node.month }}
        </div>
      </div>

      <!-- 右侧感悟 -->
      <div class="timeline-right">
        <div v-for="(essay, index) in rightEssays" 
             :key="index"
             class="essay-card right"
             :data-essay-id="essay.id"
             :style="getCardStyle(index, 'right')"
             :class="{ 'fade-in': true }">
          <div class="timeline-dot"></div>
          <div class="essay-content"
               :style="{ '--essay-bg': `url(${essayBackgroundMap.get(essay.id)})` }">
            <div class="essay-header">
              <img :src="essay.avatar" :alt="essay.author" class="author-avatar">
              <div class="essay-info">
                <div class="essay-time">{{ formatDateTime(essay.date) }}</div>
                <div class="essay-weather">
                  <i :class="getWeatherIcon(essay.weather.type)"></i>
                  {{ essay.weather.temperature }}°C
                </div>
              </div>
            </div>
            <div class="essay-text">{{ essay.content }}</div>
            <div class="essay-footer">
              <button class="like-btn" 
                      @click="toggleLike(essay)"
                      :class="{ 'liked': essay.isLiked }">
                <i class="fas fa-heart"></i>
                <span class="floating-heart" v-if="floatingHearts[essay.id]">❤</span>
                <span class="breaking-heart" v-if="breakingHearts[essay.id]">💔</span>
                <span>{{ essay.likes }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { type Essay, essaysData } from '../../data/essays'

// 分页加载
const pageSize = 4
const currentPage = ref(1)
const essays = ref<Essay[]>([])
const isLoading = ref(false)
const hasMore = ref(true)

// 初始加载
onMounted(() => {
  loadInitialEssays()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 加载初始数据
const loadInitialEssays = () => {
  const sortedEssays = [...essaysData].sort((a, b) => {
    // 确保日期比较的准确性
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // 降序：新的在前
  })
  essays.value = sortedEssays
    .slice(0, pageSize)
  hasMore.value = essays.value.length < essaysData.length
}

// 处理滚动加载
const handleScroll = () => {
  if (isLoading.value || !hasMore.value) return
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMoreEssays()
  }
}

// 加载更多数据
const loadMoreEssays = async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const start = currentPage.value * pageSize
  const end = start + pageSize
  const newEssays = [...essaysData]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
    .slice(start, end)
  
  if (newEssays.length > 0) {
    essays.value.push(...newEssays)
    currentPage.value++
  }
  
  hasMore.value = essays.value.length < essaysData.length
  isLoading.value = false
}

// 定义卡片之间的垂直间距范围
const MIN_VERTICAL_GAP = 60
const MAX_VERTICAL_GAP = 120

// 分离左右两侧的文章
const leftEssays = computed(() => 
  [...essays.value] // 创建副本以避免影响原数组
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // 降序：新的在前
    .filter((_, index) => index % 2 === 0)
)

const rightEssays = computed(() => 
  [...essays.value] // 创建副本以避免影响原数组
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // 降序：新的在前
    .filter((_, index) => index % 2 === 1)
)

// 计算卡片位置
const getCardStyle = (index: number, side: 'left' | 'right') => {
  const essay = side === 'left' ? leftEssays.value[index] : rightEssays.value[index]
  const prevEssay = index > 0 
    ? (side === 'left' ? leftEssays.value[index - 1] : rightEssays.value[index - 1])
    : null
  
  let gap = MIN_VERTICAL_GAP
  if (prevEssay) {
    const monthsDiff = getMonthsDifference(prevEssay.date, essay.date)
    // 如果是同月，使用最小间距
    if (monthsDiff === 0) {
      gap = MIN_VERTICAL_GAP
    } 
    // 如果相差一个月以上，根据月份差距计算间距
    else {
      gap = Math.min(Math.max(monthsDiff * 30, MIN_VERTICAL_GAP), MAX_VERTICAL_GAP)
    }
  }
  
  const basePosition: number = index === 0 ? 0 : parseInt(getCardStyle(index - 1, side).marginTop) + gap
  const offset = side === 'right' ? 90 : 0
  return {
    marginTop: `${basePosition + offset}px`
  }
}

// 计算月份差
const getMonthsDifference = (date1: Date, date2: Date) => {
  const months1 = date1.getFullYear() * 12 + date1.getMonth()
  const months2 = date2.getFullYear() * 12 + date2.getMonth()
  return Math.abs(months1 - months2)
}

// 生成时间节点
const timeNodes = computed(() => {
  // 按时间排序的所有文章
  const sortedEssays = essays.value
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // 保持一致的降序排序
  
  // 记录每个月份对应的第一篇文章
  const monthFirstEssays = new Map<string, Essay>()
  
  sortedEssays.forEach(essay => {
    const monthYear = essay.date.toLocaleDateString('zh-CN', {
      month: 'long',
      year: 'numeric'
    })
    if (!monthFirstEssays.has(monthYear)) {
      monthFirstEssays.set(monthYear, essay)
    }
  })
  
  return Array.from(monthFirstEssays.entries())
    .sort((a, b) => b[1].date.getTime() - a[1].date.getTime()) // 确保月份也是降序排序
    .map(([month, essay]) => ({
      month,
      essayId: essay.id
    }))
})

// 格式化日期
const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' ' + date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 点赞功能
const toggleLike = (essay: Essay) => {
  essay.isLiked = !essay.isLiked
  essay.likes += essay.isLiked ? 1 : -1
  if (essay.isLiked) {
    floatingHearts.value[essay.id] = true
    setTimeout(() => {
      floatingHearts.value[essay.id] = false
    }, 1000)
  } else {
    breakingHearts.value[essay.id] = true
    setTimeout(() => {
      breakingHearts.value[essay.id] = false
    }, 1000)
  }
}

const getWeatherIcon = (type: Essay['weather']['type']) => {
  const icons = {
    sunny: 'fas fa-sun',
    cloudy: 'fas fa-cloud',
    rainy: 'fas fa-cloud-rain',
    snowy: 'fas fa-snowflake',
    windy: 'fas fa-wind'
  }
  return icons[type]
}

const breakingHearts = ref<Record<number, boolean>>({})
const floatingHearts = ref<Record<number, boolean>>({})

// 背景图片列表
const essayBackgrounds = [
  '/background/essay/essay-bg1.png',
  '/background/essay/essay-bg2.png',
  '/background/essay/essay-bg3.png',
  '/background/essay/essay-bg4.png',
  '/background/essay/essay-bg5.png'
]

// 获取随机背景图片
const getRandomBackground = () => {
  const index = Math.floor(Math.random() * essayBackgrounds.length)
  return essayBackgrounds[index]
}

// 为每个卡片分配一个固定的背景
const essayBackgroundMap = computed(() => {
  const map = new Map()
  essays.value.forEach(essay => {
    if (!map.has(essay.id)) {
      map.set(essay.id, getRandomBackground())
    }
  })
  return map
})

// 修改时间节点的样式
const getTimeNodeStyle = (node: { month: string, essayId: number }) => {
  // 找到对应的卡片元素
  const essayCard = document.querySelector(`[data-essay-id="${node.essayId}"]`)
  if (!essayCard) return { top: '0px', zIndex: 1 }
  
  // 获取卡片的位置
  const cardRect = essayCard.getBoundingClientRect()
  const timelineRect = document.querySelector('.timeline')?.getBoundingClientRect()
  if (!timelineRect) return { top: '0px', zIndex: 1 }
  
  // 计算相对于时间轴的位置
  const relativeTop = cardRect.top - timelineRect.top + 30 // 30px是卡片中连接点的位置
  
  return {
    top: `${relativeTop}px`,
    zIndex: 1
  }
}
</script>

<style scoped>
.essays-container {
  min-height: 100vh;
  position: relative;
  width: 100%;
  overflow: hidden;
  background-repeat: repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  max-width: 100vw;
  z-index: 0;
}

/* 修改背景容器样式 */
.essays-container::before {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120vw;
  height: 120vh;
  background-image: url('/background/block-paper.png');
  background-repeat: repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  z-index: -2;
}

.timeline {
  position: relative;
  z-index: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2px 1fr;
  gap: 40px;
  margin-top: -60px;
  background: transparent;
  border-radius: 30px 30px 0 0;
}

.timeline-center {
  position: relative;
}

.timeline-line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, 
    rgba(135, 206, 235, 0.2),
    rgba(135, 206, 235, 0.8),
    rgba(135, 206, 235, 0.2)
  );
  z-index: 0;
}

.timeline-node {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #87CEEB;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.3);
  z-index: 1;
  transition: top 0.3s ease;
}

.essay-card {
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  margin-bottom: 30px; /* 添加底部间距 */
}

.essay-card.fade-in {
  animation: fadeInUp 0.8s ease forwards;
}

.essay-content {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(135, 206, 235, 0.2);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

/* 卡片背景图片 */
.essay-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--essay-bg);
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  transition: all 0.4s ease;
  z-index: 0;
  mix-blend-mode: multiply;
}

/* 内容层 */
.essay-header,
.essay-text,
.essay-footer {
  position: relative;
  z-index: 2;
}

.essay-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(135, 206, 235, 0.25);
  border-color: rgba(135, 206, 235, 0.4);
}

.essay-content:hover::before {
  opacity: 0.35;
  filter: contrast(1.05) brightness(1.02);
}

.essay-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.essay-info {
  flex: 1;
}

.essay-time {
  font-size: 0.9rem;
  color: #87CEEB;
  margin-bottom: 4px;
}

.essay-weather {
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.essay-weather i {
  color: #87CEEB;
}

.essay-text {
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 1rem;
  color: #333;
  text-align: justify;
}

.essay-footer {
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: none;
  color: #666 !important;
  cursor: pointer;
  position: relative;
}

.like-btn:hover {
  color: rgba(255, 64, 129, 0.7) !important;
}

.like-btn.liked {
  color: #ff4081 !important;
}

.like-btn i {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧卡片的连接点 */
.essay-card.left .timeline-dot {
  position: absolute;
  right: -46px; /* 40px间距 + 6px点的大小的一半 */
  top: 30px;
  width: 12px;
  height: 12px;
  background: #87CEEB;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
  z-index: 2;
}

/* 右侧卡片的连接点 */
.essay-card.right .timeline-dot {
  position: absolute;
  left: -46px;
  top: 30px;
  width: 12px;
  height: 12px;
  background: #87CEEB;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
  z-index: 2;
}

/* 添加连接线 */
.essay-card.left .timeline-dot::after,
.essay-card.right .timeline-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40px;
  height: 2px;
  background: rgba(135, 206, 235, 0.4);
}

.essay-card.left .timeline-dot::after {
  right: 10px;
}

.essay-card.right .timeline-dot::after {
  left: 10px;
}

/* 暗色主题适配 */
:deep(.dark-theme) .essay-content {
  background: rgba(45, 45, 45, 0.85);
  color: #fff;
  border-color: rgba(135, 206, 235, 0.1);
}

:deep(.dark-theme) .essay-content::before {
  opacity: 0.35;
  filter: brightness(0.8);
  mix-blend-mode: multiply;
}

:deep(.dark-theme) .essay-content:hover::before {
  opacity: 0.35;
  filter: brightness(0.75) contrast(1.1);
}

:deep(.dark-theme) .essay-content:hover {
  border-color: rgba(135, 206, 235, 0.3);
  background: rgba(45, 45, 45, 0.85);
}

.breaking-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: breakHeart 1s ease-out forwards;
  color: #ff4081;
  font-size: 1.5rem;
  pointer-events: none;
}

@keyframes breakHeart {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -100%) scale(0.8) rotate(45deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(0.5) rotate(90deg);
  }
}

.floating-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: floatHeart 1s ease-out forwards;
  color: #ff4081;
  font-size: 1.5rem;
  pointer-events: none;
}

@keyframes floatHeart {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -150%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -200%) scale(1);
  }
}

.like-btn:hover i {
  transform: scale(1.2);
}

.like-btn.liked {
  color: #ff4081;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.loading-dot {
  width: 10px;
  height: 10px;
  background: #87CEEB;
  border-radius: 50%;
  animation: loadingBounce 1s infinite;
}

@keyframes loadingBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Banner 样式 */
.essays-banner {
  position: relative;
  width: 100vw;
  height: 60vh;
  background-image: url('/background/essay/essay-banner.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  transform: translateX(-50%);
  z-index: -1;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.5)
  );
  z-index: 0;
}

.banner-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 20px;
}

.banner-content h1 {
  font-size: 3.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-content p {
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .essays-banner {
    height: 40vh;
  }

  .timeline {
    margin-top: -40px;
  }

  .banner-content h1 {
    font-size: 2.5rem;
  }

  .banner-content p {
    font-size: 1rem;
  }
}
</style> 