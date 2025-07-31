<template>
  <footer class="footer-banner">
    <div class="footer-content">
      <!-- 左侧无脸男图标 -->
      <div class="footer-icon">
        <img src="/Icon/dragonCat.png" alt="龙猫" class="dragonCat-icon" />
      </div>
      
      <!-- 中间文字内容 -->
      <div class="footer-text">
        <div class="text-line">为你的美丽，爱慕未停</div>
        <div class="text-line runtime">
          <span>本站已苟活</span>
          <span class="time-unit">{{ days }}</span>天
          <span class="time-unit">{{ hours }}</span>时
          <span class="time-unit">{{ minutes }}</span>分
          <span class="time-unit">{{ seconds }}</span>秒
        </div>
        <div class="text-line">本网站由 Dansela 独立开发 | 蜀ICP备2025124170号-1</div>
        <div class="disclaimer-carousel">
          <transition-group name="slide">
            <div class="carousel-item" v-show="currentIndex === 0" :key="0">
              {{ disclaimers[0] }}
            </div>
            <div class="carousel-item" v-show="currentIndex === 1" :key="1">
              {{ disclaimers[1] }}
            </div>
            <div class="carousel-item" v-show="currentIndex === 2" :key="2">
              {{ disclaimers[2] }}
            </div>
          </transition-group>
        </div>
      </div>
      
      <!-- 右侧龙猫图标 -->
      <div class="footer-icon">
        <img src="/Icon/dragonCat.png" alt="龙猫" class="dragonCat-icon mirror" />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 网站开始运行的时间
const startTime = new Date('2024-03-21').getTime() // 修改为你的网站上线时间

// 时间计数
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

// 计算运行时间
const calculateRuntime = () => {
  const now = new Date().getTime()
  const diff = now - startTime

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

let timer: number

// 轮播文本数组
const disclaimers = [
  "本网站内容若无源声明，仅供大家学习参考。",
  "本网站一切内容不代表本站立场，并不对其真实性负责或承担任何法律责任。",
  "如发言中提及了某个企业或个人的知识产权，请及时通过电子邮件(Danny@Dansela.cn)与我联系，本网站将立即予以删除。"
]

const currentIndex = ref(0)
let carouselTimer: number

// 轮播切换函数
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % disclaimers.length
}

onMounted(() => {
  calculateRuntime()
  timer = window.setInterval(calculateRuntime, 1000)
  
  // 启动轮播
  carouselTimer = window.setInterval(nextSlide, 5000) // 每5秒切换一次
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(carouselTimer)
})
</script>

<style scoped>
.footer-banner {
  margin-top: -40px;
  border-radius: 40px 40px 0 0;
  width: 100%;
  background: linear-gradient(
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0.6)
  ), url('/background/gqj.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  backdrop-filter: blur(10px);
  padding: 20px 0;
  color: #fff;
  position: relative;
}

/* 添加一个额外的模糊层 */
.footer-banner::before {
  border-radius: 40px 40px 0 0;
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(5px);
  pointer-events: none;
}

/* 确保内容在模糊层之上 */
.footer-content {
  border-radius: 40px 40px 0 0;
  position: relative;
  z-index: 888;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.footer-icon {
  flex: 0 0 80px;
}

.dragonCat-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.dragonCat-icon:hover {
  transform: translateY(-5px);
}

.dragonCat-icon.mirror {
  transform: scaleX(-1);
}

.dragonCat-icon.mirror:hover {
  transform: scaleX(-1) translateY(-5px);
}

.footer-text {
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.6;
  font-family: 'zhuzi', sans-serif;
}

.text-line {
  margin: 5px 0;
  font-family: 'zhuzi', sans-serif;
}

.text-line:first-child {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #87CEEB;
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.5),
    0 0 20px rgba(135, 206, 235, 0.3),
    0 0 30px rgba(135, 206, 235, 0.2);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 
      0 0 10px rgba(135, 206, 235, 0.5),
      0 0 20px rgba(135, 206, 235, 0.3),
      0 0 30px rgba(135, 206, 235, 0.2);
  }
  to {
    text-shadow: 
      0 0 20px rgba(135, 206, 235, 0.7),
      0 0 30px rgba(135, 206, 235, 0.5),
      0 0 40px rgba(135, 206, 235, 0.3);
  }
}

/* 暗色主题下增强发光效果 */
.dark-theme .text-line:first-child {
  text-shadow: 
    0 0 15px rgba(135, 206, 235, 0.7),
    0 0 25px rgba(135, 206, 235, 0.5),
    0 0 35px rgba(135, 206, 235, 0.3);
}

/* 暗色主题适配 */
.dark-theme .footer-banner {
  background: rgba(0, 0, 0, 0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .footer-icon {
    display: none;
  }
  
  .footer-text {
    font-size: 0.8rem;
  }
  
  .text-line:first-child {
    font-size: 1rem;
  }
}

/* 添加运行时间样式 */
.runtime {
  font-family: 'zhuzi', sans-serif;
  margin: 10px 0;
  color: #fff;
  font-size: 0.95rem;
}

.time-unit {
  display: inline-block;
  min-width: 25px;
  padding: 0 3px;
  margin: 0 2px;
  color: #87CEEB;
  font-weight: bold;
  font-family: 'zhuzi', sans-serif;
  text-shadow: 
    0 0 5px rgba(135, 206, 235, 0.5),
    0 0 10px rgba(135, 206, 235, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .runtime {
    font-size: 0.85rem;
  }
  
  .time-unit {
    min-width: 20px;
    padding: 0 2px;
  }
}

/* 添加轮播相关样式 */
.disclaimer-carousel {
  height: 24px; /* 根据实际文本高度调整 */
  position: relative;
  overflow: hidden;
  margin: 10px 0;
}

.carousel-item {
  position: absolute;
  width: 100%;
  transition: all 0.5s ease;
  font-family: 'zhuzi', sans-serif;
}

/* 轮播动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .disclaimer-carousel {
    height: 36px; /* 移动端可能需要更多高度来容纳文本 */
    font-size: 0.8rem;
  }
}
</style> 