<template>
  <div v-if="showLoadingPage" class="loading-page" :class="{ 'fade-out': isLoading }">
    <div class="loading-content">
      <div class="longmao-wrapper">
        <LongmaoAnimation />
      </div>
      <div class="logo-wrapper">
        <Hometitle @animation-complete="handleLogoAnimationComplete" />
      </div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }">
          <div class="progress-glow"></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
      <div class="loading-text">{{ loadingText }}</div>
      <div class="loading-indicator">
        <span class="dot" v-for="i in 3" :key="i"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Hometitle from './Hometitle.vue'
import LongmaoAnimation from './LongmaoAnimation.vue'
// import { useRoute } from 'vue-router'

// const route = useRoute()

// 控制是否进行真实资源加载检查
const TrueLoading = ref(false)
const isLoading = ref(false)
const progress = ref(0)
const logoAnimationComplete = ref(false)
const resourcesLoaded = ref(false)

// 加载状态文本
const loadingText = computed(() => {
  if (progress.value < 100) {
    return 'Loading resources...'
  }
  return 'Initializing...'
})

// 检查是否需要显示加载动画
const shouldShowLoading = () => {
  // 获取上次访问时间
  const lastVisit = localStorage.getItem('lastVisit')
  const currentTime = new Date().getTime()
  
  // 如果是从其他域名跳转来的，显示加载动画
  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    return true
  }
  
  // 如果没有访问记录或者距离上次访问超过30分钟，显示加载动画
  if (!lastVisit || (currentTime - parseInt(lastVisit)) > 30 * 60 * 1000) {
    return true
  }
  
  return false
}

// 控制是否显示加载页面
const showLoadingPage = ref(shouldShowLoading())

// 如果不需要显示加载页面，直接隐藏
if (!showLoadingPage.value) {
  isLoading.value = true
}

// 监听资源加载
onMounted(() => {
  // 更新最后访问时间
  localStorage.setItem('lastVisit', new Date().getTime().toString())
  
  if (showLoadingPage.value) {
    if (TrueLoading.value) {
      // 真实加载逻辑
      const resources = [
        ...Array.from(document.images),
        ...Array.from(document.getElementsByTagName('link')),
        ...Array.from(document.getElementsByTagName('script'))
      ]
      
      const totalResources = resources.length
      let loadedResources = 0

      const updateProgress = () => {
        loadedResources++
        progress.value = (loadedResources / totalResources) * 100
        
        if (loadedResources === totalResources) {
          resourcesLoaded.value = true
          checkAllComplete()
        }
      }

      resources.forEach(resource => {
        if ('complete' in resource && resource.complete) {
          updateProgress()
        } else {
          resource.addEventListener('load', updateProgress)
          resource.addEventListener('error', updateProgress)
        }
      })
    } else {
      // 假加载逻辑
      let fakeProgress = 0
      const interval = setInterval(() => {
        fakeProgress += 2
        progress.value = Math.min(fakeProgress, 100)
        
        if (fakeProgress >= 100) {
          clearInterval(interval)
          resourcesLoaded.value = true
          checkAllComplete()
        }
      }, 50)
    }
  }
})

// 处理logo动画完成事件
const handleLogoAnimationComplete = () => {
  logoAnimationComplete.value = true
  checkAllComplete()
}

// 检查所有条件是否完成
const checkAllComplete = () => {
  if (logoAnimationComplete.value && resourcesLoaded.value) {
    // 等待额外的1秒后再淡出
    setTimeout(() => {
      isLoading.value = true
    }, 1000)
  }
}
</script>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.8s ease, visibility 0.8s ease;
  background-image: url('/background/loading-bg.bmp');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  opacity: 1;
}

.loading-page.fade-out {
  opacity: 0;
  visibility: hidden;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo-wrapper {
  transform: scale(1.5);
  margin-bottom: 30px;
}

.loading-indicator {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #00ccff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-text {
  color: #ffffff;
  font-size: 18px;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
  order: 2;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 暗色主题适配 */
:deep(.dark-theme) .dot {
  background: #ffffff;
}

/* 添加进度条样式 */
.progress-container {
  width: 450px;
  margin: 20px 0;
  order: 3;
}

.progress-bar {
  height: 12px;
  background: #00ccff;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 204, 255, 0.3);
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 150px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: glow 1.5s linear infinite;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #ffffff;
}

@keyframes glow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

/* 暗色主题适配 */
:deep(.dark-theme) .progress-bar {
  background: #ffffff;
}

:deep(.dark-theme) .progress-glow {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 204, 255, 0.6),
    transparent
  );
}

.loading-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  z-index: -1;
}

.longmao-wrapper {
  width: 300px;
  height: 200px;
  margin-bottom: 20px;
}

/* 添加移动端适配 */
@media (max-width: 768px) {
  .logo-wrapper {
    transform: scale(1.2); /* 缩小 logo 大小 */
    margin-bottom: 20px;
  }

  .progress-container {
    width: 80vw; /* 使用视窗宽度的80% */
    max-width: 300px; /* 设置最大宽度 */
    margin: 15px 0;
  }

  .loading-text {
    font-size: 16px; /* 稍微减小字体大小 */
  }

  .longmao-wrapper {
    width: 250px; /* 缩小龙猫动画大小 */
    height: 160px;
    margin-bottom: 15px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .logo-wrapper {
    transform: scale(1); /* 进一步缩小 logo */
    margin-bottom: 15px;
  }

  .progress-container {
    width: 85vw;
    max-width: 250px;
  }

  .loading-text {
    font-size: 14px;
  }

  .longmao-wrapper {
    width: 200px;
    height: 140px;
    margin-bottom: 10px;
  }
}
</style> 