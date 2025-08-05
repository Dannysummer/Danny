<template>
  <div class="friends-page">

    <!-- Banner 区域 -->
    <div class="friends-banner">
      <h1 class="banner-title">友情链接</h1>
      <p class="banner-subtitle">来成为我的朋友吧！
        <span class="my-face">ღゝ◡╹)ノ❤️</span>
      </p>
    </div>

    <!-- 友链容器 -->
    <div class="friends-container" :style="transitionStyle">
      <!-- 按钮组 -->
      <div class="friend-actions">
        <button class="add-friend-btn" @click="showLetterhead = true">
          <div class="btn-content">
            <Icon icon="mdi:plus" class="btn-icon" />
            <span>申请友链</span>
          </div>
          <div class="btn-effect"></div>
        </button>
        <button class="rules-btn" @click="currentView = 'rules'">
          <Icon icon="mdi:book-open-variant" class="btn-icon" />
          <span>《Dannyの友人帐公约》</span>
        </button>
      </div>

      <!-- 分类标签 -->
      <div v-if="currentView === 'friends'" class="category-tabs">
        <button 
          v-for="(name, key) in categories" 
          :key="key"
          class="category-tab"
          :class="{ active: currentCategory === key }"
          @click="changeCategory(key as any)"
        >
          {{ name }}
        </button>
      </div>

      <!-- 友链列表/公约内容切换 -->
      <div v-if="currentView === 'friends'">
        <!-- 友链列表 -->
        <template v-if="currentCategory === 'all'">
          <div v-for="(links, category) in groupedFriends" :key="category" class="friend-category">
            <h2 class="category-header">{{ categories[category] }}</h2>
            <div class="friends-grid">
              <div 
                v-for="friend in links" 
                :key="friend.name"
                class="friend-card"
                @click="handleCardClick(friend.url)"
              >
                <div class="friend-cover">
                  <div class="delay-badge" :style="{ backgroundColor: getDelayColor(friend.url) }">
                    <img v-if="getDelayIcon(friend.url).startsWith('/Icon')"
                         :src="getDelayIcon(friend.url)"
                         class="signal-icon"
                         :class="{ 'rotating': !delayMap.get(friend.url) }" />
                    <Icon v-else
                          :icon="getDelayIcon(friend.url)"
                          class="signal-icon"
                          :class="{ 'rotating': !delayMap.get(friend.url) }" />
                    {{ getDelayText(friend.url) }}
                  </div>
                  <img :src="friend.cover" :alt="friend.name + '的封面'" />
                </div>
                <div class="friend-info">
                  <div class="friend-header">
                    <img class="friend-avatar" :src="friend.avatar" :alt="friend.name" />
                    <h3 class="friend-name">{{ friend.name }}</h3>
                  </div>
                  <p class="friend-description">{{ friend.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="friend-category">
          <!-- 添加具体分类的标题和副标题 -->
          <div class="category-title-group">
            <h2 class="category-header">{{ categories[currentCategory] }}</h2>
            <p class="category-subtitle">在这里遇见志同道合的{{ categories[currentCategory] }}们</p>
          </div>
          <div class="friends-grid">
            <div 
              v-for="friend in filteredFriends" 
              :key="friend.name"
              class="friend-card"
              :style="{ animationDelay: friend.delay }"
              @click="handleCardClick(friend.url)"
            >
              <div class="friend-cover">
                <div class="delay-badge" :style="{ backgroundColor: getDelayColor(friend.url) }">
                  <img v-if="getDelayIcon(friend.url).startsWith('/Icon')"
                       :src="getDelayIcon(friend.url)"
                       class="signal-icon"
                       :class="{ 'rotating': !delayMap.get(friend.url) }" />
                  <Icon v-else
                        :icon="getDelayIcon(friend.url)"
                        class="signal-icon"
                        :class="{ 'rotating': !delayMap.get(friend.url) }" />
                  {{ getDelayText(friend.url) }}
                </div>
                <img :src="friend.cover" :alt="friend.name + '的封面'" />
              </div>
              <div class="friend-info">
                <div class="friend-header">
                  <img class="friend-avatar" :src="friend.avatar" :alt="friend.name" />
                  <h3 class="friend-name">{{ friend.name }}</h3>
                </div>
                <p class="friend-description">{{ friend.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 友链公约内容 -->
      <div v-else-if="currentView === 'rules'" class="rules-content">
        <button class="back-btn" @click="currentView = 'friends'">
          <Icon icon="mdi:arrow-left" class="btn-icon" />
          <span>返回友链列表</span>
        </button>
        <h2 class="rules-title">Dannyの友人帐公约</h2>
        <div class="rules-body">
          <!-- 这里放公约内容 -->
        </div>
      </div>
    </div>

    <!-- 修改为中央弹出的表单 -->
    <div class="friend-letterhead" :class="{ 'show': showLetterhead }">
      <div class="letterhead-overlay" @click="showLetterhead = false"></div>
      <div class="letterhead-content">
        <button class="close-btn" @click="showLetterhead = false">
          <Icon icon="mdi:close" />
        </button>
        <HexoLetterhead />
      </div>
    </div>

    <FooterBanner v-if="!$route.meta.hideFooter" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { categoryNames, type FriendLink } from '../data/friends'
import HexoLetterhead from '../components/HexoLetterhead.vue'
import { useThemeStore } from '../stores/theme'  // 导入主题store
import { config } from '../config/index'
import FooterBanner from '@/components/FooterBanner.vue'

const themeStore = useThemeStore()

// 修正类型定义，使用字符串索引类型
type CategoryKey = string
const currentCategory = ref<CategoryKey>('all')

const filteredFriends = ref<FriendLink[]>([])
const categories = ref<Record<string, string>>(categoryNames)
const isLoading = ref(true)
const error = ref<string | null>(null)

// 计算友链总数
// const friendCount = computed(() => filteredFriends.value.length)

// 添加分组逻辑
const groupedFriends = computed(() => {
  const groups: Record<string, FriendLink[]> = {}
  filteredFriends.value.forEach(friend => {
    if (!groups[friend.category]) {
      groups[friend.category] = []
    }
    groups[friend.category].push(friend)
  })
  return groups
})

// 存储延迟数据
const delayMap = ref<Map<string, { delay: number; status: 'loading' | 'success' | 'error' }>>(new Map())

// 测试延迟的函数修改
const testDelay = async (url: string) => {
  // 确保URL格式正确
  let testUrl = url
  if (!url.startsWith('http')) {
    testUrl = `https://${url}`
  }
  
  const startTime = performance.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    await fetch(testUrl, {
      mode: 'no-cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const endTime = performance.now()
    const delay = Math.round(endTime - startTime)
    
    delayMap.value.set(url, {
      delay,
      status: 'success'
    })
  } catch (error) {
    delayMap.value.set(url, {
      delay: -1,
      status: 'error'
    })
  }
}

// 获取延迟显示文本
const getDelayText = (url: string) => {
  const data = delayMap.value.get(url)
  if (!data) return '测试中...'
  if (data.status === 'error') return '超时'
  return `${data.delay}ms`
}

// 获取延迟状态的图标
const getDelayIcon = (url: string) => {
  const data = delayMap.value.get(url)
  if (!data) return 'mdi:sync'
  if (data.status === 'error') return 'mdi:alarm-off'
  if (data.delay < 500) return 'mdi:signal-cellular-3'
  if (data.delay < 1000) return 'mdi:signal-cellular-2'
  if (data.delay < 2000) return 'mdi:signal-cellular-1'
  return 'mdi:signal-cellular-1'
}

// 修改主题状态的获取
const isDark = computed(() => themeStore.isDarkTheme)

// 获取延迟状态的颜色（根据主题调整颜色）
const getDelayColor = (url: string) => {
  const data = delayMap.value.get(url)
  if (isDark.value) {
    if (!data || data.status === 'loading') return 'rgba(20, 20, 20, 0.9)'
    if (data.status === 'error') return 'rgba(244, 67, 54, 0.7)'
    if (data.delay < 500) return 'rgba(76, 175, 80, 0.7)'
    if (data.delay < 1000) return 'rgba(255, 193, 7, 0.7)'
    return 'rgba(255, 87, 34, 0.7)'
  } else {
    if (!data || data.status === 'loading') return 'rgba(16, 91, 121, 0.89)'
    if (data.status === 'error') return 'rgba(244, 67, 54, 0.89)'
    if (data.delay < 500) return 'rgba(76, 175, 80, 0.89)'
    if (data.delay < 1000) return 'rgba(255, 193, 7, 0.89)'
    return 'rgba(255, 87, 34, 0.89)'
  }
}

// 修改主题切换时的过渡效果
const transitionStyle = computed(() => ({
  transition: 'all 0.3s ease'
}))

// 直接从API获取友链数据
const fetchFriendLinks = async () => {
  try {
    const response = await fetch(`${config.api.apiUrl}/friend-links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      const { friends, categoryNames: apiCategoryNames } = data.data;
      console.log('友链数据:', friends);
      console.log('分类名称:', apiCategoryNames);
      
      // 处理category大小写问题
      const processedFriends = friends.map((friend: {category: string, [key: string]: any}) => ({
        ...friend,
        category: friend.category.toLowerCase() as any
      }));
      
      return { friends: processedFriends, categoryNames: apiCategoryNames };
    } else {
      console.error('获取友链失败:', data.message);
      return null;
    }
  } catch (error) {
    console.error('获取友链出错:', error);
    throw error;
  }
};

// 在组件挂载时获取友链数据
onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const result = await fetchFriendLinks();
    if (result) {
      filteredFriends.value = result.friends;
      if (result.categoryNames) {
        categories.value = result.categoryNames;
      }
      
      // 获取数据后开始测试友链延迟
      filteredFriends.value.forEach(friend => {
        testDelay(friend.url);
      });
    }
  } catch (err: any) {
    console.error('加载友链失败:', err);
    error.value = err.message || '加载友链失败';
  } finally {
    isLoading.value = false;
  }
});

// 按分类筛选友链的函数修改
const changeCategory = (category: CategoryKey) => {
  currentCategory.value = category
}

// 监听分类变化
watch(currentCategory, async (newCategory) => {
  if (newCategory === 'all') {
    try {
      const result = await fetchFriendLinks()
      if (result) {
        filteredFriends.value = result.friends
      }
    } catch (err) {
      console.error('重新加载所有友链失败:', err)
    }
    return
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`${config.api.apiUrl}/friend-links/category/${newCategory}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      const categoryFriends = data.data.map((friend: any) => ({
        ...friend,
        category: friend.category.toLowerCase() as any
      }));
      
      filteredFriends.value = categoryFriends;
      
      // 获取数据后测试这些新友链的延迟
      categoryFriends.forEach((friend: FriendLink) => {
        if (!delayMap.value.has(friend.url)) {
          testDelay(friend.url);
        }
      });
    } else {
      console.error('获取分类友链失败:', data.message);
      error.value = data.message || '获取分类友链失败';
    }
  } catch (err: any) {
    console.error('加载分类友链失败:', err);
    error.value = err.message || '加载分类友链失败';
  } finally {
    isLoading.value = false;
  }
});

const showLetterhead = ref(false)
const currentView = ref<'friends' | 'rules'>('friends')

// 修改卡片点击事件
const handleCardClick = (url: string) => {
  // 确保URL包含协议
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  // 在新标签页中打开链接
  window.open(fullUrl, '_blank', 'noopener noreferrer')
}
</script>

<style scoped>
/* shakeFace动画 */
@import '../styles/shakeface.css';

.friends-page {
  min-height: 100vh;
  background: var(--bg-primary);
  background-image: url('/background/friends/gqj-all.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.friends-banner {
  height: 300px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/background/article-card-bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.banner-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.friends-container {
  max-width: 1400px;
  margin: -50px auto 50px;
  padding: 30px;
  position: relative;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  background-color: rgba(var(--bg-primary-rgb), 0.6);  /* 使用RGB变量 */
}

/* 添加遮罩层 */
.friends-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3); 
  z-index: 0;
}

/* 确保内容在遮罩层上方 */
.friends-banner,
.friends-container {
  position: relative;
  z-index: 1;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 0 0 30px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 6px 16px 6px 24px;  /* 增加左边padding为分隔符留空间 */
  border: none;
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;  /* 为伪元素定位 */
}

/* 修改分类标签的分隔符样式 */
.category-tab::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #fff;  /* 默认白色 */
  border-radius: 3px;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);  /* 轻微发光 */
  opacity: 0.8;
}

/* 激活状态下的分隔符样式 */
.category-tab.active::before {
  background: #3498db;  /* 激活时为蓝色 */
  box-shadow: 
    0 0 5px #3498db,
    0 0 10px #3498db,
    0 0 15px #3498db;  /* 强烈发光效果 */
}

/* 黑夜主题下的样式调整 */
:root[class='dark-theme'] .category-tab::before {
  background: #fff;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

:root[class='dark-theme'] .category-tab.active::before {
  background: #87CEEB;
  box-shadow: 
    0 0 5px #87CEEB,
    0 0 10px #87CEEB,
    0 0 15px #87CEEB;
}

/* 修改分类标题样式 */
.category-header {
  color: var(--text-primary);
  font-size: 1.2rem;
  margin: 30px 0 20px;
  padding-left: 24px;  /* 为分隔符留出空间 */
  display: flex;
  align-items: center;
  position: relative;  /* 为伪元素定位 */
  border-left: none;  /* 移除原有的左边框 */
}

/* 添加分类标题的发光分隔符 */
.category-header::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;  /* 稍微比标签的分隔符高一些 */
  background: #3498db;
  border-radius: 3px;
  box-shadow: 
    0 0 5px #3498db,
    0 0 10px #3498db,
    0 0 15px #3498db;
  opacity: 0.8;
}

/* 黑夜主题下的样式调整 */
:root[class='dark-theme'] .category-header::before {
  background: #87CEEB;
  box-shadow: 
    0 0 5px #87CEEB,
    0 0 10px #87CEEB,
    0 0 15px #87CEEB;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.friend-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease both;
  box-shadow: 0 2px 8px var(--shadow-primary);
  display: flex;
  flex-direction: column;
  aspect-ratio: 4/3;
  position: relative;
  cursor: pointer;
}

.friend-cover {
  height: 170px;  /* 略微增加封面高度 */
  position: relative;
  overflow: hidden;
}

.friend-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/9;  /* 确保封面图片比例为16:9 */
  transition: transform 0.3s ease;
}

.friend-info {
  height: 40%;
  padding: 20px 12px 5px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-primary);
  align-items: flex-start;
}

