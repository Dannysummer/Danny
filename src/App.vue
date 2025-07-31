<template>
  <div class="app">
    <!-- 增加后台路由检测逻辑 -->
    <template v-if="isAdminRoute">
      <!-- 后台路由，只渲染路由视图 -->
      <router-view />
    </template>
    <template v-else>
      <!-- 前台路由，渲染完整UI -->
      <LoadingPage v-if="!$route.meta.hideLoading" />
      <!-- <ParticlesBackground /> -->
      <!-- 顶部导航栏 -->
      <nav class="nav" :class="{ 'nav-scrolled': isScrolled }" @mouseenter="handleNavMouseEnter" @mouseleave="handleNavMouseLeave">
        <div class="nav-content">
          <div class="logo">
            <Logo />
          </div>
          
          <!-- 添加汉堡菜单按钮 -->
          <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="菜单">
            <Icon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" />
          </button>

          <!-- 修改导航链接容器 -->
          <div class="nav-links" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
            <div class="nav-content-wrapper">
              <transition name="fade-up">
                <div v-if="!isScrolled" class="nav-items-container">
                  <template v-for="(link, index) in navLinks" :key="index">
                    <!-- 普通链接 -->
                    <router-link 
                      v-if="!link.children"
                      :to="link.path" 
                      class="nav-link"
                      @click="handleLinkClick($event.currentTarget)"
                    >
                      <Icon :icon="link.icon" class="nav-icon" />
                      {{ link.text }}
                    </router-link>
                    
                    <!-- 带下拉菜单的链接 -->
                    <div 
                      v-else 
                      class="nav-dropdown"
                    >
                      <div class="nav-link dropdown-trigger">
                        <Icon :icon="link.icon" class="nav-icon" />
                        {{ link.text }}
                        <Icon icon="material-symbols:keyboard-arrow-down" class="dropdown-icon" />
                      </div>
                      <div class="dropdown-menu">
                        <router-link 
                          v-for="child in link.children"
                          :key="child.path"
                          :to="child.path"
                          class="dropdown-item"
                          @click="handleLinkClick($event.currentTarget)"
                        >
                          <Icon :icon="child.icon" class="nav-icon" />
                          {{ child.text }}
                        </router-link>
                      </div>
                    </div>
                  </template>
                </div>
              </transition>
              
              <transition name="fade-down">
                <div v-if="isScrolled" class="blog-title" @click="scrollToTop">
                  Danny's Blog
                  <span class="tooltip">点击变回导航栏</span>
                </div>
              </transition>
            </div>
          </div>
          
          <!-- 右侧功能图标 -->
          <div class="nav-actions">
            <button class="action-btn" aria-label="开往随机友链" alt="开往随机友链" title="开往随机友链" @click="goToRandomFriendLink">
              <FontAwesomeIcon :icon="faBus" />
            </button>
            <button class="action-btn" aria-label="友链接力" alt="友链接力·十年之约" title="友链接力·十年之约" @click="goToFriendChain">
              <FontAwesomeIcon :icon="faLink" />
            </button>
            <button class="action-btn" aria-label="站内随机文章" alt="站内随机文章" title="站内随机文章" @click="goToRandomArticle">
              <FontAwesomeIcon :icon="faShuffle" />
            </button>
            <button class="action-btn" aria-label="搜索" alt="搜索站内文章" title="搜索站内文章">
              <FontAwesomeIcon :icon="faMagnifyingGlass " />
            </button>
          </div>
        </div>
      </nav>
      
      <!-- 悬浮播放器 -->
      <div class="floating-player" v-show="musicStore.currentSong">
        <!-- 将整个播放器区域作为鼠标事件的触发区域 -->
        <div class="player-container" 
             @mouseenter="showMusicInfo = true" 
             @mouseleave="showMusicInfo = false">
          <!-- 简洁控制器 -->
          <div class="quick-controls" v-show="showMusicInfo">
            <div class="song-info">
              <div class="song-title">{{ musicStore.currentSong.title }}</div>
              <div class="mini-progress">
                <div class="mini-progress-bar" @click="handleProgressClick">
                  <div class="mini-progress-current" :style="{ width: `${progress}%` }"></div>
                </div>
              </div>
            </div>
            <div class="controls-divider"></div>
            <div class="control-buttons">
              <button class="quick-btn" @click.stop="musicStore.prevSong">
                <Icon icon="mdi:skip-previous" />
              </button>
              <button class="quick-btn play" @click.stop="musicStore.togglePlay">
                <Icon :icon="musicStore.isPlaying ? 'mdi:pause' : 'mdi:play'" />
              </button>
              <button class="quick-btn" @click.stop="musicStore.nextSong">
                <Icon icon="mdi:skip-next" />
              </button>
            </div>
          </div>
          
          <!-- 音符动画只在播放时显示 -->
          <div class="music-notes" v-show="musicStore.isPlaying">
            <span class="note">♪</span>
            <span class="note">♫</span>
            <span class="note">♪</span>
          </div>
          <div class="floating-cover">
            <img :src="coverImage" :alt="musicStore.currentSong.title" />
            <!-- 歌曲信息提示 -->
            <div class="quick-info" v-show="!showMusicInfo">
              {{ musicStore.currentSong.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- 主题切换按钮 -->
      <div class="theme-toggle" :class="{ 'move-up': musicStore.currentSong }" @click="handleThemeToggle">
        <Icon :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" 
              class="theme-icon" />
      </div>
      
      <!-- 主路由视图 -->
      <router-view />
      
      <!-- 添加页脚 Banner -->
      <FooterBanner v-if="!$route.meta.hideFooter" />
      <!-- <UserAvatar v-if="!$route.meta.hideAvatar" /> -->
      <FloatingLogin v-if="!$route.meta.hideLogin" />
      
      <!-- 评论框 -->
      <!-- 注释掉不存在的组件引用 -->
      <!-- <CommentPanel 
        v-if="commentStore.isCommentPanelOpen" 
        :post-id="commentStore.currentPostId" 
        @close="commentStore.closeCommentPanel" 
      /> -->
      
      <!-- 弹窗 -->
      <!-- <Toast ref="toast" /> -->
      
      <!-- 滚动指示器 -->
      <div class="scroll-indicator" :style="{ width: scrollPercentage + '%' }"></div>

      <!-- 在App组件的模板底部添加MessageNotification组件 -->
      <MessageNotification />
      
      <!-- 全局右键菜单 -->
      <ContextMenu />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useThemeStore } from './stores/theme'
import { useMusicStore } from './stores/music'
import { useUserStore } from './stores/user'
import { useDark, useToggle } from '@vueuse/core'
// import ParticlesBackground from './components/ParticlesBackground.vue'
import FooterBanner from './components/FooterBanner.vue'
import Logo from './components/Logo.vue'
import LoadingPage from './components/LoadingPage.vue'
// import UserAvatar from './components/UserAvatar.vue'
import { useRoute, useRouter } from 'vue-router'
import FloatingLogin from './components/FloatingLogin.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHouse, faBus, faLink, faShuffle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
// 注释掉不存在的组件导入
// import CommentPanel from './components/CommentPanel.vue'
// import Toast from './components/Toast.vue'
// import Footer from './components/Footer.vue'
import MessageNotification from '@/components/MessageNotification.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import { useContextMenuStore } from '@/stores/contextMenu'
import { config } from './config/index'

const themeStore = useThemeStore()
const musicStore = useMusicStore()
const userStore = useUserStore()
const contextMenuStore = useContextMenuStore()

// 添加Font Awesome库初始化
library.add(faHouse, faBus, faLink, faShuffle, faMagnifyingGlass)

const commentStore = ref({
  isCommentPanelOpen: false,
  currentPostId: 0,
  closeCommentPanel: () => {
    commentStore.value.isCommentPanelOpen = false
  }
})
const scrollPercentage = ref(0)
const route = useRoute()
const router = useRouter()

const isScrolled = ref(false)
const isNavHidden = ref(false)
const isMouseNearTop = ref(false)
const isMouseOverNav = ref(false)
let lastScrollTop = 0

const handleScroll = () => {
  const currentScrollTop = window.scrollY
  
  // 设置滚动状态（但不隐藏导航栏）
  isScrolled.value = currentScrollTop > 100;
  
  // 只在鼠标不在导航区域时处理滚动隐藏
  // if (!isMouseNearTop.value && !isMouseOverNav.value && currentScrollTop > 50) {
  //   isNavHidden.value = currentScrollTop > lastScrollTop
  // }
  
  // 计算滚动百分比
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  if (scrollHeight > 0) {
    scrollPercentage.value = (currentScrollTop / scrollHeight) * 100
  }
  
  lastScrollTop = currentScrollTop
}

const handleMouseMove = (e: MouseEvent) => {
  const wasNearTop = isMouseNearTop.value
  isMouseNearTop.value = e.clientY <= 100
  
  // 状态改变时更新导航栏显示状态
  if (isMouseNearTop.value !== wasNearTop) {
    isNavHidden.value = !isMouseNearTop.value && window.scrollY > lastScrollTop
  }
}

const handleNavMouseEnter = () => {
  isMouseOverNav.value = true
  isNavHidden.value = false
}

const handleNavMouseLeave = () => {
  isMouseOverNav.value = false
  // 离开时立即根据当前滚动状态判断是否隐藏
  if (!isMouseNearTop.value && window.scrollY > 50) {
    isNavHidden.value = window.scrollY > lastScrollTop
  }
}

// 修改导航链接配置
const navLinks = computed(() => [
  { 
    text: '导航', 
    icon: 'material-symbols:explore',
    children: [
      { path: '/', text: '博客首页', icon: 'material-symbols:home' },
      { path: '/navigation', text: '站点导航', icon: 'material-symbols:map' },
      { path: '/start', text: '起始页', icon: 'material-symbols:link' }
    ]
  },
  { 
    text: '朝花夕拾', 
    icon: 'material-symbols:auto-stories',
    children: [
      { path: '/articles', text: '文章', icon: 'mdi:file-document' },
      { path: '/essays', text: '随笔', icon: 'mdi:pencil' },
      { path: '/gallery', text: '相册', icon: 'mdi:image-multiple' },
      { path: '/reading', text: '阅读', icon: 'mdi:book-open-page-variant' },
      { path: '/designs', text: '设计作品', icon: 'mdi:palette' }
    ]
  },
  { 
    text: '关于', 
    icon: 'material-symbols:info',
    children: [
      { path: '/about', text: '知我', icon: 'material-symbols:person' },
      { path: '/share', text: '分享', icon: 'material-symbols:share' }
    ]
  },
  { path: '/message', text: '树洞', icon: 'material-symbols:chat-bubble' },
  { path: '/friends', text: '友人帐', icon: 'material-symbols:group' }
])

// 修改下拉菜单状态管理
// const showDropdown = ref<number | null>(null)

// 添加点击处理函数
// const handleDropdownClick = (index: number, event: Event) => {
//   event.preventDefault()
//   event.stopPropagation()
//   showDropdown.value = showDropdown.value === index ? null : index
// }

// 添加点击外部关闭下拉菜单
// const closeDropdowns = (event: MouseEvent) => {
//   const target = event.target as HTMLElement
//   if (!target.closest('.nav-dropdown')) {
//     showDropdown.value = null
//   }
// }

// 添加下划线位置状态
const navLineStyle = ref({
  width: '0px',
  transform: 'translateX(0px)'
})

// 添加滑块位置状态
const sliderStyle = ref({
  width: '0px',
  transform: 'translateX(0px)'
})

// 处理链接悬停
const handleLinkClick = (element: HTMLElement) => {
  // 更新下划线位置
  navLineStyle.value = {
    width: `${element.offsetWidth}px`,
    transform: `translateX(${element.offsetLeft}px)`
  }
  
  // 更新滑块位置
  sliderStyle.value = {
    width: `${element.offsetWidth}px`,
    transform: `translateX(${element.offsetLeft}px)`
  }
  if (window.innerWidth <= 768) {
    isMobileMenuOpen.value = false
  }
}

// 添加播放状态控制
const showMusicInfo = ref(false)

// 添加计算属性
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark-theme',
  valueLight: ''
})

