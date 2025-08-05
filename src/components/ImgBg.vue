<template>
  <div class="imgbg-wrapper noscroll">
    <main>
      <section class="intro" :class="{ 'isFullview': isFullview }">
        <div class="grid">
          <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="row">
            <div v-for="(item, itemIndex) in row.items" :key="itemIndex" class="row__item">
              <div class="row__item-inner">
                <div class="row__item-img" :style="{ backgroundImage: `url(${item.url})` }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="fullview">
          <div v-if="isFullview && currentAlbumImages.length > 1" class="image-counter">
            {{ currentImageIndex + 1 }} / {{ currentAlbumImages.length }}
          </div>
          <div v-if="showNavButtons" class="nav-buttons">
            <button class="nav-btn prev" @click="navigateImage('prev')">
              <span>‹</span>
            </button>
            <button class="nav-btn next" @click="navigateImage('next')">
              <span>›</span>
            </button>
          </div>
        </div>
        <div class="enter" @click="enterFullview">
          <span>{{ enterText }}</span>
          <template v-for="i in 120" :key="i">
            <span class="line" :style="{ 
              top: `${(i - 1)}px`, 
              transitionDelay: `${Math.random() * 0.75}s` 
            }"></span>
          </template>
        </div>
        <div class="back-btn" :class="{ 'show': isFullview }" @click="exitFullview">
          <span>BACK</span>
        </div>
        <div class="album-btn-container">
          <slot name="album-btn"></slot>
        </div>
      </section>
      <section class="content">
        <slot></slot>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import Lenis from '@studio-freight/lenis'
import type { ImgBgRow, ImgBgConfig } from '../types'
import type { AlbumImage } from '../data/albumImages'

gsap.registerPlugin(Flip)

const props = defineProps<{
  rows: ImgBgRow[]
  enterText?: string
  config?: ImgBgConfig
}>()

const emit = defineEmits<{
  'update:rows': [rows: ImgBgRow[]]
}>()

// 缓存窗口大小
const winsize = ref({ width: window.innerWidth, height: window.innerHeight })
const mousepos = ref({ x: winsize.value.width / 2, y: winsize.value.height / 2 })

// 在 DOM 引用之前添加
const currentImageIndex = ref(0)
const currentAlbumId = ref<string | null>(null)
const currentAlbumImages = ref<AlbumImage[]>([])

// DOM 引用
const grid = ref<HTMLElement>()
const gridRows = ref<HTMLElement[]>([])
const content = ref<HTMLElement>()
const enterButton = ref<HTMLElement>()
const fullview = ref<HTMLElement>()
const isFullview = ref(false)

// 动画配置
const defaultConfig: ImgBgConfig = {
  translateX: true,
  skewX: false,
  contrast: true,
  scale: false,
  brightness: true
}

const config = { ...defaultConfig, ...props.config }

// 初始化渲染样式
const renderedStyles = ref<any[]>([])
let requestId: number | null = null

// 确保在使用前初始化
const ensureRenderedStyles = () => {
  if (renderedStyles.value.length === 0) {
    initRenderedStyles()
  }
}

// 动画相关函数
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

// 常量定义
const baseAmt = 0.1
const minAmt = 0.05
const maxAmt = 0.1
const numRows = props.rows.length
const middleRowIndex = Math.floor(numRows / 2)

// 初始化渲染样式
const initRenderedStyles = () => {
  renderedStyles.value = Array.from({ length: numRows }, (_, index) => {
    const distanceFromMiddle = Math.abs(index - middleRowIndex)
    const amt = Math.max(baseAmt - distanceFromMiddle * 0.03, minAmt)
    const scaleAmt = Math.min(baseAmt + distanceFromMiddle * 0.03, maxAmt)
    
    let style: any = { amt, scaleAmt }

    if (config.translateX) style.translateX = { previous: 0, current: 0 }
    if (config.skewX) style.skewX = { previous: 0, current: 0 }
    if (config.contrast) style.contrast = { previous: 100, current: 100 }
    if (config.scale) style.scale = { previous: 1, current: 1 }
    if (config.brightness) style.brightness = { previous: 100, current: 100 }

    return style
  })
}

