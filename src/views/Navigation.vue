<template>
  <div class="background-container">
    <!-- 视频背景 -->
    <video class="background-video" autoplay loop muted playsinline>
      <source src="/vedio/夏日的风.mp4" type="video/mp4">
    </video>
    
    <div class="navigation-page">
      <div class="page-header">
        <h1 class="page-title">站点导航</h1>
        <p class="page-subtitle">这里收集了我开发的一些项目和工具</p>
      </div>
      
      <div class="projects-container">
        <!-- 项目分类 -->
        <div class="project-categories">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="category-btn"
            :class="{ active: currentCategory === category.id }"
            @click="currentCategory = category.id"
            :data-category="category.id"
          >
            <span class="category-icon">
              <Icon :icon="category.icon" />
            </span>
            {{ category.name }}
          </button>
        </div>
        
        <!-- 项目列表 -->
        <div class="projects-grid">
          <div 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="project-card"
            :class="{ 'featured': project.featured }"
          >
            <div class="project-image">
              <img :src="project.image" :alt="project.name" loading="lazy" />
              <div class="project-overlay">
                <a :href="project.url" target="_blank" class="view-btn">访问站点</a>
                <a v-if="project.github" :href="project.github" target="_blank" class="github-btn">
                  <Icon icon="mdi:github" /> 源码
                </a>
              </div>
            </div>
            
            <div class="project-info">
              <div class="project-header">
                <h2 class="project-title">{{ project.name }}</h2>
                <span class="project-status" :class="getStatusClass(project.status)">
                  {{ getStatusText(project.status) }}
                </span>
              </div>
              
              <p class="project-description">{{ project.description }}</p>
              
              <div class="project-tags">
                <span 
                  v-for="tag in project.tags" 
                  :key="tag"
                  class="project-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

// 定义项目状态类型
type ProjectStatus = 'active' | 'maintenance' | 'completed' | 'development'

// 定义项目接口
interface Project {
  id: string
  name: string
  description: string
  image: string
  url: string
  github?: string
  category: string
  tags: string[]
  status: ProjectStatus
  featured?: boolean
}

// 定义分类
const categories = [
  { id: 'all', name: '全部', icon: 'mdi:view-grid' },
  { id: 'web', name: '网站项目', icon: 'mdi:web' },
  { id: 'tool', name: '工具应用', icon: 'mdi:tools' },
  { id: 'game', name: '游戏', icon: 'mdi:gamepad-variant' },
  { id: 'other', name: '其他', icon: 'mdi:dots-horizontal' }
]

// 当前选中的分类
const currentCategory = ref('all')

// 项目列表
const projects = ref<Project[]>([
  {
    id: 'personal-blog',
    name: '个人博客',
    description: '使用Vue3和TypeScript开发的个人博客网站，包含文章、随笔、相册等功能',
    image: '/projects/blog.jpg',
    url: 'https://yourblog.com',
    github: 'https://github.com/yourusername/blog',
    category: 'web',
    tags: ['Vue3', 'TypeScript', 'Node.js'],
    status: 'active',
    featured: true
  },
  {
    id: 'weather-app',
    name: '天气预报应用',
    description: '基于Vue3的PWA天气应用，支持定位、天气预报、空气质量指数等功能',
    image: '/projects/weather.jpg',
    url: 'https://weather.yourdomain.com',
    github: 'https://github.com/yourusername/weather-app',
    category: 'tool',
    tags: ['Vue3', 'PWA', 'Weather API'],
    status: 'completed'
  },
  {
    id: 'todo-app',
    name: '任务管理工具',
    description: '一个简洁高效的Todo应用，支持任务分类、优先级、提醒等功能',
    image: '/projects/todo.jpg',
    url: 'https://todo.yourdomain.com',
    category: 'tool',
    tags: ['Vue3', 'LocalStorage', 'PWA'],
    status: 'active'
  },
  {
    id: 'snake-game',
    name: '贪吃蛇小游戏',
    description: '使用Canvas开发的经典贪吃蛇游戏，支持多种难度和自定义设置',
    image: '/projects/snake.jpg',
    url: 'https://games.yourdomain.com/snake',
    github: 'https://github.com/yourusername/snake-game',
    category: 'game',
    tags: ['JavaScript', 'Canvas', 'Game'],
    status: 'maintenance'
  },
  {
    id: 'markdown-editor',
    name: 'Markdown编辑器',
    description: '在线Markdown编辑器，支持实时预览、文件导出、快捷键等功能',
    image: '/projects/markdown.jpg',
    url: 'https://md.yourdomain.com',
    category: 'tool',
    tags: ['JavaScript', 'Markdown', 'Editor'],
    status: 'development'
  },
  {
    id: 'image-gallery',
    name: '图片画廊',
    description: '响应式图片画廊，支持多种布局和过滤器效果',
    image: '/projects/gallery.jpg',
    url: 'https://gallery.yourdomain.com',
    category: 'web',
    tags: ['Vue3', 'CSS Grid', 'Animation'],
    status: 'completed'
  }
])