const coverImage = computed(() => {
  if (isDark.value) {
    return '/music/cover/phonograph.png'
  }
  return musicStore.currentSong.cover || '/music/cover/music.png'
})

// 添加进度条点击处理方法
const handleProgressClick = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  musicStore.setProgress(percent * 100)
}

// 计算进度百分比
const progress = computed(() => {
  if (!musicStore.duration) return 0
  return (musicStore.currentTime / musicStore.duration) * 100
})

// 添加移动菜单状态
const isMobileMenuOpen = ref(false)

// 添加切换菜单方法
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 全局主题控制
const toggleDark = useToggle(isDark)

// 修改主题切换方法
const handleThemeToggle = () => {
  toggleDark()
  
  // 触发主题变化事件，确保所有组件能够响应主题变化
  document.dispatchEvent(new CustomEvent('themeChange', { 
    detail: { isDark: isDark.value }
  }))
}

// 修改点击特效处理函数
const createClickEffect = (e: MouseEvent) => {
  // 创建特效元素
  const effect = document.createElement('div')
  effect.className = 'click-effect'
  
  // 设置特效位置（修正定位）
  const x = e.clientX
  const y = e.clientY + window.scrollY
  effect.style.left = x + 'px'
  effect.style.top = y + 'px'
  
  // 添加到文档中
  document.body.appendChild(effect)
  
  // 动画结束后移除元素
  effect.addEventListener('animationend', () => {
    document.body.removeChild(effect)
  })
}