// 映射计算函数
const calculateMappedValues = () => {
  const mappedX = (((mousepos.value.x / winsize.value.width) * 2 - 1) * 40 * winsize.value.width) / 100
  const mappedSkew = ((mousepos.value.x / winsize.value.width) * 2 - 1) * 3
  
  const mappedContrast = calculateMappedContrast()
  const mappedScale = 1 - Math.abs((mousepos.value.x / winsize.value.width) * 2 - 1) * (1 - 0.95)
  const mappedBrightness = calculateMappedBrightness()

  return {
    translateX: mappedX,
    skewX: mappedSkew,
    contrast: mappedContrast,
    scale: mappedScale,
    brightness: mappedBrightness
  }
}

// 检查是否为暗色模式
const isDarkTheme = () => document.documentElement.classList.contains('dark-theme')

// 计算映射的对比度范围
const calculateMappedContrast = () => {
  if (!isDarkTheme()) {
    return 100; // 亮色模式下保持不变
  }
  const centerContrast = 100;
  const edgeContrast = 330;
  const t = Math.abs((mousepos.value.x / winsize.value.width) * 2 - 1);
  return centerContrast - Math.pow(t, 2) * (centerContrast - edgeContrast);
}

// 计算映射的亮度范围
const calculateMappedBrightness = () => {
  if (!isDarkTheme()) {
    return 100; // 亮色模式下保持不变
  }
  const centerBrightness = 100;
  const edgeBrightness = 15;
  const t = Math.abs((mousepos.value.x / winsize.value.width) * 2 - 1);
  return centerBrightness - Math.pow(t, 2) * (centerBrightness - edgeBrightness);
}

// 渲染函数
const render = () => {
  const mappedValues = calculateMappedValues()
  ensureRenderedStyles()
  
  const shouldApplyEffects = isDarkTheme()
  
  gridRows.value.forEach((row, index) => {
    const style = renderedStyles.value[index]
    if (!style) return

    // 更新位置和变形效果
    (Object.keys(mappedValues) as Array<keyof typeof mappedValues>).forEach((prop: string) => {
      const key = prop as keyof ImgBgConfig
      if (key in config && config[key]) {
        style[key].current = mappedValues[key as keyof typeof mappedValues]
        const amt = prop === 'scale' ? style.scaleAmt : style.amt
        style[key].previous = lerp(style[key].previous, style[key].current, amt)
      }
    })

    let gsapSettings: gsap.TweenVars = {}
    
    if (config.translateX) gsapSettings.x = style.translateX.previous
    if (config.skewX) gsapSettings.skewX = style.skewX.previous
    if (config.scale) gsapSettings.scale = style.scale.previous
    
    // 只在暗色模式下应用滤镜效果
    if (!shouldApplyEffects) {
      gsapSettings.filter = 'none'
    } else {
      let filterString = ''
      if (config.contrast) filterString += `contrast(${style.contrast.previous}%) `
      if (config.brightness) filterString += `brightness(${style.brightness.previous}%)`
      if (filterString) gsapSettings.filter = filterString.trim()
    }

    gsap.set(row, gsapSettings)
  })

  requestId = requestAnimationFrame(render)
}

const startRendering = () => {
  if (!requestId) {
    render()
  }
}

const stopRendering = () => {
  if (requestId) {
    cancelAnimationFrame(requestId)
    requestId = null
  }
}

