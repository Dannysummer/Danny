<template>
  <div class="banner">
    <!-- 静态背景 -->
    <div class="banner-bg">
      <div 
        class="static-bg" 
        :style="{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: `translate3d(${mouseX * 20}px, ${(scrollPosition * 0.2) + (mouseY * 10)}px, 0)`,
        }"
      ></div>
    </div>
    
    <!-- 交互粒子效果 -->
    <div class="particles-container" ref="particlesContainer"></div>
    
    <!-- 中间内容 -->
    <div class="banner-content">
      <div class="content-wrapper">
        <!-- 头像移到上方 -->


        <!-- 文字内容移到下方 -->
        <div class="text-content" 
             :style="{ transform: `translateY(${mouseY * 0.02}px)` }">

            <div class="avatar-container" 
              :style="{ transform: `translate(${mouseX * -0.02}px, ${mouseY * -0.02}px)` }">
            <div class="avatar">
              <div class="avatar-glow"></div>
              <img src="../assets/logo.png" alt="avatar" class="avatar-img">
            </div>
          </div>

             
          <h1 class="main-title">
            <span class="title-text" data-text="Danny's Blog">Danny's Blog</span>
          </h1>
          <div class="typewriter-container">
            <div class="typewriter" ref="typewriterRef"></div>
          </div>
          
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
      </div>
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
// @ts-ignore 忽略类型检查问题
import Typewriter from 'typewriter-effect/dist/core'
import { Icon } from '@iconify/vue'

// 滚动位置
const scrollPosition = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const particlesContainer = ref<HTMLElement | null>(null)

// 使用单个背景图片
// const backgroundImage = '/src/assets/banner/bg4.png'
const backgroundImage = 'public/background/吉卜力.jpg'

// 处理鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  // 计算相对于窗口中心的位置，范围从-1到1
  mouseX.value = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
  mouseY.value = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
}

// 处理滚动事件
const handleScroll = () => {
  scrollPosition.value = window.scrollY
}

// 添加滚动处理函数
const handleScrollDown = () => {
  window.scrollTo({
    top: (window.innerHeight-62),
    behavior: 'smooth'
  });
}

// 添加统计数字的 ref
const articleCountRef = ref<HTMLElement | null>(null)
const visitCountRef = ref<HTMLElement | null>(null)
const daysCountRef = ref<HTMLElement | null>(null)
const typewriterRef = ref<HTMLElement | null>(null)

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

// 创建交互粒子效果
const createParticles = () => {
  if (!particlesContainer.value) return
  
  const container = particlesContainer.value
  const containerWidth = container.offsetWidth
  const containerHeight = container.offsetHeight
  
  // 清空现有粒子
  container.innerHTML = ''
  
  // 创建新粒子
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div')
    particle.classList.add('particle')
    
    // 随机位置
    const x = Math.random() * containerWidth
    const y = Math.random() * containerHeight
    
    // 随机大小
    const size = Math.random() * 3 + 1
    
    // 随机透明度
    const opacity = Math.random() * 0.5 + 0.1
    
    // 随机动画延迟
    const delay = Math.random() * 5
    
    // 设置样式
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    particle.style.opacity = `${opacity}`
    particle.style.animationDelay = `${delay}s`
    
    container.appendChild(particle)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  
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
  
  // 创建粒子效果
  createParticles()
  
  // 窗口大小改变时重新创建粒子
  window.addEventListener('resize', createParticles)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', createParticles)
})
</script>

<style scoped lang="scss">
.banner {
  position: relative;
  z-index: 10;
  width: 120vw;
  height: 100vh;
  overflow: hidden;
  top: -2vh;
  transform: scale(1.05);
}

.banner-bg {
  position: absolute;
  width: 120vw;
  height: 140%;
  overflow: visible;
}

.static-bg {
  position: absolute;
  width: 150%;
  height: 150%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  transition: transform 0.8s ease-out;
  transform-origin: center;
}

// 粒子效果样式
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: float 15s linear infinite;
  pointer-events: none;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-35px) translateX(-10px);
  }
  75% {
    transform: translateY(-20px) translateX(10px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  gap: 30px;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.text-content {
  position: relative;
  width: 100%;
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border-radius: 10px;
  z-index: 1;
  transition: transform 0.3s ease-out;
  padding: 20px;
  transition: all 0.3s ease;
}

.text-content::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: -10%;
  height: 120%;
  width: 100%;
  opacity: 0.0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 10px;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

// .text-content:hover::after {
//   background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5));
//   box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
//   border: 1px solid rgba(135, 206, 235, 0.2);
//   transition: all 0.3s ease;
// }

.avatar-container {
  margin-bottom: 20px;
  transition: transform 0.3s ease-out;
}

.avatar {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
  transition: all 0.4s ease;
}

.avatar:hover {
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.5), 0 0 60px rgba(135, 206, 235, 0.2);
  border: 4px solid rgba(135, 206, 235, 0.5);
  transform: scale(1.05);
}

.avatar-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(135, 206, 235, 0.3) 0%, rgba(135, 206, 235, 0) 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 0;
  pointer-events: none;
}

