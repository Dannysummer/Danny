<template>
  <div class="admin-layout" :style="backgroundStyle">
    <!-- 毛玻璃效果包裹容器 -->
    <div class="glass-container">
      <!-- 左侧导航栏 -->
      <div class="sidebar">
        <div class="logo-container">
          <div class="avatar">
            <img :src="userInfo.avatar || 'https://picbedcdn.dannysummer.asia/public/avatars/avatar1.jpg'" alt="头像" />
          </div>
          <div class="motto">
            "春风不语,<br>即睹本心"
          </div>
        </div>
        
        <!-- 搜索功能替代系统状态监测 -->
        <div class="search-container">
          <div class="nav-item search-item" @click="toggleSearch">
            <Icon icon="mdi:magnify" class="nav-icon" />
          </div>
        </div>
        
        <!-- 搜索弹出框 -->
        <div class="search-popup" :class="{ 'active': isSearchActive }">
          <div class="search-popup-content">
            <div class="search-header">
              <input 
                ref="searchInput"
                type="text" 
                class="search-input" 
                placeholder="搜索..." 
                v-model="searchQuery"
                @keyup.enter="handleSearch"
              />
              <button class="close-search" @click="toggleSearch">
                <Icon icon="mdi:close" />
              </button>
            </div>
          </div>
        </div>

        <nav class="nav-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': currentPath === item.path }"
          >
            <Icon :icon="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.title }}</span>
            <span v-if="item.badge && item.badge.value > 0" class="badge">{{ item.badge.value }}</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-footer-item">
            <div class="theme-shift-btn" :class="{ 'active': isDarkTheme }" @click="toggleTheme"></div>
            <button class="settings-btn" @click="goToSettings">
              <Icon icon="mdi:cog" />
            </button>
            <button class="logout-btn" @click="handleLogout">
              <Icon icon="mdi:logout" />
           </button>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user'
import { config } from '../../config/index'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 搜索功能
const searchQuery = ref('')
const isSearchActive = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    // 等待DOM更新后聚焦输入框
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  // 这里可以实现搜索逻辑，例如导航到搜索结果页面
  router.push({
    path: '/admin/search',
    query: { q: searchQuery.value }
  })
  
  // 清空搜索框并关闭搜索弹窗
  searchQuery.value = ''
  isSearchActive.value = false
}

// 主题切换状态
const isDarkTheme = ref(false)

// 背景图片设置
const backgroundStyle = ref({})

