<template>
  <Transition name="fade">
    <div v-if="show" class="custom-alert-overlay" @click="handleOverlayClick">
      <div class="custom-alert" :class="type">
        <div class="alert-icon">
          <Icon :icon="iconMap[type]" />
        </div>
        <div class="alert-content">
          <div class="alert-message">{{ message }}</div>
        </div>
        <button class="alert-close" @click="close">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const iconMap = {
  success: 'material-symbols:check-circle-outline',
  error: 'material-symbols:error-outline',
  warning: 'material-symbols:warning-outline',
  info: 'material-symbols:info-outline'
}

const close = () => {
  emit('update:show', false)
}

const handleOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('custom-alert-overlay')) {
    close()
  }
}

onMounted(() => {
  if (props.duration && props.duration > 0) {
    setTimeout(close, props.duration)
  }
})
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.custom-alert {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  min-width: 300px;
  max-width: 80%;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.alert-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
}

.alert-content {
  flex: 1;
  color: #fff;
}

.alert-message {
  white-space: pre-line;
  line-height: 1.5;
}

.alert-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.alert-close:hover {
  color: #fff;
  transform: rotate(90deg);
}

.success .alert-icon { color: #52c41a; }
.error .alert-icon { color: #ff4d4f; }
.warning .alert-icon { color: #faad14; }
.info .alert-icon { color: #87CEEB; }

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style> 