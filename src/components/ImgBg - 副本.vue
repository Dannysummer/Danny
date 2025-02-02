<template>
  <div class="imgbg-wrapper noscroll">
    <main>
      <section class="intro">
        <div class="grid">
          <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="row">
            <div v-for="(item, itemIndex) in row.items" :key="itemIndex" class="row__item">
              <div class="row__item-inner">
                <div class="row__item-img" :style="{ backgroundImage: `url(${item.url})` }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="fullview"></div>
        <div class="enter" @click="enterFullview"><span>{{ enterText }}</span></div>
      </section>
      <section class="content">
        <slot></slot>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import Lenis from '@studio-freight/lenis'
import type { ImgBgRow, ImgBgConfig } from '../types/imgbg'

gsap.registerPlugin(Flip)

const props = defineProps<{
  rows: ImgBgRow[]
  enterText?: string
  config?: ImgBgConfig
}>()

// 缓存窗口大小
const winsize = ref({ width: window.innerWidth, height: window.innerHeight })
const mousepos = ref({ x: winsize.value.width / 2, y: winsize.value.height / 2 })

// DOM 引用
const grid = ref<HTMLElement>()
const gridRows = ref<HTMLElement[]>([])
const content = ref<HTMLElement>()
const enterButton = ref<HTMLElement>()
const fullview = ref<HTMLElement>()

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

  // 获取当前状态
  const flipstate = Flip.getState(middleItemInner)
  
  // 移动到全屏视图
  fullview.value.appendChild(middleItemInner)
  middleItemImg.classList.add('row__item-img--large')

  // 创建动画时间线
  const tl = gsap.timeline()

  // 添加动画
  tl.add(
    Flip.from(flipstate, {
      duration: 0.9,
      ease: 'power4',
      absolute: true,
      onComplete: stopRendering
    })
  )
  .to(grid.value!, {
    duration: 0.9,
    ease: 'power4',
    opacity: 0.01
  }, 0)
  .to(middleItemImg, {
    scale: 1.2,
    duration: 3,
    ease: 'sine'
  }, '<-=0.45')
  .to(content.value, {
    y: '-30vh',
    duration: 0.9,
    ease: 'power4'
  })

  // 隐藏按钮并允许滚动
  enterButton.value?.classList.add('hidden')
  document.body.classList.remove('noscroll')
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

.intro {
  width: 100%;
  height: 100vh;
  overflow: hidden;
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
  width: 200vw;
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
.grid > .row:nth-child(1) { margin-left: -25vw; }
.grid > .row:nth-child(2) { margin-left: 15vw; }
.grid > .row:nth-child(3) { margin-left: -10vw; }
.grid > .row:nth-child(4) { margin-left: 20vw; }
.grid > .row:nth-child(5) { margin-left: -15vw; }

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
}

.row__item-img--large {
  width: 100vw;
  height: 100vh;
  top: 50%;
  left: 50%;
  margin: -50vh 0 0 -50vw;
  background-position: 50% 70%;
  will-change: transform, filter;
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
  background: url(https://github.com/misalagp/imgs/blob/main/noise.png?raw=true),
    radial-gradient(circle, transparent 0%, transparent 100%);
  background-size: 250px, 100%;
  transition: all 0.3s;
  cursor: pointer;
}

.enter::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid #ffffff;
  border-radius: 3rem;
  transition: all 0.3s;
  z-index: -1;
}

.enter:focus::before,
.enter:hover::before {
  background-color: rgba(0, 0, 0, 0.2);
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
</style> 