// 过滤项目
const filteredProjects = computed(() => {
  if (currentCategory.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.category === currentCategory.value)
})

// 获取状态类名
const getStatusClass = (status: ProjectStatus): string => {
  switch (status) {
    case 'active': return 'status-active'
    case 'maintenance': return 'status-maintenance'
    case 'completed': return 'status-completed'
    case 'development': return 'status-development'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status: ProjectStatus): string => {
  switch (status) {
    case 'active': return '活跃'
    case 'maintenance': return '维护中'
    case 'completed': return '已完成'
    case 'development': return '开发中'
    default: return ''
  }
}
</script>

<style scoped>
.background-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.background-video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -1;
  object-fit: cover;
}

.navigation-page {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 80px auto 40px;
  padding: 0 20px;
}

/* 添加一个覆盖层来增强内容可读性 */
.background-container::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
  pointer-events: none;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: white; /* 改为白色以在视频背景上更醒目 */
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* 添加文字阴影增强可读性 */
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9); /* 改为白色透明度稍低 */
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* 添加文字阴影 */
}

.project-categories {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
  gap: 10px;
}

.category-btn {
  background: rgba(255, 255, 255, 0.15); /* 微调按钮背景为半透明白色 */
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  padding: 8px 16px;
  color: white; /* 改为白色文字 */
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px); /* 添加毛玻璃效果 */
}

.category-btn:hover {
  background: rgba(var(--primary-color-rgb), 0.3);
}

.category-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.5);
}

.category-icon {
  font-size: 1.1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.project-card {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8); /* 修改为更不透明的白色背景 */
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.project-card.featured {
  border: 1px solid var(--primary-color);
  position: relative;
}

.project-card.featured::before {
  content: '推荐';
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--primary-color);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 1;
}

.project-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.view-btn, .github-btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-btn {
  background: var(--primary-color);
  color: white;
}

.view-btn:hover {
  background: var(--primary-color-hover);
  transform: scale(1.05);
}

.github-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

.github-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.project-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-title {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin: 0;
}

.project-status {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 4px;
}

.status-active {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-maintenance {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.status-completed {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-development {
  background: rgba(233, 30, 99, 0.2);
  color: #e91e63;
}

.project-description {
  color: var(--text-secondary);
  margin: 0 0 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-tag {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--text-primary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-card {
    max-width: 100%;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .category-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}

/* 暗色主题适配 */
.dark-theme .project-card {
  background: rgba(0, 0, 0, 0.65); /* 暗色主题下卡片背景更深 */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .project-title {
  color: white;
}

.dark-theme .project-description {
  color: rgba(255, 255, 255, 0.8);
}

.dark-theme .project-tag {
  background: rgba(var(--primary-color-rgb), 0.15);
  color: white;
}

.dark-theme .status-active {
  background: rgba(76, 175, 80, 0.1);
}

.dark-theme .status-maintenance {
  background: rgba(255, 152, 0, 0.1);
}

.dark-theme .status-completed {
  background: rgba(33, 150, 243, 0.1);
}

.dark-theme .status-development {
  background: rgba(233, 30, 99, 0.1);
}
</style> 