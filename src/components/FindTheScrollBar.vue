<template>
  <!-- 空模板，因为这是一个功能性组件 -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface ScrollbarInfo {
  element: Element
  tagName: string
  className: string
  scrollHeight: number
  clientHeight: number
  overflow: string
  overflowY: string
  position: string
}

const props = defineProps<{
  // 是否在控制台输出详细信息
  verbose?: boolean
}>()

const emits = defineEmits<{
  // 发现滚动条时触发
  (e: 'found', info: ScrollbarInfo): void
}>()

// 检测滚动条的函数
const checkScrollbars = () => {
  const elements = document.querySelectorAll('*')
  elements.forEach(el => {
    const computedStyle = window.getComputedStyle(el)
    const hasVerticalScrollbar = el.scrollHeight > el.clientHeight && 
      (computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll')
    
    if (hasVerticalScrollbar) {
      const info: ScrollbarInfo = {
        element: el,
        tagName: el.tagName,
        className: el.className,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        overflow: computedStyle.overflow,
        overflowY: computedStyle.overflowY,
        position: computedStyle.position
      }
      
      // 发出事件
      emits('found', info)
      
      // 如果启用了详细输出，则在控制台打印
      if (props.verbose) {
        console.log('发现滚动条:', info)
      }
    }
  })
}

// 创建 MutationObserver 实例
const observer = new MutationObserver(() => {
  checkScrollbars()
})

onMounted(() => {
  // 初始检测
  checkScrollbars()
  
  // 设置 MutationObserver 监听整个文档
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  })
  
  // 监听滚动事件
  window.addEventListener('scroll', checkScrollbars, { passive: true })
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkScrollbars)
})

onUnmounted(() => {
  observer.disconnect()
  window.removeEventListener('scroll', checkScrollbars)
  window.removeEventListener('resize', checkScrollbars)
})
</script> 