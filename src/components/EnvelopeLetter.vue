<template>
  <div class="envelope-section" :class="{ 'is-opened': isOpened }">
    <!-- 信封封面 -->
    <div class="envelope-cover" @click="toggleEnvelope">
      <div class="envelope-flap"></div>
      <div class="envelope-content">
        <span class="envelope-title">情书</span>
        <p class="envelope-subtitle">
          路过千万人的世界，记得每个故事的主角，希望他们结局快乐
        </p>
        <Icon icon="mdi:envelope-open" class="envelope-icon" />
      </div>
    </div>

    <!-- 收起按钮 -->
    <button class="close-button" @click="toggleEnvelope" v-if="isOpened">
      <Icon icon="mdi:chevron-up" />
      <span>收起</span>
    </button>

    <!-- 信封内容插槽 -->
    <div class="letter-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const isOpened = ref(false)

const toggleEnvelope = () => {
  isOpened.value = !isOpened.value
}
</script>

<style scoped>
.envelope-section {
  position: relative;
  max-width: 800px;
  margin: 80px auto;
  padding: 0;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 200px; /* 初始高度 */
}

.envelope-section:hover:not(.is-opened) {
  height: 440px; /* 悬浮时的高度 */
}

/* 展开状态 */
.envelope-section.is-opened {
  height: auto;
  padding: 20px;
}

/* 信封封面 */
.envelope-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s ease;
  z-index: 3;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

/* 信封折线 */
.envelope-cover::before,
.envelope-cover::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 左侧折线 */
.envelope-cover::before {
  left: 0;
  bottom: 0;
  border-width: 0 0 200px 50vw;
  border-color: transparent transparent var(--border-color) transparent;
}

/* 右侧折线 */
.envelope-cover::after {
  right: 0;
  bottom: 0;
  border-width: 0 50vw 200px 0;
  border-color: transparent transparent var(--border-color) transparent;
}

/* 信封翻盖 */
.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background-color: var(--card-bg);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  border: 1px solid var(--border-color);
  transform-origin: top;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 4;
}

/* 信封内容 */
.envelope-content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
  padding: 0 20px;
}

/* 展开动画 */
.envelope-section.is-opened .envelope-flap {
  transform: rotateX(180deg);
  opacity: 0;
}

.envelope-section.is-opened .envelope-cover {
  transform: translateY(0);
  opacity: 0;
  pointer-events: none;
}

.envelope-section.is-opened .envelope-content {
  transform: translateY(100%);
  opacity: 0;
}

/* 标题和图标样式 */
.envelope-title {
  font-size: 28px;
  color: var(--text-color);
  letter-spacing: 6px;
  font-weight: 500;
  margin-bottom: 5px;
}

.envelope-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  max-width: 280px;
  opacity: 0.8;
}

.envelope-icon {
  font-size: 32px;
  color: var(--text-secondary);
}

/* 收起按钮样式 */
.close-button {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 32px;
  border-radius: 0 0 16px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translate(-50%, -100%);
  gap: 6px;
  font-size: 14px;
}

.envelope-section.is-opened .close-button {
  opacity: 1;
  transform: translate(-50%, 0);
}

.close-button:hover {
  background: var(--hover-bg);
  color: var(--text-color);
  height: 36px;
}

/* 信件内容样式 */
.letter-content {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.5s ease;
  transition-delay: 0.3s;
}

.envelope-section.is-opened .letter-content {
  opacity: 1;
  transform: translateY(0);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .close-button {
    width: 100px;
    height: 28px;
    font-size: 13px;
  }
  
  .close-button:hover {
    height: 32px;
  }
  
  .envelope-cover::before,
  .envelope-cover::after {
    border-width: 0 0 80px 50vw;
  }
}
</style> 