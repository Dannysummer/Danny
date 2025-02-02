<template>
  <div class="banner">
    <!-- 背景轮播 -->
    <div class="banner-bg">
      <div class="swiper-container">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(bg, index) in backgrounds" :key="index">
            <div 
              class="slide-bg" 
              :style="{ 
                backgroundImage: `url(${bg})`,
                transform: `translate3d(0, ${scrollPosition * 0.3}px, 0)`,
                scale: currentScale
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 中间内容 -->
    <div class="banner-content">
      <div class="content-wrapper">
        <!-- 文字内容移到左边 -->
        <div class="text-content">
          <h1 class="main-title">
            <span class="title-text">Danny's Blog</span>
          </h1>
          <div class="typewriter" ref="typewriterRef"></div>
          
          <!-- 社交媒体链接 -->
          <div class="social-links">
            <a href="https://github.com/yourusername" target="_blank" class="social-link">
              <Icon icon="mdi:github" class="social-icon"/>
            </a>
            <a href="mailto:your@email.com" class="social-link">
              <Icon icon="mdi:email" class="social-icon"/>
            </a>
            <a href="https://twitter.com/yourusername" target="_blank" class="social-link">
              <Icon icon="mdi:twitter" class="social-icon"/>
            </a>
          </div>
          
          <!-- 统计数据 -->
          <div class="stats">
            <div class="stat-item">
              <span class="stat-number" ref="articleCountRef">0</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" ref="visitCountRef">0</span>
              <span class="stat-label">访问</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" ref="daysCountRef">0</span>
              <span class="stat-label">日常</span>
            </div>
          </div>
        </div>

        <!-- 头像移到右边 -->
        <div class="avatar-container">
          <div class="avatar">
            <img src="../assets/logo.png" alt="avatar" class="avatar-img">
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加波浪效果 -->
    <div class="waves-container">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
        <defs>
          <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="wave-parallax">
          <use href="#wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
          <use href="#wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use href="#wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use href="#wave" x="48" y="7" fill="rgba(255,255,255,1)" />
        </g>
      </svg>
    </div>
    
    <!-- 添加下拉箭头 -->
    <div class="scroll-down" @click="handleScrollDown">
      <svg class="arrows" viewBox="0 0 100 40">
        <path class="arrow-1" d="M10 0 L50 30 L90 0"></path>
        <path class="arrow-2" d="M10 10 L50 40 L90 10"></path>
        <path class="arrow-3" d="M10 20 L50 50 L90 20"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import Swiper from 'swiper'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import Typewriter from 'typewriter-effect/dist/core'
import { Icon } from '@iconify/vue'

// 滚动位置
const scrollPosition = ref(0)
const currentScale = ref(1)

// 处理滚动事件
const handleScroll = () => {
  scrollPosition.value = window.scrollY
}

// 添加滚动处理函数
const handleScrollDown = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  });
}

// 添加统计数字的 ref
const articleCountRef = ref<HTMLElement | null>(null)
const visitCountRef = ref<HTMLElement | null>(null)
const daysCountRef = ref<HTMLElement | null>(null)