.friend-header {
  position: absolute;
  top: calc(45%);  /* 位于 cover 底部偏上 */
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.friend-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.friend-name {
  background-color: rgba(16, 91, 121, 0.89);
  padding: 0px 10px;
  border-radius: 10%;
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  text-shadow: 0 1px 2px var(--shadow-primary);
  margin-top: 0;
}

.friend-description {
  color: var(--text-primary);
  margin-top: 4px;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  align-self: flex-start;
  height: 50px;
  width: 100%;
  word-break: break-all;
  white-space: normal;
}

.friend-link {
  display: none;
}

.friend-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px var(--shadow-hover);
  border-color: var(--primary-color-light);
}

.friend-card:hover .friend-link {
  opacity: 1;
  transform: translateY(0);
}

.friend-card:hover .friend-cover img {
  transform: scale(1.05);
}

/* 修改动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.friend-category {
  margin-bottom: 40px;
}

/* 响应式布局优化 */
@media (max-width: 1400px) {
  .friends-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .friends-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .friends-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .friends-container {
    padding: 20px;
    margin-top: -30px;
  }
}

@media (max-width: 480px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.delay-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(16, 91, 121, 0.89);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.signal-icon {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 移除之前的自定义图标相关样式 */
:deep(.iconify) {
  width: auto;
  height: auto;
}

/* 按钮组样式 */
.friend-actions {
  display: flex;
  align-items: center;
  justify-content: center;  /* 居中对齐 */
  gap: 50px;               /* 设置间距为50px */
  margin-bottom: 30px;
  width: 100%;            /* 确保容器占满宽度 */
}

/* 申请友链按钮样式 */
.add-friend-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0;              /* 重置margin */
}

/* 规则按钮样式 */
.rules-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  background: transparent;
  color: #0099ff;
  border: 0px solid #3498db;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0;              /* 重置margin */
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.btn-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #3498db, #2980b9);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.add-friend-btn:hover {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.add-friend-btn:hover .btn-effect {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.add-friend-btn:hover .btn-icon {
  transform: rotate(180deg);
}

