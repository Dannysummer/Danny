<template>
  <div class="message-notification-container">
    <transition-group name="message-fade">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message-notification"
        :class="{ 
          'success': message.type === 'success', 
          'error': message.type === 'error',
          'warning': message.type === 'warning',
          'info': message.type === 'info'
        }"
        :style="{ '--message-duration': `${message.duration}ms` }"
      >
        <div class="message-content">{{ message.text }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  id: number
  text: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
  leaving?: boolean  // 添加可选的leaving属性
}

const messages = ref<Message[]>([])
let nextId = 0

// 添加消息
const addMessage = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
  const id = nextId++
  
  const message = { 
    id, 
    text, 
    type, 
    duration 
  }
  
  messages.value.push(message)
  
  // 自动移除消息
  if (duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, duration)
  }
  
  return id
}

// 移除消息
const removeMessage = (id: number) => {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index !== -1) {
    const message = messages.value[index]
    message.leaving = true
    
    // 添加离开动画的时间
    setTimeout(() => {
      const newIndex = messages.value.findIndex(msg => msg.id === id)
      if (newIndex !== -1) {
        messages.value.splice(newIndex, 1)
      }
    }, 300) // 动画持续时间
  }
}

// 清除所有消息
const clearMessages = () => {
  messages.value = []
}

// 暴露方法给父组件使用
defineExpose({
  addMessage,
  removeMessage,
  clearMessages
})
</script>

<style scoped>
.message-notification-container {
  position: fixed;
  bottom: 100px;
  right: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  min-width: 250px;
}

.message-notification {
  background: rgba(40, 45, 60, 0.85);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  backdrop-filter: blur(8px);
  border-left: 4px solid transparent;
  overflow: hidden;
}

.message-notification.success {
  border-left-color: rgb(0, 217, 255);
}

.message-notification.warning {
  border-left-color: #e6a23c;
}

.message-notification.error {
  border-left-color: #f56c6c;
}

.message-notification.info {
  border-left-color: #909399;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

/* 进度条使用 ::after 伪类 */
.message-notification::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  animation: message-progress linear;
  animation-duration: var(--message-duration, 3000ms);
}

.message-notification.success::after {
  background-color: rgb(0, 217, 255);
}

.message-notification.warning::after {
  background-color: rgba(230, 162, 60, 0.6);
}

.message-notification.error::after {
  background-color: rgba(245, 108, 108, 0.6);
}

.message-notification.info::after {
  background-color: rgba(144, 147, 153, 0.6);
}

@keyframes message-progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}

/* 过渡动画 */
.message-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.message-fade-enter-from {
  transform: translateX(120%);
  opacity: 0;
}

.message-fade-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

/* 深色主题适配 */
:root.dark-theme .message-notification {
  background: rgba(30, 35, 50, 0.95);
}
</style> 