// 添加数字滚动动画函数
const animateNumber = (element: HTMLElement, final: number, duration: number = 2000) => {
  let start = 0
  const step = Math.ceil(final / 50) // 将动画分为50步
  const stepTime = duration / 50
  
  const updateNumber = () => {
    start = Math.min(start + step, final)
    element.textContent = start.toLocaleString()
    
    if (start < final) {
      setTimeout(updateNumber, stepTime)
    }
  }
  
  updateNumber()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  const swiper = new Swiper('.swiper-container', {
    modules: [Autoplay, EffectFade],
    effect: 'fade',
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    loop: true,
    speed: 2000,
    fadeEffect: {
      crossFade: true
    }
  })

  // 监听轮播切换事件
  swiper.on('slideChangeTransitionStart', () => {
    currentScale.value = 1.1
    setTimeout(() => {
      currentScale.value = 1
    }, 8000) // 将延时也从 2000 改为 8000，与过渡时间匹配
  })

  // 初始化打字机效果
  if (typewriterRef.value) {
    new Typewriter(typewriterRef.value, {
      loop: true,
      delay: 75,
    })
    .typeString('Welcome to my digital garden 🌱')
    .pauseFor(2000)
    .deleteAll()
    .typeString('分享技术，记录生活 ✨')
    .pauseFor(2000)
    .deleteAll()
    .typeString('让我们一起成长 🚀')
    .pauseFor(2000)
    .start()
  }

  // 修改线条动画逻辑
  const titleText = document.querySelector('.title-text')
  if (titleText) {
    // 创建40条线
    for (let i = 0; i < 40; i++) {
      const line = document.createElement('span')
      line.className = 'line'
      titleText.appendChild(line)
    }
  }

  // 添加 Intersection Observer 来触发数字动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 当元素进入视图时开始动画
        if (articleCountRef.value) animateNumber(articleCountRef.value, 100)
        if (visitCountRef.value) animateNumber(visitCountRef.value, 50000)
        if (daysCountRef.value) animateNumber(daysCountRef.value, 365)
        
        // 只触发一次后取消观察
        observer.disconnect()
      }
    })
  }, {
    threshold: 0.5
  })

  // 观察统计区域
  if (articleCountRef.value) {
    observer.observe(articleCountRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 背景图片数组
const backgrounds = [
  '/src/assets/banner/bg4.png',
  '/src/assets/banner/bg5.png',
  '/src/assets/banner/bg6.png'
]

const typewriterRef = ref<HTMLElement | null>(null)
</script>

<style scoped lang="scss">
.banner {
  position: relative;
  z-index: 10;
  height: 100vh;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.swiper-container {
  width: 100%;
  height: 100%;
}

.slide-bg {
  width: 100%;
  height: 120%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform, scale;
  scale: 1;
  transition: scale 8s ease;
}

.banner-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 0 20px;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  gap: 40px;
}

.text-content {
  position: relative;
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  border-radius: 10px;
  z-index: 1;
}

.text-content::after {
  content: '';
  position: absolute;
  left: -2%;
  right: 0;
  bottom: -7%;
  height: 107%;
  width: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  z-index: -1;
}

.avatar-container {
  flex-shrink: 0;
  margin-left: 0px;
}

.avatar {
  width: 350px;
  height: 350px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
}

.avatar:hover {
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.3);
}

.avatar-img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1);
  transition: transform 0.3s ease;
}

.avatar-img:hover {
  transform: scale(1.2);
}

.main-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  display: inline-block;
}

.title-text {
  position: relative;
  display: inline-block;
  color: #fff;
  transition: 0.5s;
  transition-delay: 0.5s;
  padding: 10px 0;
  cursor: pointer;
  overflow: hidden;
}

.typewriter {
  font-size: 1.5rem;
  min-height: 2em;
}

.social-links {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.social-link {
  color: white;
  font-size: 2.4rem;
  transition: transform 0.3s ease, color 0.3s ease;
}

/* 修改各个社交媒体图标的悬停颜色 */
.social-link[href*="github"]:hover {
  color: #24292e; /* GitHub的标志黑色 */
}

.social-link[href*="mailto"]:hover {
  color: #ff9800; /* 邮件图标使用橙色 */
}

.social-link[href*="twitter"]:hover {
  color: #1da1f2; /* Twitter的标志蓝色 */
}

/* 保留上移动画效果 */
.social-link:hover {
  transform: translateY(-3px);
}

.stats {
  display: flex;
  gap: 40px;
  margin-top: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  transition: color 0.7s ease; /* 调整过渡时间为 0.7s */
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .typewriter {
    font-size: 1.2rem;
  }
  
  .stats {
    gap: 20px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .avatar {
    width: 180px;
    height: 180px;
    transform: scale(1.1);
  }
  
  .avatar:hover {
    transform: scale(1.2);
  }
  
  .content-wrapper {
    flex-direction: column-reverse;
    gap: 20px;
  }
  
  .text-content {
    align-items: center;
    text-align: center;
  }
  
  .avatar-container {
    margin-left: 0;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .stats {
    justify-content: center;
  }
}

.banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none; /* 确保不影响交互 */
}

/* 添加渐变效果 */
.banner::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5));
  z-index: 1;
  pointer-events: none;
}