// 全屏视图切换
const enterFullview = () => {
  const middleRow = gridRows.value[middleRowIndex]
  const middleItem = middleRow?.querySelector('.row__item')
  const middleItemInner = middleItem?.querySelector('.row__item-inner')
  const middleItemImg = middleItem?.querySelector('.row__item-img')

  if (!middleItemInner || !middleItemImg || !fullview.value || !content.value) return

  // 获取当前状态和位置信息
  // const rect = middleItemInner.getBoundingClientRect()
  const flipstate = Flip.getState([middleItemInner, middleItemImg])
  
  // 移动到全屏视图
  fullview.value.appendChild(middleItemInner)
  middleItemImg.classList.add('row__item-img--large')
  
  // 如果有相册图片，显示当前索引的图片
  if (currentAlbumImages.value.length > 0) {
    (middleItemImg as HTMLElement).style.backgroundImage = `url(${currentAlbumImages.value[currentImageIndex.value].url})`
    // 预加载相邻图片
    preloadAdjacentImages(currentImageIndex.value)
  }
  
  isFullview.value = true

  // 创建动画时间线
  const tl = gsap.timeline()

  // 添加平滑过渡动画
  tl.add(
    Flip.from(flipstate, {
      duration: 0.9,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
      onComplete: stopRendering,
      // 自定义过渡
      targets: middleItemInner,
      nested: true,
      prune: true,
      simple: true,
      // 防止图片拉伸
      modifiers: {
        scale: (value: number) => Math.min(value, 1)
      }
    })
  )
  .to(grid.value!, {
    duration: 0.6,
    ease: 'power2.inOut',
    opacity: 0.01
  }, 0)
  .to(content.value, {
    y: '-30vh',
    duration: 0.6,
    ease: 'power2.inOut'
  })

  // 隐藏按钮并允许滚动
  enterButton.value?.classList.add('hidden')
  document.body.classList.remove('noscroll')
}

// 添加退出全屏视图函数
const exitFullview = () => {
  const middleRow = gridRows.value[middleRowIndex]
  const middleItem = middleRow?.querySelector('.row__item')
  const middleItemInner = fullview.value?.querySelector('.row__item-inner')
  const middleItemImg = middleItemInner?.querySelector('.row__item-img')

  if (!middleItemInner || !middleItemImg || !middleItem || !content.value) return

  // 获取当前状态
  const flipstate = Flip.getState(middleItemInner)

  // 移回原位置
  middleItem.appendChild(middleItemInner)
  middleItemImg.classList.remove('row__item-img--large')
  isFullview.value = false

  // 创建动画时间线
  const tl = gsap.timeline()

  // 添加反向动画
  tl.add(
    Flip.from(flipstate, {
      duration: 0.9,
      ease: 'power4',
      absolute: true,
      onComplete: startRendering
    })
  )
  .to(grid.value!, {
    duration: 0.9,
    ease: 'power4',
    opacity: 1
  }, 0)
  .to(content.value, {
    y: '0',
    duration: 0.9,
    ease: 'power4'
  })

  // 显示进入按钮
  enterButton.value?.classList.remove('hidden')
}

// 事件处理
const handleResize = () => {
  winsize.value = { width: window.innerWidth, height: window.innerHeight }
}

const handleMouseMove = (ev: MouseEvent) => {
  mousepos.value = { x: ev.clientX, y: ev.clientY }
}

const handleTouchMove = (ev: TouchEvent) => {
  const touch = ev.touches[0]
  mousepos.value = { x: touch.clientX, y: touch.clientY }
}

// 初始化
onMounted(() => {
  // 获取 DOM 引用
  grid.value = document.querySelector('.grid') as HTMLElement
  gridRows.value = Array.from(document.querySelectorAll('.row')) as HTMLElement[]
  content.value = document.querySelector('.content') as HTMLElement
  enterButton.value = document.querySelector('.enter') as HTMLElement
  fullview.value = document.querySelector('.fullview') as HTMLElement

  // 初始化样式
  initRenderedStyles()
  
  // 初始化 Lenis 平滑滚动
  const lenis = new Lenis({ lerp: 0.15 })
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // 初始化事件监听
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove)

  // 开始渲染
  startRendering()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  stopRendering()
})

// 添加导航按钮的显示状态
const showNavButtons = computed(() => isFullview.value && currentAlbumImages.value.length > 1)

