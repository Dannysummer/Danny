<template>
  <!-- This is a recreation of Unfold's (https://dribbble.com/unfold) parallax scene: https://cdn.dribbble.com/users/14268/screenshots/3275340/northface.gif -->
  <div class="gallery-wrapper">
    <!-- 视差滚动部分 -->
    <div class="parallax-container">
      <div class="scrollDist"></div>
      <main>
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <mask id="m">
            <g class="cloud1">
              <rect fill="#fff" width="100%" height="801" y="799" />
              <image xlink:href="https://assets.codepen.io/721952/cloud1Mask.jpg" width="1200" height="800" />
            </g>
          </mask>

          <image class="sky" xlink:href="/elements/skylove/sky.png" width="1200" height="590" />
          <image class="mountBg" xlink:href="https://assets.codepen.io/721952/mountBg.png" width="1200" height="800" />
          <image class="mountMg" xlink:href="https://assets.codepen.io/721952/mountMg.png" width="1200" height="800" />
          <image class="cloud2" xlink:href="https://assets.codepen.io/721952/cloud2.png" width="1200" height="800" />
          <image class="mountFg" xlink:href="https://assets.codepen.io/721952/mountFg.png" width="1200" height="800" />
          <image class="love-couple" xlink:href="/elements/skylove/love.png" x="230" y="100" width="1000" height="1000" />
          <image class="cloud1" xlink:href="https://assets.codepen.io/721952/cloud1.png" width="1200" height="800" />
          <image class="cloud3" xlink:href="https://assets.codepen.io/721952/cloud3.png" width="1200" height="800" />
          <image class="title-text" xlink:href="/elements/shijianzhuyu.svg" x="350" y="200" width="500" height="200" />
          <g mask="url(#m)">
            <rect :fill="isDark ? '#000' : '#fff'" width="100%" height="100%" />
            <image class="title-text" xlink:href="/elements/suiyueshentou.svg" x="350" y="200" width="500" height="200" />
          </g>
        </svg>
      </main>
    </div>

    <!-- 滚动按钮 - 现在与 content-section 同级 -->
    <div class="scroll-btn-container">
      <button class="scroll-btn" @click="scrollToContent">
        <svg viewBox="0 0 50 50" width="50" height="50">
          <circle cx="25" cy="25" r="20" fill="rgba(0,0,0,0.5)" />
          <path class="arrow"
                d="M25 15 L25 35 M15 25 L25 35 L35 25"
                stroke="#fff"
                stroke-width="3"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- ImgBg 组件部分 -->
    <div class="content-section">
      <ImgBg 
        :rows="imageRows" 
        enter-text="Fragmentary lives" 
        class="custom-imgbg"
        :style="{ '--intro-bg': isDark ? '#000' : '#fff' }"
        ref="imgBgRef"
      >
        <template #album-btn>
          <AlbumCollectionsBtn @select-album="handleAlbumSelect" />
        </template>
      </ImgBg>
    </div>

    <!-- 相册集展示区域 -->
    <div class="albums-showcase">
      <div class="albums-container">
        <AlbumCollectionsShow @select-album="handleAlbumSelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ImgBg from '../../components/ImgBg.vue'
import AlbumCollectionsBtn from '../../components/AlbumCollectionsBtn.vue'
import AlbumCollectionsShow from '../../components/AlbumCollectionsShow.vue'
import type { ImgBgRow } from '../../types/imgbg'
import { useDark } from '@vueuse/core'
import type { AlbumImage } from '../../data/albumImages'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const scrollToContent = () => {
  gsap.to(window, {
    scrollTo: innerHeight + 200,
    duration: 6,
    ease: 'power2.out'
  })
}

// 图片数据
const imageRows: ImgBgRow[] = [
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/004/157/348/4k/weta-workshop-design-studio-1-thrarealm-gh-2eflatgh.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdnb.artstation.com/p/assets/images/images/063/380/103/large/still-xvii-elfs-environment-14.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/063/380/124/large/still-xvii-mordor-environment-7.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdnb.artstation.com/p/assets/images/images/064/258/965/large/artem-demura-4.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/076/855/492/large/artem-demura-erebos3-copy.jpg'
    }))
  }
]

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark-theme',
  valueLight: ''
})

// 监听主题变化
watch(isDark, (newValue) => {
  console.log('Gallery - 主题模式改变:', newValue ? '暗色' : '亮色')
})