.avatar:hover .avatar-glow {
  opacity: 1;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.avatar-img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.avatar:hover .avatar-img {
  transform: scale(1.15) rotate(2deg);
}

.main-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  display: inline-block;
  overflow: visible;
}

.title-text {
  position: relative;
  display: inline-block;
  color: #fff;
  transition: 0.5s;
  transition-delay: 0.5s;
  padding: 10px 0;
  cursor: pointer;
  overflow: visible;
}

.title-text::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #87CEEB;
  overflow: hidden;
  border-right: 3px solid transparent;
  white-space: nowrap;
  padding: 10px 0;
  opacity: 0;
  transform: translateX(-10%);
  filter: drop-shadow(0 0 20px #87CEEB);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

// .title-text:hover::before {
//   opacity: 1;
//   transform: translateX(0);
//   border-right: 3px solid #87CEEB;
//   animation: blink-caret 0.75s step-end infinite;
// }

// @keyframes blink-caret {
//   from, to { border-color: transparent }
//   50% { border-color: #87CEEB }
// }

.typewriter {
  font-size: 1.5rem;
  min-height: 1.5em;
  background: linear-gradient(90deg, #c2e8ff, #87CEEB);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
}

.typewriter-container{
  position: relative;
  overflow: hidden;
  width: auto;
  height: 100%;
  padding: 0px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #2f2f2fd1;
  // -webkit-background-clip: text;
  // background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
  border-radius: 10px;
}

.social-links {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  justify-content: center;
}

.social-link {
  color: white;
  font-size: 2.4rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.social-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: currentColor;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

/* 修改各个社交媒体图标的悬停颜色 */
.social-link[href*="github"]:hover {
  color: #000000; /* GitHub的标志黑色 */
  text-shadow: 0 0 15px rgba(36, 41, 46, 0.6);
}

.social-link[href*="mailto"]:hover {
  color: #ff9800; /* 邮件图标使用橙色 */
  text-shadow: 0 0 15px rgba(255, 152, 0, 0.6);
}

.social-link[href*="twitter"]:hover {
  color: #1da1f2; /* Twitter的标志蓝色 */
  text-shadow: 0 0 15px rgba(29, 161, 242, 0.6);
}

/* 保留上移动画效果并增强 */
.social-link:hover {
  transform: translateY(-5px) scale(1.2);
}

.social-link:hover::after {
  width: 80%;
}

.stats {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  position: relative;
  justify-content: center;
}

.stats::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #87CEEB, transparent);
  transition: width 0.5s ease;
}

.stats:hover::before {
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.699);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s ease;
  z-index: -1;
}

.stat-item:hover::before {
  transform: scaleY(1);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  transition: all 0.7s ease; /* 调整过渡时间为 0.7s */
  background: linear-gradient(to right, #fff, #fff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-item:hover .stat-number {
  background: linear-gradient(to right, #fff, #87CEEB);
  -webkit-background-clip: text;
  background-clip: text;
  transform: scale(1.1);
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  transition: color 0.3s ease;
}

.stat-item:hover .stat-label {
  color: #87CEEB;
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
    width: 150px;
    height: 150px;
  }
  
  .social-links {
    gap: 15px;
  }
  
  .social-link {
    font-size: 2rem;
  }
}

.scroll-down {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.scroll-down:hover {
  transform: translateX(-50%) translateY(-5px);
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
  transition: all 0.3s ease;
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
  stroke-width: 3px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
}

.stat-item:hover .stat-number {
  text-shadow: 0 0 15px rgba(135, 206, 235, 0.7);
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

/* 暗色主题下的发光效果增强 */
.dark-theme .stat-item:hover .stat-number {
  text-shadow: 0 0 15px #87CEEB, 
              0 0 25px #87CEEB;
}

.dark-theme .avatar:hover {
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.7), 
              0 0 60px rgba(135, 206, 235, 0.4),
              0 0 100px rgba(135, 206, 235, 0.2);
}
</style> 