onMounted(() => {
  lastScrollTop = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  
  themeStore.initTheme()
  
  // 设置初始滑块和下划线位置
  nextTick(() => {
    const activeLink = document.querySelector('.nav-link.router-link-active') || 
                      document.querySelector('.nav-links .nav-link')
    if (activeLink) {
      handleLinkClick(activeLink as HTMLElement)
    }
  })
  
  userStore.initUserState()
  
  // 添加点击事件监听
  window.addEventListener('click', createClickEffect)
  
  // 初始化右键菜单
  setupContextMenuItems()
  
  // 初始化主题监听
  contextMenuStore.initThemeWatcher()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  
  // 移除点击事件监听
  window.removeEventListener('click', createClickEffect)
})

console.log('FooterBanner component:', FooterBanner)

// 监听路由变化，动态添加/移除 start-page-route 类
watch(() => route.path, (newPath) => {
  if (newPath === '/start') {
    document.body.classList.add('start-page-route')
  } else {
    document.body.classList.remove('start-page-route')
  }
}, { immediate: true })

// 添加判断当前路径是否为管理后台的计算属性
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// 设置页面特定的右键菜单项
const setupContextMenuItems = () => {
  // 为每个页面路由添加特定菜单项
  // 例如：博客首页的专有菜单
  contextMenuStore.registerPageMenuItems('blogHome', [
    {
      id: 'latest-articles',
      label: '最新文章',
      icon: 'mdi:file-document-multiple',
      action: () => router.push('/articles'),
      divider: true
    },
    {
      id: 'search-blog',
      label: '搜索',
      icon: 'mdi:magnify',
      action: () => {
        // 可以触发搜索框的显示
        // TODO: 实现搜索触发逻辑
      }
    }
  ])
  
  // 为导航页面添加菜单项
  contextMenuStore.registerPageMenuItems('navigation', [
    {
      id: 'all-projects',
      label: '查看所有项目',
      icon: 'mdi:view-grid',
      action: () => {
        // 切换到"全部"分类
        const el = document.querySelector('.category-btn[data-category="all"]') as HTMLElement
        if (el) el.click()
      },
      divider: true
    },
    {
      id: 'filter-web',
      label: '筛选网站项目',
      icon: 'mdi:web',
      action: () => {
        // 切换到"网站项目"分类
        const el = document.querySelector('.category-btn[data-category="web"]') as HTMLElement
        if (el) el.click()
      }
    },
    {
      id: 'filter-tools',
      label: '筛选工具应用',
      icon: 'mdi:tools',
      action: () => {
        // 切换到"工具应用"分类
        const el = document.querySelector('.category-btn[data-category="tool"]') as HTMLElement
        if (el) el.click()
      }
    }
  ])
  
  // 为个人资料页添加菜单项
  contextMenuStore.registerPageMenuItems('profile', [
    {
      id: 'edit-profile',
      label: '编辑资料',
      icon: 'mdi:account-edit',
      action: () => {
        // 触发编辑个人资料
        // TODO: 实现编辑资料逻辑
      },
      divider: true
    },
    {
      id: 'view-messages',
      label: '查看消息',
      icon: 'mdi:message',
      action: () => router.push('/message')
    }
  ])
  
  // 为文章页添加菜单项
  contextMenuStore.registerPageMenuItems('article', [
    {
      id: 'save-article',
      label: '收藏文章',
      icon: 'mdi:bookmark',
      action: () => {
        // 收藏文章
        // TODO: 实现收藏文章逻辑
      },
      divider: true
    },
    {
      id: 'share-article',
      label: '分享文章',
      icon: 'mdi:share',
      action: () => {
        // 分享文章
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: window.location.href
          })
        } else {
          navigator.clipboard.writeText(window.location.href)
          // TODO: 添加成功提示
        }
      }
    }
  ])
  
  // 为起始页添加菜单项
  contextMenuStore.registerPageMenuItems('startPage', [
    {
      id: 'settings',
      label: '页面设置',
      icon: 'mdi:cog',
      action: () => {
        // 打开设置面板
        // TODO: 实现设置面板显示逻辑
      },
      divider: true
    },
    {
      id: 'change-wallpaper',
      label: '更换壁纸',
      icon: 'mdi:image',
      action: () => {
        // 更换壁纸
        // TODO: 实现更换壁纸逻辑
      }
    }
  ])
}

