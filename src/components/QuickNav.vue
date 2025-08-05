<template>
  <div class="quick-nav">
    <div class="nav-header">
      <Icon icon="mdi:menu" class="nav-icon" />
      <span class="nav-title">目录</span>
    </div>
    <div class="nav-list">
      <div 
        v-for="item in navItems" 
        :key="item.id" 
        class="nav-item"
        :class="{ 
          'is-active': item.active,
          'h1': item.level === 1,
          'h2': item.level === 2,
          'h3': item.level === 3
        }"
        @click="handleNavClick(item)"
      >
        <div class="nav-link">
          {{ item.title }}
        </div>
        <div v-if="item.children" class="nav-children">
          <div v-for="child in item.children" :key="child.id" class="nav-child">
            {{ child.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, nextTick, watch } from 'vue'

interface NavItem {
  id: number
  title: string
  active: boolean
  level: number
  children?: NavItem[]
}

const props = defineProps<{
  content?: string // 添加 content prop
}>()

const navItems = ref<NavItem[]>([])

// 解析文章标题
const parseHeadings = () => {
  // 等待 DOM 更新
  nextTick(() => {
    const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3')
    const items: NavItem[] = []
    let id = 0

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1])
      const title = heading.textContent || ''
      
      heading.id = `heading-${id}`
      
      items.push({
        id: id++,
        title,
        level,
        active: false
      })
    })

    navItems.value = items
  })
}

// 监听内容变化
watch(
  () => props.content,
  () => {
    parseHeadings()
  },
  { immediate: true }
)

// 处理点击导航
const handleNavClick = (item: NavItem) => {
  const element = document.getElementById(`heading-${item.id}`)
  element?.scrollIntoView({ behavior: 'smooth' })
}

// 修改更新激活状态的逻辑
const updateActiveHeading = () => {
  const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3')
  let activeH2Id = -1

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    if (heading.getBoundingClientRect().top <= 100) {
      const headingId = heading.id
      navItems.value.forEach(item => {
        const isActive = `heading-${item.id}` === headingId
        item.active = isActive
        
        // 如果当前激活的是三级标题，记录其父二级标题的ID
        if (isActive && item.level === 3) {
          // 向前查找最近的二级标题
          for (let j = i; j >= 0; j--) {
            if (headings[j].tagName === 'H2') {
              activeH2Id = parseInt(headings[j].id.split('-')[1])
              break
            }
          }
        }
      })
      break
    }
  }

  // 如果有激活的三级标题，激活其父二级标题
  if (activeH2Id !== -1) {
    navItems.value.forEach(item => {
      if (item.level === 2 && item.id === activeH2Id) {
        item.active = true
      }
    })
  }
}

onMounted(() => {
  parseHeadings() // 初始解析
  window.addEventListener('scroll', updateActiveHeading)
})
</script>

<style scoped>
.quick-nav {
  width: 300px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  .nav-icon {
    font-size: 1.5em;
    color: #00BCD4;
  }
  
  .nav-title {
    font-size: 1.2em;
    color: #fff;
    font-weight: bold;
  }
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &.h1 { margin-left: 0; }
  &.h2 { 
    margin-left: 1em;
  }
  &.h3 { 
    margin-left: 2em;
    display: none;
    position: relative;
    
    /* 三级标题的虚线连接 */
    &::before {
      content: '';
      position: absolute;
      left: 0em;
      top: 0px; /* 调整虚线起点 */
      /* 延长虚线长度 */
      height: calc(100% + 0px);
      width: 3px;
      border-left: 1px dashed rgba(0, 195, 255, 0.5); /* 亮蓝色虚线 */
    }
  }
  
  /* 当前激活的标题样式强调 */
  &.is-active > .nav-link {
    background: rgba(0, 195, 255, 0.15);
    color: rgb(0, 195, 255);
    font-weight: bold;
    transform: translateX(5px);
    box-shadow: 0 0 10px rgba(0, 195, 255, 0.1);
    
    /* 添加左边框强调 */
    border-left: 2px solid rgb(0, 195, 255);
    padding-left: 10px;
  }

  /* 当三级标题激活时，显示同级的三级标题 */
  &.h2.is-active ~ .h3,
  &.h3.is-active ~ .h3,
  /* 显示当前激活三级标题之前的三级标题 */
  &.h3:has(+ .h3.is-active),
  /* 显示当前激活二级标题下的所有三级标题 */
  &.h2:has(~ .h3.is-active) ~ .h3 {
    display: flex;
    animation: slideDown 0.3s ease-out;
  }
}

/* 当前激活的标题的虚线样式 */
.nav-item.h3.is-active::before,
/* 当前激活标题之前的虚线也高亮 */
.nav-item.h3.is-active::before {
  border-left-style: solid;
  border-left-color: rgba(0, 195, 255, 0.8);
  box-shadow: 0 0 8px rgba(0, 195, 255, 0.3);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-link {
  padding: 8px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-size: 0.9em;
  line-height: 1.4;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #00BCD4;
    transform: translateX(5px);
  }
}

&.is-active .nav-link {
  background: rgba(0, 188, 212, 0.2);
  color: #00BCD4;
}

.nav-children {
  margin-left: 24px;
  margin-top: 4px;
  
  .nav-child {
    padding: 6px 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9em;
    transition: all 0.3s ease;
    
    &:hover {
      color: #fff;
      transform: translateX(5px);
    }
  }
}
</style> 