.rules-btn:hover {
  /* background: #3498db; */
  color: white;
  /* transform: translateY(-2px); */
  /* box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); */
}

/* 暗色主题适配 */
:root[class='dark-theme'] .rules-btn {
  color: #87CEEB;
  border-color: #87CEEB;
}

:root[class='dark-theme'] .rules-btn:hover {
  background: #87CEEB;
  color: #1a1a1a;
}

.friend-letterhead {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1000;
}

.friend-letterhead.show {
  pointer-events: auto;  /* 显示时接受点击事件 */
}

.letterhead-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.friend-letterhead.show .letterhead-overlay {
  opacity: 1;  /* 显示遮罩层 */
}

.letterhead-content {
  position: relative;
  z-index: 1;
  width: 500px;
  max-width: 90%;
  background: rgba(0, 0, 0, 0.0);
  border-radius: 15px;
  transform: scale(0.9) translateY(200px);  /* 添加 translateY */
  opacity: 0;
  transition: all 0.3s ease;
  padding: 20px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
}

.friend-letterhead.show .letterhead-content {
  transform: scale(1) translateY(200px);  /* 保持下移状态 */
  opacity: 1;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #3498db;
  transform: rotate(90deg);
}

/* 暗色主题适配 */
.dark-theme .letterhead-content .friends-container{
  background: var(--bg-primary);
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.3);
}

