<template>
  <div class="message-notification-container">
    <transition-group name="message-fade">
      <div 
        v-for="message in messageStore.messages" 
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
        <div class="message-content">{{ message.content }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessageStore } from '../stores/message'

// 使用消息store
const messageStore = useMessageStore()

// 监听消息变化
watch(() => messageStore.messages, (newMessages) => {
  console.log('MessageNotification组件接收到消息:', newMessages)
}, { immediate: true, deep: true })
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