const imgBgRef = ref<InstanceType<typeof ImgBg>>()

const handleAlbumSelect = (id: string, images: AlbumImage[]) => {
  imgBgRef.value?.updateAlbumImages(id, images)
}

onMounted(() => {
  console.log('当前主题:', isDark.value ? '暗色' : '亮色')

  gsap.timeline({
    scrollTrigger: {
      trigger: '.scrollDist',
      start: '0 0',
      end: '100% 100%',
      scrub: 1
    }
  })
    .fromTo('.sky', { y: 0 }, { y: -200 }, 0)
    .fromTo('.cloud1', { y: 100 }, { y: -800 }, 0)
    .fromTo('.cloud2', { y: -150 }, { y: -500 }, 0)
    .fromTo('.cloud3', { y: -50 }, { y: -650 }, 0)
    .fromTo('.mountBg', { y: -10 }, { y: -100 }, 0)
    .fromTo('.mountMg', { y: -30 }, { y: -250 }, 0)
    .fromTo('.mountFg', { y: -50 }, { y: -600 }, 0)
    .fromTo('.love-couple', { y: -50 }, { y: -700 }, 0)
})
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');

:deep(body), :deep(html) {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  font-family: sans-serif;
  font-size: 99px;
  text-align: center;
}

div {
  position: relative;
}

.parallax-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.content-section {
  position: relative;
  width: 100vw;
  padding: 0px;
  background: var(--bg-primary);
  z-index: 2;
  overflow: visible;
  margin: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding-bottom: 0;
  isolation: isolate;
}

.content-section::before {
  content: '';
  position: absolute;
  top: -3.5%;
  left: -5%;
  width: calc(110% + 0px);
  height: calc(110%);
  background-image: url('/public/elements/xiangkuang.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 999;
  opacity: 1;
}

main {
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1;
}

.scrollDist {
  width: 100%;
  height: 200%;
}

.gallery-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  max-width: 100vw;
  margin-bottom: 0;
  z-index: 1;
  background: var(--bg-primary);
}

.gallery-container {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding-top: 100vh;
  padding-bottom: 60px;
}

.gallery-section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 2rem 0;
}

text {
  font-family: sans-serif;
  font-size: 5vw;
}

svg {
  width: 100%;
  height: 100%;
}

.sky, .mountBg, .mountMg, .mountFg, .cloud1, .cloud2, .cloud3 {
  width: 100%;
  height: auto;
}

.title-text {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.title-text:hover {
  opacity: 1;
}

.love-couple {
  z-index: 1; /* 确保在山前云后 */
  transform-origin: center;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.2));
}

.scroll-btn-container {
  position: fixed;
  left: 50%;
  top: calc(50% + 400px);
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  pointer-events: all;
}

.scroll-btn {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
}

.scroll-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.5));
}

.scroll-btn:hover .arrow {
  transform: translateY(10px);
}

.scroll-btn circle {
  transition: fill 0.3s ease;
}

.scroll-btn:hover circle {
  fill: rgba(0,0,0,0.7);
}

.arrow {
  transition: transform 0.3s ease;
  filter: brightness(1.2);
}

/* 方法1：增加选择器特异性 */
:deep(.content-section .custom-imgbg .intro) {
  color: #fff !important;
}

/* 方法2：直接针对 intro class */
:deep(.intro) {
  color: #fff !important;
}

/* 方法3：使用更强的选择器组合 */
.gallery-wrapper :deep(.custom-imgbg) :deep(.intro) {
  color: #fff !important;
}

/* 相册集展示区域样式 */
.albums-showcase {
  width: 100%;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  position: relative;
  z-index: 3;
}

.albums-title {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.albums-title h2 {
  font-size: 2.5rem;
  color: var(--text-primary);
  font-family: "Poppins", sans-serif;
  margin: 0;
  padding: 0;
  position: relative;
  display: inline-block;
}

.title-divider {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #87CEEB, transparent);
  margin: 1rem auto;
  position: relative;
}

.title-divider::before,
.title-divider::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #87CEEB;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.title-divider::before {
  left: 0;
}

.title-divider::after {
  right: 0;
}

.albums-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* 暗色主题适配 */
:deep(.dark-theme) .albums-title h2 {
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .albums-showcase {
    padding: 2rem 1rem;
  }

  .albums-title h2 {
    font-size: 2rem;
  }
}
</style> 