/* 添加 Swiper 必要的样式 */
.swiper-slide {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.swiper-slide-active {
  z-index: 1;
}

.waves-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
  line-height: 0;
  z-index: 2;
}

.waves {
  position: relative;
  width: 200%;
  height: 100%;
}

.wave-parallax > use {
  animation: wave-move 25s cubic-bezier(.55,.5,.45,.5) infinite;
  fill: var(--bg-primary); /* 使用主题变量 */
  transition: fill 0.3s ease;
}

.wave-parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
  opacity: 0.7;
  fill: var(--bg-primary); /* 使用主题变量 */
}

.wave-parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
  opacity: 0.5;
  fill: var(--bg-primary); /* 使用主题变量 */
}

.wave-parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
  opacity: 0.3;
  fill: var(--bg-primary); /* 使用主题变量 */
}

.wave-parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 16s;
  opacity: 1;
  fill: var(--bg-primary); /* 使用主题变量 */
}

/* 暗色主题下的波浪 */
.dark-theme .wave-parallax > use {
  fill: var(--bg-secondary);
}

@keyframes wave-move {
  0% {
    transform: translate3d(85px,0,0);
  }
  100% {
    transform: translate3d(-90px,0,0);
  }
}

.scroll-down {
  position: absolute;
  bottom: 0px; /* 调整到波浪中部 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 3; /* 确保在波浪之上 */
  cursor: pointer;
}

.arrows {
  width: 80px;
  height: 60px;
}

.arrows path {
  stroke: #87CEEB; /* 默认显示天蓝色 */
  fill: transparent;
  stroke-width: 2px;
  animation: arrow 2s infinite;
  transition: stroke 0.3s ease;
}

.arrows path.arrow-1 {
  animation-delay: -1s;
}

.arrows path.arrow-2 {
  animation-delay: -0.5s;
}

.arrows path.arrow-3 {
  animation-delay: 0s;
}

@keyframes arrow {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(5px);
  }
}

.scroll-down:hover .arrows path {
  stroke: #fff; /* 悬停时变为白色 */
}

.stat-item:hover .stat-number {
  color: #87CEEB;
  text-shadow: 0 0 10px #87CEEB; /* 添加发光效果 */
}

.waves-container:hover .wave-parallax use {
  fill: #87CEEB;
  transition: fill 0.3s ease;
}

/* 添加线条容器 */
.line-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

/* 线条样式 */
.line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #87CEEB;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s ease-in-out;
  z-index: -1;
}

/* 修改线条的位置计算方式 */
.title-text .line {
  top: 0;
}

/* 悬停效果 */
.title-text:hover {
  color: #87CEEB;
  filter: drop-shadow(0 0 10px #87CEEB) drop-shadow(0 0 30px #87CEEB);
}

.title-text:hover .line {
  transform: scaleX(1);
  transform-origin: left;
}

/* 暗色主题特殊效果 */
.dark-theme .title-text:hover {
  color: #87CEEB;
  filter: drop-shadow(0 0 15px #87CEEB) drop-shadow(0 0 45px #87CEEB);
}

.dark-theme .line {
  background-color: rgba(135, 206, 235, 0.8);
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
}

/* 添加动画延迟类 */
@for $i from 0 through 39 {
  .line:nth-child(#{$i + 1}) {
    top: #{$i * 2}px;
    transition-delay: #{$i * 0.02}s;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .line {
    height: 1.5px;
  }
}

/* 暗色主题下的发光效果增强 */
.dark-theme .stat-item:hover .stat-number {
  text-shadow: 0 0 15px #87CEEB, 
              0 0 25px #87CEEB;
}
</style> 