// 添加预加载图片的函数
const preloadImage = (url: string) => {
  const img = new Image()
  img.src = url
}

// 预加载相邻图片
const preloadAdjacentImages = (currentIndex: number) => {
  const total = currentAlbumImages.value.length
  if (total <= 1) return

  // 预加载前一张
  const prevIndex = (currentIndex - 1 + total) % total
  preloadImage(currentAlbumImages.value[prevIndex].url)
  
  // 预加载后一张
  const nextIndex = (currentIndex + 1) % total
  preloadImage(currentAlbumImages.value[nextIndex].url)
}

// 修改 navigateImage 方法
const navigateImage = (direction: 'prev' | 'next') => {
  if (!currentAlbumImages.value.length) return
  
  const fullviewImg = fullview.value?.querySelector('.row__item-img') as HTMLElement
  if (!fullviewImg) return

  // 计算下一个索引
  const nextIndex = direction === 'prev'
    ? (currentImageIndex.value - 1 + currentAlbumImages.value.length) % currentAlbumImages.value.length
    : (currentImageIndex.value + 1) % currentAlbumImages.value.length

  // 先更新索引
  currentImageIndex.value = nextIndex
  
  // 然后更新图片
  nextTick(() => {
    fullviewImg.style.backgroundImage = `url(${currentAlbumImages.value[nextIndex].url})`
    // 预加载相邻图片
    preloadAdjacentImages(nextIndex)
  })
}

// 修改 updateAlbumImages 方法
const updateAlbumImages = (id: string, images: AlbumImage[]) => {
  // 先更新数据
  currentAlbumId.value = id
  currentAlbumImages.value = images
  currentImageIndex.value = 0
  
  // 如果在全屏模式下，通过调用 navigateImage 来更新图片
  if (isFullview.value && images.length > 0) {
    // 使用 nextTick 确保数据更新后再调用
    nextTick(() => {
      navigateImage('next')
      // 重置回第一张
      currentImageIndex.value = 0
    })
  }
  
  // 将图片数据转换为网格行格式
  const newRows: ImgBgRow[] = []
  const itemsPerRow = 9
  
  for (let i = 0; i < images.length; i += itemsPerRow) {
    newRows.push({
      items: images.slice(i, i + itemsPerRow).map(img => ({
        url: img.url,
        title: img.title,
        description: img.description
      }))
    })
  }
  
  emit('update:rows', newRows)
}

defineExpose({
  updateAlbumImages
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

*,
*::after,
*::before {
  box-sizing: border-box;
}

:root {
  font-size: 12px;
  --color-text: #000000;
  --color-bg: #ddd;
  --color-link: #000;
  --color-link-hover: #000;
  --page-padding: 1rem;
  --angle: -15deg;
  --trans-content: -30vh;
  --bg-color: #ffffff;
  --text-color: rgb(0, 0, 0);
  --border-color: rgb(0, 0, 0);
  --fullview-bg: #ffffff;
}

body {
  margin: 0;
  color: var(--color-text);
  background-color: var(--color-bg);
  font-family: "Poppins", sans-serif;
  text-transform: uppercase;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  text-decoration: none;
  color: var(--color-link);
  outline: none;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
  color: var(--color-link-hover);
  outline: none;
}

a:focus {
  outline: none;
  background: lightgrey;
}

a:focus:not(:focus-visible) {
  background: transparent;
}

a:focus-visible {
  outline: 2px solid red;
  background: transparent;
}

.intro--open {
  height: 80vh;
}

.noscroll {
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
}

.imgbg-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.imgbg {
  position: relative;
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
}

.intro {
  width: 100%;
  height: 100vh;
  overflow: visible;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--intro-bg);
}

.intro::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(https://github.com/misalagp/imgs/blob/main/noise.png?raw=true),
    radial-gradient(circle, #315c5f6e 0%, transparent 100%);
  background-size: 250px, 100%;
  pointer-events: none;
}

/* 亮色主题下移除遮罩 */
:root:not(.dark-theme) .intro::after {
  display: none;
}

/* 网格布局 */
.grid {
  gap: 0.5rem;
  flex: none;
  position: relative;
  width: 150vw;
  height: 200vh;
  display: grid;
  grid-template-rows: repeat(5, minmax(60px, 1fr));
  grid-template-columns: 100%;
  transform: rotate(-15deg) translateX(-50%);
  transform-origin: center center;
  mix-blend-mode: var(--grid-blend-mode);
}

.row {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(9, 1fr);
  will-change: transform, filter;
  transform: translateX(var(--row-offset, 0));
}

/* 为每行添加不同的偏移量 */
.grid > .row:nth-child(1) { margin-left: -15vw; }
.grid > .row:nth-child(2) { margin-left: 10vw; }
.grid > .row:nth-child(3) { margin-left: -5vw; }
.grid > .row:nth-child(4) { margin-left: 12vw; }
.grid > .row:nth-child(5) { margin-left: -8vw; }

/* 图片项样式 */
.row__item {
  position: relative;
  aspect-ratio: 16/9;
  padding: 0.25rem;
  transform: rotate(var(--item-rotate));
}


.row__item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.8);
}