// 监听路由变化，更新右键菜单上下文
watch(() => route.name, (routeName) => {
  // 构建路由名称到上下文的映射
  const contextMap: Record<string, string> = {
    'home': 'blogHome',
    'Profile': 'profile',
    'article': 'article',
    'Start': 'startPage',
    'Navigation': 'navigation'
    // 可以添加更多路由名称到上下文的映射
  }
  
  // 设置当前上下文
  if (routeName !== null && routeName !== undefined) {
    const routeNameStr = String(routeName);
    contextMenuStore.currentContext = contextMap[routeNameStr] || '';
  } else {
    contextMenuStore.currentContext = '';
  }
}, { immediate: true })

// 添加导航栏功能图标的点击处理函数
const goToRandomFriendLink = () => {
  // 随机友链跳转
  fetch(`${config.api.apiUrl}/friend-links/random`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.url) {
        const url = data.data.url.startsWith('http') ? data.data.url : `https://${data.data.url}`
        window.open(url, '_blank', 'noopener noreferrer')
      } else {
        console.error('无法获取随机友链')
      }
    })
    .catch(error => {
      console.error('获取随机友链失败:', error)
      // 备用方案：跳转到友链页面
      router.push('/friends')
    })
}

const goToFriendChain = () => {
  // 友链接力，可以跳转到一个固定的友链接力站点
  window.open('https://www.travellings.cn/go.html', '_blank', 'noopener noreferrer')
}

const goToRandomArticle = () => {
  // 随机文章跳转
  fetch(`${config.api.apiUrl}/articles/random`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.id) {
        router.push(`/article/${data.data.id}`)
      } else {
        console.error('无法获取随机文章')
      }
    })
    .catch(error => {
      console.error('获取随机文章失败:', error)
      // 备用方案：跳转到文章列表页面
      router.push('/articles')
    })
}

