<template>
  <div class="notification-container">
    <transition-group name="notification-fade">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="notification-message" 
        :class="{ 
          'success': message.type === 'success', 
          'error': message.type === 'error',
          'warning': message.type === 'warning',
          'info': message.type === 'info'
        }"
      >
        <div class="notification-icon">
          <Icon :icon="getIcon(message.type)" />
        </div>
        <div class="notification-content">{{ message.text }}</div>
        <button class="notification-close" @click="() => removeMessage(message.id)">
          <Icon icon="mdi:close" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Message {
  id: number
  text: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const messages = ref<Message[]>([])
let nextId = 0

// 获取与消息类型对应的图标
const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi:check-circle'
    case 'error': return 'mdi:alert-circle'
    case 'warning': return 'mdi:alert'
    case 'info': return 'mdi:information'
    default: return 'mdi:information'
  }
}

// 添加消息
const addMessage = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
  const id = nextId++
  messages.value.push({ id, text, type })
  
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
    messages.value.splice(index, 1)
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
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 320px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-message {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slide-in 0.3s ease-out;
}

.notification-message.success {
  border-left: 4px solid #52c41a;
}

.notification-message.error {
  border-left: 4px solid #f5222d;
}

.notification-message.warning {
  border-left: 4px solid #faad14;
}

.notification-message.info {
  border-left: 4px solid #1890ff;
}

.notification-icon {
  font-size: 20px;
  display: flex;
}

.notification-message.success .notification-icon {
  color: #52c41a;
}

.notification-message.error .notification-icon {
  color: #f5222d;
}

.notification-message.warning .notification-icon {
  color: #faad14;
}

.notification-message.info .notification-icon {
  color: #1890ff;
}

.notification-content {
  flex: 1;
  font-size: 14px;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
  font-size: 16px;
}

.notification-close:hover {
  color: #666;
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 深色主题适配 */
:root.dark-theme .notification-message {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

:root.dark-theme .notification-close {
  color: #aaa;
}

:root.dark-theme .notification-close:hover {
  color: #ccc;
}
</style> 