<template>
  <div class="comments-section">
    <div class="comments-header">
      <Icon icon="mdi:comment-multiple" class="comments-icon" />
      <span class="comments-title">评论</span>
    </div>
    <div id="article-comments"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  article: {
    id: number
    title: string
  }
}>()

let artalkCss: HTMLLinkElement | null = null
let artalkJs: HTMLScriptElement | null = null

onMounted(async () => {
  // 加载 CSS
  artalkCss = document.createElement('link')
  artalkCss.rel = 'stylesheet'
  artalkCss.href = `${import.meta.env.VITE_ARTALK_SERVER}/dist/Artalk.css`
  document.head.appendChild(artalkCss)

  // 加载 JS
  artalkJs = document.createElement('script')
  artalkJs.src = `${import.meta.env.VITE_ARTALK_SERVER}/dist/Artalk.js`
  
  // 等待 JS 加载完成后初始化
  await new Promise<void>((resolve) => {
    if (artalkJs) {
      artalkJs.onload = () => resolve()
      document.head.appendChild(artalkJs)
    }
  })

  // 初始化 Artalk
  // @ts-ignore
  window.Artalk?.init({
    el: '#article-comments',
    pageKey: `/article/${props.article.id}`,
    pageTitle: props.article.title,
    server: import.meta.env.VITE_ARTALK_SERVER,
    site: import.meta.env.VITE_ARTALK_SITE,
    darkMode: true
  })
})

// 清理资源
onUnmounted(() => {
  artalkCss?.remove()
  artalkJs?.remove()
})
</script>

<style scoped>
.comments-section {
  margin: 40px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  
  .comments-icon {
    font-size: 1.4em;
    color: #2196F3;
  }
  
  .comments-title {
    font-size: 1.2em;
    color: #fff;
  }
}

/* Artalk 暗色主题自定义样式 */
:deep(#article-comments) {
  --at-color-main: #2196F3;
  --at-color-font: rgba(255, 255, 255, 0.9);
  --at-color-bg: transparent;
  --at-color-meta: rgba(255, 255, 255, 0.6);
  --at-color-border: rgba(255, 255, 255, 0.1);
  --at-color-hover: rgba(33, 150, 243, 0.1);
}
</style> 