// 添加滚动到顶部的方法
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style>
/* 修改全局滚动条控制 */
html, 
body {
  margin: 0;
  padding: 0;
}

/* 只在特定路由下禁用滚动 */
.start-page-route {
  overflow: hidden !important;
  height: 100vh;
}

/* 美化全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0.3);
  border-radius: 3px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0.5);
}

/* 特定组件的滚动条隐藏 */
.settings-body-wrapper::-webkit-scrollbar,
.quick-links-content::-webkit-scrollbar,
.more-links-content::-webkit-scrollbar {
  display: none;
}

.settings-body-wrapper,
.quick-links-content,
.more-links-content {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 在已有的全局样式基础上添加 */
html {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 确保所有容器不会产生水平滚动 */
* {
  box-sizing: border-box;
  max-width: 100vw;
}

/* 移动到全局样式文件中 */
:root {
  --bg-primary-transparent: rgba(255, 255, 255, 0.25);
  --bg-primary: #ffffff;
  --text-primary: #333333;
  --bg-secondary: #f4f5f5;
  --border-color: #eeeeee;
  --bg-primary-rgb: 255, 255, 255;
  --article-bg-image: url('/background/article-card-bg2.jpg'); /* 日间模式背景 */
  --text-color: #2c3e50;
  --theme-color: #00a8ff;
  --code-bg: rgba(0, 0, 0, 0.05);
  --code-block-bg: #282c34;
  --quote-bg: rgba(0, 0, 0, 0.596);
  --quote-color: #666;
  --link-color: #00a8ff;
  --link-border-color: rgba(0, 168, 255, 0.5);
  --link-hover-color: #0076e4;
  --table-header-bg: rgba(0, 168, 255, 0.1);
  --table-row-bg: rgba(0, 0, 0, 0.02);
}

.dark-theme {
  --bg-primary-transparent: rgba(0, 0, 0, 0.15);
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --bg-secondary: #121212;
  --border-color: #333333;
  --bg-primary-rgb: 26, 26, 26;
  --article-bg-image: url('/background/article-card-bg.jpg'); /* 夜间模式背景 */
  --text-color: #e5e5e5;
  --code-bg: rgba(255, 255, 255, 0.1);
  --code-block-bg: #1a1a1a;
  --quote-bg: rgba(255, 255, 255, 0.1);
  --quote-color: #bbb;
  --link-color: #00a8ff;
  --link-border-color: rgba(0, 168, 255, 0.5);
  --link-hover-color: #3dbeff;
  --table-header-bg: rgba(255, 255, 255, 0.1);
  --table-row-bg: rgba(255, 255, 255, 0.05);
}

/* 主题切换按钮样式 */
.theme-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-icon {
  font-size: 24px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* 导航栏样式 */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px!important;
  background: #000000;
  transition: all 0.3s ease;
  z-index: 10000;
}

.nav-hidden {
  transform: translateY(-100%);
}

.nav-scrolled {
  background: rgba(0, 0, 0, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.nav-content {
  max-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: relative;
}

.logo {
  position: absolute;
  left: 20px;
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-links {
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: center;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #ffffff;
  text-decoration: none;
  font-size: 24px!important;
  transition: all 0.3s ease;
  padding: 0 15px;
  position: relative;
  height: 100%;
  gap: 8px;
}

.nav-icon {
  font-size: 22px;
}

.nav-link:hover {
  color: #87CEEB;
}

.nav-link.router-link-active {
  color: #87CEEB;
}

/* 下拉菜单样式 */
.nav-dropdown {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.dropdown-trigger {
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute!important;
  /* top: 100%!important; */
  left: 50%!important;
  transform: translateX(-50%)!important;
  background: #1a1a1a;
  border-radius: 4px;
  padding: 12px 0;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10001;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  transform-origin: top center;
  transform: translateX(-50%) translateY(10px);
}

.nav-dropdown:hover .dropdown-menu {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
}

.dropdown-item:hover {
  background: rgba(135, 206, 235, 0.1);
  color: #87CEEB;
}

/* 右侧功能图标区域 */
.nav-actions {
  position: absolute;
  right: 20px;
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: #87CEEB;
}

.action-btn::after {
  content: '';
  position: absolute;
  background: #87CEEB;
  bottom: 0;
  width: 0;
  height: 3px;
  /* transform:translateX(50%); */
  transition: width 0.3s ease;
  border-radius: 10px;
}

.action-btn:hover::after {
  width: 15%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    margin-left: auto;
  }
  
  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #1a1a1a;
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .nav-links.mobile-menu-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-link, 
  .nav-dropdown,
  .nav-dropdown .nav-link {
    height: auto;
    width: 100%;
  }
  
  .dropdown-menu {
    position: static;
    background: none;
    box-shadow: none;
    padding: 0 0 0 20px;
    margin-top: 10px;
    width: 100%;
    visibility: visible;
    opacity: 1;
    display: none;
  }
  
  .nav-dropdown:hover .dropdown-menu {
    display: block;
  }
}

/* 悬浮播放器样式 */
.floating-player {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
}

/* 添加播放器容器样式 */
.player-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
}

/* 修改悬浮播放器样式 */
.floating-player {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
}

.floating-cover {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

/* 修改悬停效果，应用到整个容器 */
.player-container:hover .floating-cover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.floating-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

/* 音乐信息弹出框 */
.music-info-popup {
  position: absolute;
  bottom: 60px;
  right: 0;
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 12px;
  width: 250px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
}

.mini-player {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-info {
  margin-bottom: 5px;
}

.song-info h4 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.song-info p {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.mini-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.mini-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.mini-btn:hover {
  background: rgba(135, 206, 235, 0.2);
  transform: scale(1.1);
}

.mini-btn.play {
  background: rgba(135, 206, 235, 0.15);
  padding: 6px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.volume-icon {
  font-size: 1.1rem;
  color: var(--text-primary);
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(135, 206, 235, 0.2);
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #87CEEB;
  cursor: pointer;
  transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* 暗色主题适配 */
.dark-theme .mini-btn.play {
  background: rgba(135, 206, 235, 0.25);
}

.dark-theme .volume-slider {
  background: rgba(135, 206, 235, 0.15);
}

/* 音符动画 */
.music-notes {
  position: absolute;
  right: 60px;
  bottom: 15px;
}

.note {
  position: absolute;
  color: #87CEEB;
  opacity: 0;
  animation: floatNote 2s ease infinite;
}

.note:nth-child(1) { animation-delay: 0s; }
.note:nth-child(2) { animation-delay: 0.5s; }
.note:nth-child(3) { animation-delay: 1s; }

@keyframes floatNote {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-20px) rotate(20deg);
    opacity: 0;
  }
}

/* 主题切换按钮移动效果 */
.theme-toggle {
  transition: bottom 0.3s ease;
  bottom: 30px;
}

.theme-toggle.move-up {
  bottom: 100px;
}

/* 暗色主题适配 */
.dark-theme .music-info-popup {
  background: var(--card-bg-dark);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加简要信息提示样式 */
.quick-info {
  position: absolute;
  bottom: 60px;
  right: 0;
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease;
  pointer-events: none;
}

.dark-theme .quick-info {
  background: var(--card-bg-dark);
}

/* 调整悬浮封面的样式 */
.floating-cover {
  position: relative;
  cursor: pointer;
}

/* 确保弹出框在简要信息之上 */
.music-info-popup {
  z-index: 2;
}

.quick-info {
  z-index: 1;
}

/* 简洁控制器样式 */
.quick-controls {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 15px;
  border-radius: 25px;
  margin-right: -10px;
  animation: slideIn 0.3s ease;
}

.quick-btn {
  background: none;
  border: none;
  color: white;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.quick-btn:hover {
  transform: scale(1.2);
  color: #87CEEB;
}

.quick-btn.play {
  font-size: 1.5rem;
}

/* 修改信息提示样式 */
.quick-info {
  position: absolute;
  bottom: 60px;
  right: 0;
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease;
  pointer-events: none;
}

.dark-theme .quick-info {
  background: var(--card-bg-dark);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 暗色主题适配 */
.dark-theme .quick-controls {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-theme .quick-btn:hover {
  color: #87CEEB;
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.6);
}

/* 添加新的动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .floating-player {
    right: 20px;
    bottom: 20px;
  }
  
  .player-container {
    padding: 3px;
  }
  
  .quick-controls {
    padding: 6px 12px;
    gap: 10px;
  }
  
  .quick-btn {
    font-size: 1rem;
  }
  
  .quick-btn.play {
    font-size: 1.3rem;
  }
}

/* 添加歌曲标题样式 */
.song-title {
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* 添加分隔线样式 */
.controls-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

/* 控制按钮容器 */
.control-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 暗色主题适配 */
.dark-theme .controls-divider {
  background: rgba(255, 255, 255, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .song-title {
    max-width: 120px;
    font-size: 0.85rem;
  }
  
  .controls-divider {
    height: 16px;
  }
  
  .quick-controls {
    padding: 6px 12px;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .song-title {
    max-width: 100px;
  }
}

/* 修改歌曲信息容器样式 */
.song-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.song-title {
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* 添加迷你进度条样式 */
.mini-progress {
  width: 100%;
  padding: 2px 0;
}

.mini-progress-bar {
  width: 150px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  cursor: pointer;
  position: relative;
}

.mini-progress-current {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #87CEEB;
  border-radius: 1px;
  transition: width 0.1s linear;
}

/* 进度条悬停效果 */
.mini-progress-bar:hover {
  height: 4px;
  margin: -1px 0;
}

.mini-progress-bar:hover .mini-progress-current {
  background: #87CEEB;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}

/* 暗色主题适配 */
.dark-theme .mini-progress-current {
  box-shadow: 0 0 8px rgba(135, 206, 235, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mini-progress-bar {
    width: 120px;
  }
}

@media (max-width: 480px) {
  .mini-progress-bar {
    width: 100px;
  }
}

/* 添加下拉菜单相关样式 */
.nav-dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--text-primary-rgb), 0.1);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease;
  z-index: 10001;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
}

.dropdown-item .nav-icon {
  font-size: 1.1rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0);
  color: #87CEEB;
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

/* 暗色主题适配 */
.dark-theme .dropdown-menu {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .dropdown-menu {
    position: static;
    margin-top: 8px;
    width: 100%;
  }
}

.logo-svg {
  width: 120px;
  height: auto;
}

.logo-path {
  fill: none;
  stroke: var(--text-primary);
  stroke-width: 1;
  stroke-dasharray: 1500;
  stroke-dashoffset: 1500;
  animation: draw 3s ease forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
    fill: var(--text-primary);
  }
}

/* 暗色主题适配 */
.dark-theme .logo-path {
  stroke: #fff;
}

.dark-theme .logo-path {
  animation: drawDark 3s ease forwards;
}

@keyframes drawDark {
  to {
    stroke-dashoffset: 0;
    fill: #fff;
  }
}

/* 修改移动端菜单按钮样式 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-left: auto;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  color: #87CEEB;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(30px);
    padding: 20px;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-bottom: 1px solid rgba(135, 206, 235, 0.1);
  }

  .nav-links.mobile-menu-open {
    margin-top: -25px;
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    width: 90%;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(135, 206, 235, 0.05);
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .nav-link:hover {
    background: rgba(135, 206, 235, 0.05);
    transform: scale(1.02);
    border-color: rgba(135, 206, 235, 0.2);
    box-shadow: 0 0 20px rgba(135, 206, 235, 0.1);
    color: #87CEEB;
    text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
  }

  /* 修改下拉菜单样式 */
  .nav-dropdown {
    width: 90%;
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    background: none;
    box-shadow: none;
    padding: 0;
    margin-top: 10px;
  }

  .dropdown-item {
    padding: 12px;
    text-align: center;
    background: rgba(255, 255, 255, 0.01);
    border-radius: 12px;
    margin: 8px 0;
    border: 1px solid rgba(135, 206, 235, 0.05);
    font-size: 1rem;
  }

  .dropdown-item:hover {
    background: rgba(135, 206, 235, 0.05);
    transform: scale(1.02);
    border-color: rgba(135, 206, 235, 0.2);
    color: #87CEEB;
    text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
  }

  /* 暗色主题适配 */
  .dark-theme .nav-links {
    background: rgba(0, 0, 0, 0.3);
  }

  .dark-theme .nav-link {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(135, 206, 235, 0.05);
  }

  .dark-theme .nav-link:hover {
    background: rgba(135, 206, 235, 0.08);
    border-color: rgba(135, 206, 235, 0.2);
    box-shadow: 0 0 25px rgba(135, 206, 235, 0.15);
    color: #87CEEB;
    text-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
  }

  .dark-theme .dropdown-item {
    background: rgba(0, 0, 0, 0.2);
  }

  .dark-theme .dropdown-item:hover {
    background: rgba(135, 206, 235, 0.08);
    border-color: rgba(135, 206, 235, 0.2);
    text-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
  }

  /* 隐藏原有的滑块和下划线 */
  .nav-line,
  .nav-slider,
  .nav-links::after {
    display: none;
  }
}

/* 添加动画效果 */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 防止滚动穿透 */
.mobile-menu-open {
  overflow: hidden;
}

/* 确保页脚始终在底部 */
.footer-banner {
  position: relative;
  z-index: 100;
  margin-top: auto;
}

/* 确保页脚在内容之后显示 */
.footer-banner {
  position: relative;
  z-index: 100;
  margin-top: auto;
}

/* 确保 router-view 占据剩余空间 */
router-view {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

/* 添加字体声明 */
@font-face {
  font-family: 'Yozai';
  src: url('@/assets/fonts/chinese/Yozai-Bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

/* 添加字体声明 */
@font-face {
  font-family: 'zhuzi';
  src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Alibaba';
  src: url('@/assets/fonts/chinese/Alibaba-PuHuiTi-Heavy.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

/* 修改全局样式，应用字体 */
html, 
body,
#app,
.app {
  font-family: 'zhuzi', 'Yozai', sans-serif;
  /* ... existing properties ... */
}

/* 确保所有文本元素都使用该字体 */
.nav-link,
.song-title,
.quick-info,
.dropdown-item,
button,
input,
textarea,
.logo a,
.theme-toggle,
.floating-player {
  font-family: 'zhuzi', sans-serif;
}

/* 修改点击特效样式 */
.click-effect {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: clickEffect 0.8s cubic-bezier(0, 0, 0.2, 1);
  z-index: 99999;
}

@keyframes clickEffect {
  0% {
    width: 0px;
    height: 0px;
    opacity: 0.6;
    background: rgba(135, 206, 235, 0.8);
  }
  
  50% {
    opacity: 0.4;
  }
  
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
    background: rgba(135, 206, 235, 0);
  }
}

/* 暗色主题下的点击特效 */
.dark-theme .click-effect {
  animation: clickEffectDark 0.8s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes clickEffectDark {
  0% {
    width: 0px;
    height: 0px;
    opacity: 0.8;
    background: rgba(135, 206, 235, 0.8);
    box-shadow: 0 0 20px rgba(135, 206, 235, 0.6);
  }
  
  50% {
    opacity: 0.5;
  }
  
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
    background: rgba(135, 206, 235, 0);
    box-shadow: 0 0 0 rgba(135, 206, 235, 0);
  }
}

/* 修改导航图标样式 */
.nav-icon {
  font-size: 1.2rem;
  margin-right: 4px;
  transition: all 0.3s ease;
}

/* 修改导航链接样式 */
.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
  position: relative;
  animation: fadeIn 1s ease;
  /* animation: fadeOut 1s ease; */
}

/* 导航链接悬停效果 */
.nav-link:hover {
  color: #87CEEB;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2);
  color: #87CEEB;
}

/* 暗色主题适配 */
.dark-theme .nav-link {
  color: #fff;
}

.dark-theme .nav-link:hover {
  background: rgba(133, 92, 92, 0.15);
}

/* 活动链接样式 */
.nav-link.router-link-active {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.1);
}

.nav-link.router-link-active .nav-icon {
  color: #87CEEB;
}

/* 下拉菜单样式调整 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
}

.dropdown-item .nav-icon {
  font-size: 1.1rem;
}

/* 下拉菜单项悬停效果 */
.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  margin: 2px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
  z-index: -1;
}

.dropdown-item:hover::before {
  transform: scaleX(1);
}

.dark-theme .dropdown-item::before {
  background: rgba(135, 206, 235, 0.15);
}

/* 修改下拉菜单显示逻辑 */
.nav-dropdown {
  position: relative;
}

.nav-dropdown:hover .dropdown-menu {
  visibility: visible;
  opacity: 1;
}

/* 添加延迟隐藏效果 */
.nav-dropdown:not(:hover) .dropdown-menu {
  transition-delay: 0.3s;
}

/* 保持菜单显示当悬停在菜单上时 */
.dropdown-menu:hover {
  visibility: visible;
  opacity: 1;
  transition-delay: 0s;
}

/* 添加滚动指示器样式 */
.scroll-indicator {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background-color: #87CEEB;
  z-index: 10001;
  transition: width 0.2s ease;
}

.dark-theme .scroll-indicator {
  background-color: rgba(135, 206, 235, 0.8);
  box-shadow: 0 0 8px rgba(135, 206, 235, 0.5);
}

/* Blog标题样式 */
.blog-title {
  position: absolute;
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px 15px;
  border-radius: 8px;
  z-index: 1;
  position: relative;
}

/* 添加tooltip样式 */
.blog-title .tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  margin-top: 5px;
}

.blog-title:hover .tooltip {
  opacity: 1;
}

.blog-title:hover {
  color: #87CEEB;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* 修改hover效果 */
.blog-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(135, 206, 235, 0);
  border-radius: 8px;
  z-index: -1;
  transition: all 0.3s ease;
}

.blog-title:hover::before {
  background: rgba(135, 206, 235, 0.1);
}

/* 容器样式 */
.nav-items-container {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1;
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

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* 为导航链接动画设置过渡 */
.fade-up-enter-active {
  animation: fadeInDown 0.5s ease-in-out;
}
.fade-up-leave-active {
  animation: fadeOutUp 0.5s ease-in-out;
}

/* 为博客标题动画设置过渡 */
.fade-down-enter-active {
  animation: fadeInDown 0.5s ease-in-out;
}
.fade-down-leave-active {
  animation: fadeOutUp 0.5s ease-in-out;
}

/* 导航内容包装器，使元素可以重叠 */
.nav-content-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 暗色主题适配 */
.dark-theme .nav {
  background: #000000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .logo a,
.dark-theme .nav-link {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dark-theme .dropdown-menu {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .dropdown-item {
  color: #ffffff;
}

.dark-theme .dropdown-item:hover {
  background: rgba(135, 206, 235, 0.15);
  color: #87CEEB;
}

.dark-theme .action-btn {
  color: #ffffff;
}

.dark-theme .action-btn:hover {
  color: #87CEEB;
}

.dark-theme .blog-title {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
}

.dark-theme .blog-title:hover {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.15);
}

.dark-theme .mobile-menu-btn {
  color: #ffffff;
}

.dark-theme .nav-links.mobile-menu-open {
  background: rgba(0, 0, 0, 0.85);
}

/* 确保暗色主题下的滚动指示器样式 */
.dark-theme .scroll-indicator {
  background-color: rgba(135, 206, 235, 0.8);
  box-shadow: 0 0 8px rgba(135, 206, 235, 0.5);
}

/* 暗色主题下的tooltip样式 */
.dark-theme .blog-title .tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
}

.dark-theme .mobile-menu-btn {
  color: #ffffff;
}
</style>

