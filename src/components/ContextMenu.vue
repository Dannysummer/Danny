<template>
  <Teleport to="body">
    <!-- 鼠标右键点击动画 -->
    <div v-if="showRipple" class="context-menu-ripple" :style="rippleStyle"></div>
    
    <transition name="fade">
      <div
        v-if="contextMenu.visible"
        ref="menuEl"
        class="context-menu"
        :style="computedPosition"
        @click.stop
      >
        <div class="context-menu-content">
          <template v-for="(item, index) in contextMenu.currentMenuItems" :key="item.id">
            <div
              v-if="!item.hidden"
              class="context-menu-item"
              :class="{ 'disabled': item.disabled }"
              @click="handleItemClick(item)"
            >
              <div class="item-content">
                <i v-if="item.icon" class="item-icon">
                  <span class="iconify" :data-icon="item.icon"></span>
                </i>
                <span class="item-label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
              </div>
            </div>
            <div v-if="!item.hidden && item.divider && index < contextMenu.currentMenuItems.length - 1" class="divider"></div>
          </template>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useContextMenuStore } from '@/stores/contextMenu'

const contextMenu = useContextMenuStore()
const menuEl = ref<HTMLElement | null>(null)

// 鼠标右键动画相关状态
const showRipple = ref(false)
const ripplePosition = ref({ x: 0, y: 0 })

// 鼠标右键动画样式
const rippleStyle = computed(() => {
  return {
    left: `${ripplePosition.value.x}px`,
    top: `${ripplePosition.value.y}px`
  }
})

// 计算菜单位置，确保不超出屏幕边界
const computedPosition = computed(() => {
  return {
    left: `${contextMenu.position.x}px`,
    top: `${contextMenu.position.y}px`
  }
})

// 处理菜单项点击
const handleItemClick = (item: any) => {
  if (item.disabled || !item.action) return
  
  item.action()
  contextMenu.hideMenu()
}

// 隐藏菜单的处理函数
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenu.visible) {
    contextMenu.hideMenu()
  }
}

// 显示鼠标右键动画
const showRippleAnimation = (x: number, y: number) => {
  ripplePosition.value = { x, y }
  showRipple.value = true
  
  // 动画结束后隐藏
  setTimeout(() => {
    showRipple.value = false
  }, 400)
}

// 调整菜单位置，确保不超出视口
const adjustMenuPosition = () => {
  if (!menuEl.value || !contextMenu.visible) return

  nextTick(() => {
    const menu = menuEl.value
    if (!menu) return

    const rect = menu.getBoundingClientRect()
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    let { x, y } = contextMenu.position
    
    // 检查右边界
    if (x + rect.width > winWidth) {
      x = winWidth - rect.width - 10
    }
    
    // 检查下边界
    if (y + rect.height > winHeight) {
      y = winHeight - rect.height - 10
    }

    // 确保菜单不会超出顶部边界
    if (y < 10) {
      y = 10
    }

    // 确保菜单不会超出左边界
    if (x < 10) {
      x = 10
    }

    // 如果位置有变化，则更新
    if (x !== contextMenu.position.x || y !== contextMenu.position.y) {
      contextMenu.position = { x, y }
    }
  })
}

// 全局右键菜单处理
const handleContextMenu = (event: MouseEvent) => {
  // 防止默认右键菜单
  event.preventDefault()
  
  // 显示点击动画
  showRippleAnimation(event.clientX, event.clientY)
  
  // 获取当前路由上下文以显示相关菜单项
  // 这里直接将x, y坐标传递给showMenu方法
  contextMenu.showMenu(event.clientX, event.clientY, contextMenu.currentContext)
  
  // 调整菜单位置
  nextTick(adjustMenuPosition)
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('contextmenu', handleContextMenu)
  window.addEventListener('resize', adjustMenuPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleContextMenu)
  window.removeEventListener('resize', adjustMenuPosition)
})
</script>

<style lang="scss" scoped>
// 右键点击涟漪动画
.context-menu-ripple {
  position: fixed;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color, #4c84ff);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  animation: ripple 0.4s ease-out forwards;
  opacity: 0.7;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.7;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  max-width: 280px;
  user-select: none;
  
  .context-menu-content {
    background-color: var(--context-menu-bg, rgba(255, 255, 255, 0.95));
    color: var(--context-menu-color, #333);
    border-radius: 8px;
    box-shadow: var(--context-menu-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
    padding: 6px 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    overflow: hidden;
    transform-origin: top left;
    animation: scaleIn 0.15s ease-out forwards;
  }
  
  .context-menu-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background-color: transparent;
      transform: translateX(-100%);
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    
    &:not(.disabled):hover {
      background-color: var(--context-menu-hover-bg, rgba(0, 0, 0, 0.05));
      transform: translateX(2px);
      
      &::before {
        transform: translateX(0);
        background-color: var(--primary-color, #4c84ff);
      }
      
      .item-icon {
        transform: scale(1.1);
        color: var(--primary-color, #4c84ff);
      }
      
      .item-label {
        transform: translateX(2px);
      }
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .item-content {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .item-icon {
    margin-right: 10px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, color 0.2s ease;
    
    .iconify {
      font-size: 18px;
    }
  }
  
  .item-label {
    flex-grow: 1;
    font-size: 14px;
    font-weight: 500;
    transition: transform 0.2s ease;
  }
  
  .item-shortcut {
    color: var(--context-menu-shortcut-color, #999);
    font-size: 12px;
    margin-left: 10px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }
  
  .divider {
    height: 1px;
    background-color: var(--context-menu-divider-color, rgba(0, 0, 0, 0.1));
    margin: 4px 0;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 