// 从localStorage加载背景图片设置
const loadBackgroundSettings = () => {
  try {
    const savedSettings = localStorage.getItem('adminSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      const backgroundUrl = settings.customBackground || settings.selectedBackground
      if (backgroundUrl) {
        backgroundStyle.value = {
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }
        
        // 确保遮罩层存在并设置亮度
        nextTick(() => {
          const adminLayout = document.querySelector('.admin-layout')
          if (adminLayout) {
            let maskLayer = document.querySelector('.admin-bg-mask')
            if (!maskLayer) {
              maskLayer = document.createElement('div')
              maskLayer.className = 'admin-bg-mask'
              adminLayout.prepend(maskLayer)
            }
            
            // 使用类型断言解决style不存在的问题
            (maskLayer as HTMLElement).style.opacity = (1 - (settings.backgroundMaskBrightness || 0.8)).toString();
            
            // 应用模糊效果
            const glassContainer = document.querySelector('.glass-container')
            if (glassContainer) {
              (glassContainer as HTMLElement).style.backdropFilter = `blur(${settings.blurEffect || 10}px)`;
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('加载背景设置失败:', error)
  }
}

// 监听背景设置变更
const listenToBackgroundChanges = () => {
  document.addEventListener('admin-background-change', (event => {
    // 使用类型断言解决detail不存在的问题
    const customEvent = event as CustomEvent;
    const { backgroundUrl, maskBrightness, blurEffect } = customEvent.detail;
    
    if (backgroundUrl) {
      backgroundStyle.value = {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
      
      // 确保遮罩层存在并设置亮度
      nextTick(() => {
        const adminLayout = document.querySelector('.admin-layout')
        if (adminLayout) {
          let maskLayer = document.querySelector('.admin-bg-mask')
          if (!maskLayer) {
            maskLayer = document.createElement('div')
            maskLayer.className = 'admin-bg-mask'
            adminLayout.prepend(maskLayer)
          }
          
          // 使用类型断言解决style不存在的问题
          (maskLayer as HTMLElement).style.opacity = (1 - (maskBrightness || 0.8)).toString();
          
          // 应用模糊效果
          const glassContainer = document.querySelector('.glass-container')
          if (glassContainer) {
            (glassContainer as HTMLElement).style.backdropFilter = `blur(${blurEffect || 10}px)`;
          }
        }
      })
    }
  }));
}

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  
  // 应用主题到根元素
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
  }
  
  // 保存主题偏好到localStorage
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  
  // 更新管理设置中的主题状态
  try {
    const savedSettings = localStorage.getItem('adminSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      settings.darkMode = isDarkTheme.value
      localStorage.setItem('adminSettings', JSON.stringify(settings))
    }
  } catch (error) {
    console.error('更新主题设置失败:', error)
  }
}

// 用户信息
const userInfo = computed(() => userStore.userInfo || {
  username: 'Admin',
  avatar: '/default-avatar.png',
  role: 'admin'
})

// 未审核友链计数
const pendingFriendLinksCount = ref(0)

// 菜单配置
const menuItems = [
  { title: '首页', path: '/admin/dashboard', icon: 'mdi:home' },
  { title: '笔记', path: '/admin/articles', icon: 'mdi:pencil' },
  { title: '消息', path: '/admin/messages', icon: 'mdi:message' },
  { title: '图库', path: '/admin/gallery', icon: 'mdi:image' },
  { title: '统计', path: '/admin/statistics', icon: 'mdi:chart-line' },
  { title: '用户', path: '/admin/users', icon: 'mdi:account-group' },
  { 
    title: '社交', 
    path: '/admin/social', 
    icon: 'mdi:account-circle-outline',
    badge: pendingFriendLinksCount
  }
]

// 计算当前路径
const currentPath = computed(() => route.path)

// 跳转到设置页面
const goToSettings = () => {
  router.push('/admin/settings')
}

// 退出登录
const handleLogout = () => {
  // 清除cookie中的token
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  
  // 清除store中的用户信息
  userStore.logout()
  
  // 跳转到登录页
  router.push('/login')
}

// 获取未审核友链数量
const fetchPendingFriendLinksCount = async () => {
  try {
    const response = await fetch(`${config.api.apiUrl}/friend-links/pending`, {
      credentials: 'include'
    })
    const data = await response.json()
    
    if (data.success) {
      pendingFriendLinksCount.value = data.data ? data.data.length : 0
    }
  } catch (error) {
    console.error('获取未审核友链数量失败:', error)
  }
}

// 处理localStorage变化的函数
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'adminSettings') {
    // 当adminSettings发生变化时，重新加载背景设置
    loadBackgroundSettings()
  } else if (event.key === '_temp_bg_trigger') {
    // 当收到临时触发器时，也重新加载背景设置
    loadBackgroundSettings()
  }
}

// 添加直接检查和更新背景的方法，可从其他组件调用
const checkAndUpdateBackground = () => {
  loadBackgroundSettings()
}

// 设置定期检查的计时器，确保背景设置同步
onMounted(() => {
  // 从localStorage获取主题偏好
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkTheme.value = true
    document.documentElement.classList.add('dark-theme')
  }
  
  // 加载背景设置
  loadBackgroundSettings()
  
  // 监听背景设置变更
  listenToBackgroundChanges()
  
  // 获取未审核友链数量
  fetchPendingFriendLinksCount()
  
  // 每30秒更新一次未审核友链数量
  const intervalId = setInterval(fetchPendingFriendLinksCount, 600000)
  
  // 添加本地存储变化监听器
  window.addEventListener('storage', handleStorageChange)
  
  // 添加一个短间隔定时器，检查背景设置是否需要更新
  const bgCheckIntervalId = setInterval(() => {
    // 每5秒检查一次背景设置是否更新
    try {
      const savedSettings = localStorage.getItem('adminSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        const newBackgroundUrl = settings.customBackground || settings.selectedBackground
        
        // 如果当前背景与存储的背景不一致，则更新背景
        if (newBackgroundUrl && 
            (!(backgroundStyle.value as any).backgroundImage || 
             !(backgroundStyle.value as any).backgroundImage.includes(newBackgroundUrl))) {
          loadBackgroundSettings()
        }
      }
    } catch (error) {
      console.error('检查背景设置失败:', error)
    }
  }, 5000)
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(intervalId)
    // 移除事件监听器
    document.removeEventListener('admin-background-change', listenToBackgroundChanges)
    // 移除本地存储变化监听器
    window.removeEventListener('storage', handleStorageChange)
    clearInterval(bgCheckIntervalId)
  })
})
</script>