.dark-theme .friends-container{
  border: solid 2px #87CEEB;
}

/* 优化黑夜主题过渡效果 */
.friends-container,
.friend-card,
.friend-info,
.friend-name,
.friend-description,
.delay-badge,
.category-tab {
  transition: all 0.3s ease;
}

/* 黑夜主题背景适配 */
:root[class='dark-theme'] .friends-page {
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/background/friends/gqj-all.jpg');
}

:root[class='dark-theme'] .friends-banner {
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/background/article-card-bg.jpg');
}

/* 优化黑夜主题下的文字可读性 */
:root[class='dark-theme'] .banner-title,
:root[class='dark-theme'] .banner-subtitle {
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
}

/* 优化黑夜主题下的遮罩层 */
:root[class='dark-theme'] .friends-page::before {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
}

/* 优化黑夜主题下的卡片悬浮效果 */
:root[class='dark-theme'] .friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(135, 206, 235, 0.2);
  border-color: rgba(135, 206, 235, 0.3);
  background: rgba(40, 40, 40, 0.95);
}

/* 优化黑夜主题下的延迟标签 */
:root[class='dark-theme'] .delay-badge {
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 添加主题切换时的过渡动画 */
@keyframes themeTransition {
  from {
    opacity: 0.8;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.friends-container {
  animation: themeTransition 0.3s ease forwards;
}

/* 黑夜主题适配 */
:root[class='dark-theme'] .friends-container {
  background-color: rgba(30, 30, 30, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.category-title-group {
  margin: 20px 0 30px;
  text-align: center;
}

.category-title-group .category-header {
  margin: 0 0 10px;
  padding-left: 0;  /* 覆盖原有的左padding */
  justify-content: center;  /* 居中显示 */
  font-size: 1.8rem;  /* 稍大一些的字号 */
}

.category-title-group .category-header::before {
  left: -20px;  /* 调整分隔符位置 */
}

.category-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
  font-weight: 300;
}

/* 黑夜主题适配 */
:root[class='dark-theme'] .category-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

/* 添加进入动画 */
.category-title-group {
  animation: fadeInDown 0.6s ease both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 修改添加友链按钮的流光效果 */
.add-friend-btn {
  position: relative;
  /* ... 其他样式保持不变 ... */
}

/* 修改流光效果 */
.add-friend-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;  /* 控制反光条的宽度 */
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);  /* 让反光条倾斜 */
  animation: shine 3s ease-in-out infinite;
  z-index: 1;
}

/* 修改动画效果 */
@keyframes shine {
  0% {
    left: -100px;
    opacity: 0;
  }
  20% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    left: calc(100% + 100px);
    opacity: 0;
  }
}

/* 黑夜主题下的流光效果 */
:root[class='dark-theme'] .add-friend-btn::before {
  background: linear-gradient(
    to right,
    transparent,
    rgba(135, 206, 235, 0.2),
    transparent
  );
}

/* 移除之前的hover效果 */
.add-friend-btn:hover::before {
  opacity: 1;  /* 移除这个样式 */
}

.rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rules-modal.show {
  opacity: 1;
  pointer-events: auto;
}

.rules-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.rules-content {
  position: relative;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--bg-primary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.rules-modal.show .rules-content {
  transform: translateY(0);
}

.rules-content .close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  transition: all 0.3s ease;
}

.rules-content .close-btn:hover {
  color: #3498db;
  transform: rotate(90deg);
}

/* 暗色主题适配 */
.dark-theme .rules-content .friends-container{
  background: var(--bg-primary);
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.3);
}

.dark-theme .friends-container{
  border: solid 2px #87CEEB;
}

/* 优化黑夜主题过渡效果 */
.rules-content,
.rules-content .friends-container,
.rules-content .friend-card,
.rules-content .friend-info,
.rules-content .friend-name,
.rules-content .friend-description,
.rules-content .delay-badge,
.rules-content .category-tab {
  transition: all 0.3s ease;
}

/* 黑夜主题背景适配 */
:root[class='dark-theme'] .rules-content {
  background-color: rgba(30, 30, 30, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.rules-content .category-title-group {
  margin: 20px 0 30px;
  text-align: center;
}

.rules-content .category-title-group .category-header {
  margin: 0 0 10px;
  padding-left: 0;  /* 覆盖原有的左padding */
  justify-content: center;  /* 居中显示 */
  font-size: 1.8rem;  /* 稍大一些的字号 */
}

.rules-content .category-title-group .category-header::before {
  left: -20px;  /* 调整分隔符位置 */
}

.rules-content .category-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
  font-weight: 300;
}

/* 黑夜主题适配 */
:root[class='dark-theme'] .rules-content .category-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

/* 添加进入动画 */
.rules-content .category-title-group {
  animation: fadeInDown 0.6s ease both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 修改添加友链按钮的流光效果 */
.rules-content .add-friend-btn {
  position: relative;
  /* ... 其他样式保持不变 ... */
}

/* 修改流光效果 */
.rules-content .add-friend-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;  /* 控制反光条的宽度 */
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);  /* 让反光条倾斜 */
  animation: shine 3s ease-in-out infinite;
  z-index: 1;
}

/* 修改动画效果 */
@keyframes shine {
  0% {
    left: -100px;
    opacity: 0;
  }
  20% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    left: calc(100% + 100px);
    opacity: 0;
  }
}

/* 黑夜主题下的流光效果 */
:root[class='dark-theme'] .rules-content .add-friend-btn::before {
  background: linear-gradient(
    to right,
    transparent,
    rgba(135, 206, 235, 0.2),
    transparent
  );
}

/* 移除之前的hover效果 */
.rules-content .add-friend-btn:hover::before {
  opacity: 1;  /* 移除这个样式 */
}

/* 返回按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #3498db;
  transform: translateX(-5px);
}

/* 公约内容样式 */
.rules-content {
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.rules-title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.rules-body {
  color: var(--text-primary);
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .back-btn {
  color: rgba(255, 255, 255, 0.7);
}

:root[class='dark-theme'] .back-btn:hover {
  color: #87CEEB;
}

</style> 