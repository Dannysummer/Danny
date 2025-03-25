<template>
  <div class="external-link-alert" v-if="show">
    <div class="alert-container">
      <div class="alert-header">
        <Icon icon="mdi:information-outline" class="alert-icon" />
        <h3>您即将离开本站</h3>
        <button class="close-btn" @click="close">
          <Icon icon="mdi:close" />
        </button>
      </div>
      <div class="alert-content">
        <p>您点击的链接将带您前往：</p>
        <div class="link-url">{{ url }}</div>
        <p class="warning-text">该网站不受我们控制，可能存在安全风险。请确认您信任此网站。</p>
      </div>
      <div class="alert-actions">
        <button class="cancel-btn" @click="close">取消</button>
        <a :href="url" target="_blank" rel="noopener noreferrer" class="proceed-btn" @click="close">
          <Icon icon="mdi:open-in-new" />
          <span>继续访问</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';

// 组件属性
const props = defineProps<{
  url: string;
  show: boolean;
}>();

// 组件事件
const emit = defineEmits(['close']);

// 关闭对话框
const close = () => {
  emit('close');
};
</script>

<style scoped>
.external-link-alert {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fade-in 0.3s ease;
}

.alert-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: slide-up 0.4s ease;
}

.alert-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #4a90e2;
  color: white;
  position: relative;
}

.alert-icon {
  font-size: 24px;
  margin-right: 10px;
}

.alert-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.alert-content {
  padding: 20px;
}

.alert-content p {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}

.link-url {
  background-color: rgba(74, 144, 226, 0.1);
  padding: 12px 15px;
  border-radius: 6px;
  margin: 15px 0;
  font-family: monospace;
  word-break: break-all;
  color: #4a90e2;
  font-size: 14px;
  border-left: 3px solid #4a90e2;
}

.warning-text {
  color: #e74c3c !important;
  font-size: 14px !important;
}

.alert-actions {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .proceed-btn {
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
  border: none;
}

.cancel-btn:hover {
  background-color: #e4e4e4;
}

.proceed-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.proceed-btn:hover {
  background-color: #3a7bc8;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .alert-container {
  background-color: #2d2d2d;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
}

:root[class='dark-theme'] .alert-content p {
  color: #e0e0e0;
}

:root[class='dark-theme'] .link-url {
  background-color: rgba(74, 144, 226, 0.2);
  color: #7ab5ff;
}

:root[class='dark-theme'] .cancel-btn {
  background-color: #3d3d3d;
  color: #e0e0e0;
}

:root[class='dark-theme'] .cancel-btn:hover {
  background-color: #4d4d4d;
}
</style> 