<style scoped>
/* 主题色变量 */
:root {
  --bg-primary: #eef2f8;
  --bg-secondary: rgba(255, 255, 255, 0.7);
  --bg-tertiary: rgba(255, 255, 255, 0.4);
  --bg-content: rgba(255, 255, 255, 0.5);
  --text-primary: #333;
  --text-secondary: #64748b;
  --text-accent: #4f86f7;
  --border-color: rgba(234, 237, 242, 0.5);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --item-hover-bg: rgba(79, 134, 247, 0.1);
  --item-active-bg: rgba(79, 134, 247, 0.15);
  --button-bg: rgba(230, 230, 230, 0.5);
  --input-bg: rgba(255, 255, 255, 0.9);
  --scrollbar-track: rgba(240, 240, 240, 0.3);
  --scrollbar-thumb: rgba(180, 180, 180, 0.5);
  --scrollbar-thumb-hover: rgba(150, 150, 150, 0.7);
}

/* 暗色主题变量 */
:root.dark-theme {
  --bg-primary: #1a1d2d;
  --bg-secondary: rgba(35, 39, 59, 0.8);
  --bg-tertiary: rgba(35, 39, 59, 0.6);
  --bg-content: rgba(40, 44, 65, 0.7);
  --text-primary: #e1e7ef;
  --text-secondary: #a0aec0;
  --text-accent: #5d92ff;
  --border-color: rgba(66, 73, 95, 0.8);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --item-hover-bg: rgba(93, 146, 255, 0.2);
  --item-active-bg: rgba(93, 146, 255, 0.25);
  --button-bg: rgba(55, 60, 81, 0.5);
  --input-bg: rgba(45, 49, 70, 0.9);
  --scrollbar-track: rgba(55, 60, 81, 0.3);
  --scrollbar-thumb: rgba(70, 75, 95, 0.5);
  --scrollbar-thumb-hover: rgba(85, 90, 110, 0.7);
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 20px;
  /* 添加背景图片过渡效果 */
  transition: background-image 0.5s ease, background-color 0.3s ease;
}

/* 毛玻璃效果容器 */
.glass-container {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 40px);
  background: var(--bg-tertiary);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-color);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

/* 左侧导航栏样式 */
.sidebar {
  width: 80px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;
  flex: 0 0 auto;
}

.sidebar:hover {
  width: 180px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.motto {
  font-size: 24px;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.4;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.sidebar:hover .motto {
  opacity: 1;
}

/* 导航菜单样式 */
.nav-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  width: 100%;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  position: relative;
}

/* 添加hover背景动画的伪元素 */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background-color: rgba(0, 93, 129, 0.9);
  z-index: -1;
  transition: width 0.3s ease;
  border-radius: 0 20px 20px 0;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-item:hover::before {
  width: 100%;
}

.nav-item.active {
  color: rgba(255, 255, 255, 0.9);
  transition: width 0.3s ease;
  background-color: rgba(0, 151, 211, 0.9);
}

/* 活动项目的左侧指示条 */
.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: rgba(1, 95, 133, 0.9);
}

