<template>
  <a :href="link" target="_blank" class="share-link-container" rel="noopener noreferrer" @click="$emit('click', $event)">
    <div class="share-link-container-1">
    <span class="alert">{{ isExternalLink ? '🙄这是其他领主的领地哦，领主大人不能护你周全哈！' : '🌟这是领主大人的本土领地，您可放心前往!🌟' }}</span>
    <div class="line"></div>
      <div class="share-link-container-2">
        <div class="share-link-icon">
          <Icon :icon="icon" :width="iconSize" :height="iconSize" />
        </div>
        <div class="share-link-content">
          <div class="share-link-title">{{ title }}</div>
          <div class="share-link-description">{{ description }}</div>
        </div>
        <div class="share-link-arrow">
          <Icon icon="mdi:chevron-right" />
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  iconSize: {
    type: Number,
    default: 24
  }
});

defineEmits(['click']);

// 判断是否为外部链接
const isExternalLink = computed(() => {
  // 如果链接以 http:// 或 https:// 开头，并且不是指向当前站点的链接，则为外链
  if (!props.link) return false;
  
  // 如果是以 / 或 # 开头，则为站内链接
  if (props.link.startsWith('/') || props.link.startsWith('#')) {
    return false;
  }
  
  // 判断是否包含协议，如果包含则是外链
  return /^https?:\/\//.test(props.link);
});
</script>

<style scoped>
.alert {
  font-size: 14px;
  /* margin-bottom: 10px; */
}

.line {
  width: 100%;
  height: 1px;
  background-color: #000000;
  margin: 10px 0;
}

.share-link-container {
  /* flex-direction: column; */
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
  text-decoration: none;
  color: inherit;
  margin-bottom: 16px;
  border: 1px solid #000000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.share-link-container-1 {
  /* display: flex; */
  width: 100%;
}

.share-link-container-2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}


.share-link-container:hover {
  background-color: #39a6ff;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.share-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background-color: white;
  margin-right: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  color: #333;
}

.share-link-content {
  flex: 1;
  overflow: hidden;
}

.share-link-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  /* color: #333; */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share-link-description {
  font-size: 13px;
  /* color: #777; */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share-link-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  /* color: #999; */
  font-size: 18px;
}

/* 对于深色主题的适配 */
:root.dark-theme .share-link-container {
  background-color: #333;
  color: #f0f0f0;
}

:root.dark-theme .share-link-container:hover {
  background-color: #144561;
  color: #f0f0f0;
}

:root.dark-theme .share-link-icon {
  background-color: #444;
  color: #f0f0f0;
}

:root.dark-theme .share-link-title {
  color: #f0f0f0;
}

:root.dark-theme .share-link-description {
  color: #bbb;
}
</style> 