.row__item-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: 50% 50%;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.3s ease;
  filter: var(--filter-effect, none);
}

.row__item:hover .row__item-img {
  transform: scale(1.1);
}

/* 全屏视图样式 */
.fullview {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-color: var(--fullview-bg);
  overflow: hidden; /* 防止溢出 */
}

.row__item-img--large {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  margin: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  position: absolute;
  transition: none;
}

/* 按钮样式 */
.enter {
  color: #ffffff;
  position: absolute;
  text-transform: uppercase;
  padding: 1.75rem 4rem;
  font-weight: 600;
  z-index: 100;
  font-family: "Poppins", sans-serif;
  font-size: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
  color: #87CEEB;
  letter-spacing: 0.1em;
  cursor: pointer;
  overflow: hidden;
  transition: 0.5s;
  transition-delay: 0.5s;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enter:hover {
  color: #363a3b;
  filter: drop-shadow(0 0 10px #87CEEB) drop-shadow(0 0 30px #87CEEB);
  transform: translateY(-2px);
}

/* 添加线条动画效果 */
.enter span {
  position: relative;
  z-index: 1;
  color: inherit;
}

/* 添加线条样式 */
.enter .line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #87CEEB;
  z-index: 0;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s ease-in-out;
}

.enter:hover .line {
  transform: scaleX(1);
  transform-origin: left;
}

/* 暗色主题适配 */
:deep(.dark-theme) .enter {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.dark-theme) .enter:hover {
  color: #1a1a1a;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

.fullview .row__item-inner {
  border-radius: 0px;
}

.content::before {
  content: "";
  position: absolute;
  border-radius: 10px 10px 0 0;
  height: calc(100% + (-1) * var(--trans-content));
  width: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  background: url(https://github.com/misalagp/imgs/blob/main/noise.png?raw=true),
    radial-gradient(at top, #00e1ff 0%, #ddd 100%);
  background-size: 250px, 100%;
}

.content__footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20vh;
  transform: translateY(calc(-1 * var(--trans-content)));
}

.content {
  padding: var(--page-padding);
  position: relative;
}

.content > * {
  position: relative;
}

.content__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.content__header h2 {
  font-size: 2rem;
  font-family: "Anton", sans-serif;
  font-style: normal;
  font-weight: 400;
  margin: 6rem 0 10vh;
  line-height: 0.9;
}

.content__text {
  text-wrap: balance;
  display: flex;
  flex-direction: column;
  gap: 10vh;
  padding: 0 5vw;
}

.content__text p {
  max-width: 700px;
  font-size: 1.5rem;
  line-height: 1.4;
  margin: 0;
  margin-left: auto;
}

.content__text p.highlight {
  max-width: 1000px;
  font-size: 2rem;
  font-family: "Poppins", sans-serif;
  font-weight: 300;
}

@media screen and (min-width: 53em) {
  body {
    --page-padding: 2rem 3rem;
  }
  .content__header h2 {
    font-size: clamp(2rem, 20vh, 16rem);
  }
  .content__text p.highlight {
    font-size: clamp(2rem, 7vh, 4rem);
  }
}

/* 暗色主题适配 */
:deep(.dark-theme) {
  --bg-color: #000000;
  --text-color: rgba(255, 255, 255, 0.8);
  --border-color: rgb(255, 255, 255);
  --grid-blend-mode: normal;
  --intro-bg: #000000;
  --filter-effect: brightness(var(--brightness, 100%)) contrast(var(--contrast, 100%));
  --fullview-bg: #000000;
}

/* 亮色主题 */
:root {
  --bg-color: #ffffff;
  --text-color: rgb(0, 0, 0);
  --border-color: rgb(0, 0, 0);
  --grid-blend-mode: normal;
  --intro-bg: #ffffff;
  --filter-effect: none;
}

/* 暗色主题下的内容区域 */
:deep(.dark-theme) .content::before {
  background: url(https://github.com/misalagp/imgs/blob/main/noise.png?raw=true),
    radial-gradient(at top, #1a1a1a 0%, #000000 100%);
}

/* 修改图片动画效果 */
.row__item-img {
  filter: var(--filter-effect, none);
  transition: filter 0.3s ease;
}

/* 如果有其他容器也需要调整宽度 */
.container {
  width: 100vw;
  position: relative;
}

/* 返回按钮样式 */
.back-btn {
  position: fixed;
  bottom: 8rem;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  padding: 0.8rem 2rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn.show {
  opacity: 1;
  visibility: visible;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

/* 暗色主题适配 */
:deep(.dark-theme) .back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.dark-theme) .back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.album-btn-container {
  position: fixed;
  bottom: 8rem;
  left: calc(50% + 180px);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

/* 当全屏视图打开时显示相册按钮 */
.isFullview .album-btn-container {
  opacity: 1;
  visibility: visible;
}

/* 导航按钮样式 */
.nav-buttons {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  transform: translateY(-50%);
  z-index: 1000;
  pointer-events: all;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.1);
  margin: 0 10px;
  margin-bottom: 40px;
  border: none;
  border-radius: 0.5rem;
  width: 40px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(135, 206, 235, 0.3);
  position: relative;
  overflow: hidden;
}

.nav-btn span {
  color: white;
  font-size: 36px;
  font-weight: 300;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
}

.nav-btn:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.8);
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.3);
}

.nav-btn:hover span {
  color: #87CEEB;
  text-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
}

.nav-btn:active {
  transform: scale(0.95);
}

/* 添加按钮内部的发光效果 */
.nav-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(135, 206, 235, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.4s ease;
}

.nav-btn:hover::before {
  transform: translate(-50%, -50%) scale(1);
}

/* 暗色主题适配 */
:deep(.dark-theme) .nav-btn {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(135, 206, 235, 0.2);
}

:deep(.dark-theme) .nav-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(135, 206, 235, 0.8);
}

/* 修改箭头符号样式 */
.nav-btn.prev span {
  content: "‹";
  margin-right: 5px;
}

.nav-btn.next span {
  content: "›";
  margin-left: 5px;
}

/* 确保全屏视图中的图片能够正确显示 */
.fullview .row__item-inner {
  width: 100%;
  height: 100%;
}

.row__item-img--large {
  transition: background-image 0.3s ease;
}

/* 添加状态栏样式 */
.image-counter {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.0);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  z-index: 999;
  border: 1px solid rgba(255, 255, 255, 0.0);
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* 暗色主题适配 */
:deep(.dark-theme) .image-counter {
  background: rgba(255, 255, 255, 0.0);
}

/* 确保状态栏只在全屏模式下显示 */
.image-counter {
  opacity: 0;
  visibility: hidden;
}

.isFullview .image-counter {
  opacity: 1;
  visibility: visible;
}
</style> 