.nav-item.active::before {
  display: none;
}

.nav-icon {
  font-size: 30px;
  margin: 0 auto;
  transition: margin 0.6s ease;
}

.sidebar:hover .nav-icon {
  margin: 0 10px 0 20px;
}

.nav-text {
  font-size: 24px;
  font-weight: 500;
  opacity: 0;
  width: 0;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.sidebar:hover .nav-text {
  opacity: 1;
  width: auto;
}

/* 侧边栏底部 */
.sidebar-footer {
  margin-top: auto;
  display: flex;
  gap: 20px;
  padding: 15px 0;
}

.sidebar:hover .sidebar-footer {
  justify-content: center;
  width: 100%;
}

.settings-btn,
.logout-btn {
  margin-top: 10px;
  width: 56px;
  height: 56px;
  font-size: 40px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover,
.logout-btn:hover {
  background-color: var(--item-hover-bg);
  color: rgba(0, 151, 211, 0.9);
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-content);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px;
  max-height: calc(100vh - 80px);
  color: var(--text-primary);
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 主题切换按钮样式 */
.theme-shift-btn {
  position: relative;
  margin: 5px 0;
  overflow: hidden;
  width: 60px;
  height: 30px;
  border-radius: 30px;
  box-shadow: 0 -2px 2px 1px #999, 0 2px 2px 1px #edf3fa;
  background-image: linear-gradient(
    to bottom,
    #1c1f2c 33.3333%,
    #357aac 66.6666%
  );
  background-size: 60px 90px;
  cursor: pointer;
  transition: background-position 0.5s;
}

.theme-shift-btn::before {
  content: "";
  position: absolute;
  inset: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  z-index: 2;
  transition: margin-left 0.5s, filter 0.3s, scale 0.3s, box-shadow 0.5s;
}

.theme-shift-btn::after {
  content: "";
  position: absolute;
  width: 60px;
  height: 60px;
  bottom: 30px;
  border-radius: 50%;
  box-shadow: -20px 70px 0 -25px #f4fafe, -15px 65px 0 -30px #f4fafe,
    -4px 65px 0 -25px #f4fafe, 10px 68px 0 -25px #f4fafe,
    18px 68px 0 -22px #f4fafe, 32px 65px 0 -15px #f4fafe,
    32px 50px 0 -25px #f4fafe, -20px 65px 0 -25px #adcce5,
    -15px 62px 0 -28px #adcce5, -2px 60px 0 -25px #adcce5,
    7px 62px 0 -25px #adcce5, 15px 58px 0 -22px #adcce5,
    20px 55px 0 -25px #adcce5, 30px 46px 0 -25px #adcce5;
  background: 
    radial-gradient(circle at top left, transparent 12px, #fff 12.5px) 14px 23px/12px 12px,
    radial-gradient(circle at top right, transparent 6px, #fff 6.5px) 8px 28px/6px 6px,
    radial-gradient(circle at bottom left, transparent 6px, #fff 6.5px) 15px 32px/6px 6px,
    radial-gradient(circle at bottom right, transparent 4px, #fff 4.5px) 10px 41px/4px 4px;
  background-repeat: no-repeat;
  z-index: 1;
  transition: transform 0.5s;
}

/* 亮色主题样式 */
.theme-shift-btn {
  background-position: 0 -60px;
}

.theme-shift-btn::before {
  margin-left: 0;
  box-shadow: inset 1px 1px 1px 1px #e2e2b2, inset -1px -1px 1px 1px #d4a728,
    inset 24px 0 0 0 #f2c52a, 1px 1px 2px 1px #a29d9e,
    0 0 0 18px rgba(255, 255, 255, 0.1),
    8px 0 0 20px rgba(255, 255, 255, 0.1),
    16px 0 0 20px rgba(255, 255, 255, 0.1);
}

.theme-shift-btn::after {
  transform: translateY(0);
}

/* 暗色主题样式 */
.theme-shift-btn.active {
  background-position: 0 0;
}

.theme-shift-btn.active::before {
  margin-left: 33px;
  box-shadow: inset 1px 1px 1px 1px #fff, inset -1px -1px 1px 1px #969ca6,
    1px 1px 2px 1px #323542, 0 0 0 18px rgba(255, 255, 255, 0.1),
    -8px 0 0 20px rgba(255, 255, 255, 0.1),
    -16px 0 0 20px rgba(255, 255, 255, 0.1);
  background: radial-gradient(
      circle at 32% 56%,
      #9c9fae,
      4px,
      transparent 4.5px,
      transparent
    ),
    radial-gradient(
      circle at 50% 26%,
      #9c9fae,
      2px,
      transparent 2.5px,
      transparent
    ),
    radial-gradient(
      circle at 70% 68%,
      #9c9fae,
      3px,
      transparent 3.5px,
      transparent
    ),
    radial-gradient(circle at center, #c1cbd8, #c1cbd8);
}

.theme-shift-btn.active::after {
  transform: translateY(55px);
}

/* 悬停效果 */
.theme-shift-btn:hover::before {
  filter: contrast(90%) brightness(110%);
  scale: 1.05;
}

/* 搜索框样式 */
.search-container {
  width: 100%;
  transition: all 0.3s ease;
}

.search-item {
  justify-content: center;
  cursor: pointer;
}

/* 搜索弹出框样式 */
.search-popup {
  position: fixed;
  top: 15%;
  left: 200px;
  height: 40vh;
  width: 0;
  background: rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  border-radius: 20px;
  z-index: 1000;
}

.search-popup.active {
  width: 300px;
}

.search-popup-content {
  padding: 20px;
  width: 300px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 2px solid var(--text-accent);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(79, 134, 247, 0.2);
}

.close-search {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(79, 134, 247, 0.1);
  color: #4f86f7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-search:hover {
  background: rgba(79, 134, 247, 0.2);
}

.close-search .iconify {
  font-size: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-layout {
    padding: 10px;
  }
  
  .glass-container {
    min-height: calc(100vh - 20px);
    border-radius: 15px;
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 10px;
    justify-content: space-between;
    border-right: none;
    border-bottom: 1px solid rgba(234, 237, 242, 0.5);
  }
  
  .sidebar:hover {
    width: 100%;
  }
  
  .logo-container {
    flex-direction: row;
    margin-bottom: 0;
    align-items: center;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 0;
    margin-right: 10px;
  }
  
  .motto {
    opacity: 1;
    margin-top: 0;
  }
  
  .search-container {
    width: auto;
    margin: 0 15px;
  }
  
  .search-input-wrap {
    width: 150px;
    margin-left: 10px;
  }
  
  .nav-menu {
    flex-direction: row;
    margin-top: 0;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-item {
    width: auto;
    padding: 8px 15px;
    border-radius: 20px;
  }
  
  .nav-icon {
    margin: 0 5px 0 0;
  }
  
  .nav-text {
    opacity: 1;
    width: auto;
  }
  
  .sidebar-footer {
    margin-top: 0;
  }
  
  .main-content {
    padding: 15px;
    margin: 10px;
  }
  
  .theme-shift-btn {
    width: 50px;
    height: 24px;
  }
  
  .theme-shift-btn::before {
    width: 18px;
    height: 18px;
  }
  
  .theme-shift-btn.active::before {
    margin-left: 28px;
  }

  .search-popup {
    left: 0;
    top: 60px;
    width: 100%;
    height: 0;
  }
  
  .search-popup.active {
    width: 100%;
    height: 80px;
  }
  
  .search-popup-content {
    width: 100%;
    padding: 15px;
  }
}

/* 徽章样式 */
.badge {
  position: absolute;
  top: 10px;
  right: 15px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style> 