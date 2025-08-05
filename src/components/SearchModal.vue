<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="search-modal-overlay" @click.self="close">
      <div class="search-modal-container">
        <div class="search-input-wrapper">
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="search-icon" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章标题、内容、标签..."
            class="search-input"
            @input="handleSearch"
            @keyup.esc="close"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <FontAwesomeIcon :icon="faTimes" />
          </button>
        </div>

        <div v-if="isSearching" class="search-loading">
          <div class="loading-spinner"></div>
          <span>搜索中...</span>
        </div>

        <div v-else-if="searchResults.length > 0" class="search-results">
          <div
            v-for="result in searchResults"
            :key="result.objectID"
            class="search-result-item"
            @click="goToArticle(result.objectID)"
          >
            <h3 class="result-title" v-html="result.title"></h3>
            <p class="search-snippet" v-html="result._snippetResult?.content?.value || result.description"></p>
            <div class="search-meta">
              <span class="category">
                <Icon icon="material-symbols:folder" />
                {{ result.category }}
              </span>
              <span class="date">
                <Icon icon="material-symbols:calendar-today" />
                {{ formatDate(result.createdAt) }}
              </span>
              <span class="views">
                <Icon icon="material-symbols:visibility" />
                {{ result.views }} 阅读
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="searchQuery && !isSearching" class="no-results">
          <Icon icon="material-symbols:search-off" />
          <span>没有找到相关文章</span>
        </div>

        <div v-else class="search-tips">
          <p>热门搜索：</p>
          <div class="hot-tags">
            <span
              v-for="tag in hotTags"
              :key="tag"
              @click="searchTag(tag)"
              class="hot-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="search-footer">
          <div class="search-shortcuts">
            <span class="shortcut">
              <kbd>Esc</kbd> 关闭
            </span>
            <span class="shortcut">
              <kbd>↑</kbd><kbd>↓</kbd> 导航
            </span>
            <span class="shortcut">
              <kbd>Enter</kbd> 打开
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Icon } from '@iconify/vue'

interface SearchResult {
  objectID: string
  title: string
  content?: string
  description?: string
  category: string
  createdAt: string
  views: number
  _snippetResult?: {
    content?: {
      value: string
    }
  }
}

const props = defineProps<{
  isVisible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const searchInput = ref<HTMLInputElement>()

// 模拟的热门标签
const hotTags = [
  'Vue.js',
  'JavaScript',
  '前端开发',
  'TypeScript',
  'CSS',
  'React',
  'Node.js',
  '算法',
  '设计模式',
  '性能优化'
]

// 监听弹窗显示状态
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchQuery.value = ''
    searchResults.value = []
  }
})

// 搜索处理
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  
  if (!query) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  
  try {
    // 模拟搜索结果，实际使用时替换为 Algolia API 调用
    await mockSearch(query)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isSearching.value = false
  }
}

// 模拟搜索函数（实际使用时替换为 Algolia API）
const mockSearch = async (query: string) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟搜索结果
  const mockResults: SearchResult[] = [
    {
      objectID: '1',
      title: `关于 ${query} 的深入理解`,
      content: `本文将深入探讨 ${query} 的核心概念和实际应用...`,
      category: '前端开发',
      createdAt: '2024-01-15',
      views: 1250,
      _snippetResult: {
        content: {
          value: `本文将深入探讨 <mark>${query}</mark> 的核心概念和实际应用...`
        }
      }
    },
    {
      objectID: '2',
      title: `${query} 最佳实践指南`,
      description: `分享在实际项目中使用 ${query} 的最佳实践和经验总结`,
      category: '技术分享',
      createdAt: '2024-01-10',
      views: 890
    }
  ]
  
  searchResults.value = mockResults
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInput.value?.focus()
}

// 搜索标签
const searchTag = (tag: string) => {
  searchQuery.value = tag
  handleSearch()
}

// 跳转到文章
const goToArticle = (articleId: string) => {
  close()
  router.push(`/article/${articleId}`)
}

// 关闭弹窗
const close = () => {
  emit('close')
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isVisible) return
  
  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'ArrowUp':
      e.preventDefault()
      // 导航到上一个结果
      break
    case 'ArrowDown':
      e.preventDefault()
      // 导航到下一个结果
      break
    case 'Enter':
      e.preventDefault()
      // 打开当前选中的结果
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* 弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 背景遮罩 */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 10001;
}

/* 搜索容器 */
.search-modal-container {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 搜索输入框 */
.search-input-wrapper {
  position: relative;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  opacity: 0.6;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  font-size: 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #87CEEB;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
}

.clear-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-primary);
  opacity: 0.6;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  opacity: 1;
  background: rgba(135, 206, 235, 0.1);
}

/* 加载状态 */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: var(--text-primary);
  opacity: 0.8;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid #87CEEB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜索结果 */
.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
}

.search-result-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.search-result-item:hover {
  background: rgba(135, 206, 235, 0.05);
  border-color: rgba(135, 206, 235, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.result-title :deep(mark) {
  background: rgba(255, 235, 59, 0.3);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.search-snippet {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
  opacity: 0.8;
  line-height: 1.5;
}

.search-snippet :deep(mark) {
  background: rgba(255, 235, 59, 0.3);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.search-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-primary);
  opacity: 0.6;
}

.search-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 无结果 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: var(--text-primary);
  opacity: 0.6;
  gap: 12px;
}

.no-results .icon {
  font-size: 48px;
}

/* 搜索提示 */
.search-tips {
  padding: 20px;
}

.search-tips p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
  opacity: 0.8;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag {
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-tag:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: #87CEEB;
  color: #87CEEB;
}

/* 搜索底部 */
.search-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.search-shortcuts {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-primary);
  opacity: 0.6;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
}

kbd {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  color: var(--text-primary);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
}

/* 暗色主题适配 */
.dark-theme .search-modal-container {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .search-input {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .search-input:focus {
  border-color: #87CEEB;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.2);
}

.dark-theme .search-result-item:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.3);
}

.dark-theme .hot-tag:hover {
  background: rgba(135, 206, 235, 0.15);
}

.dark-theme kbd {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 滚动条美化 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0.3);
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-modal-container {
    width: 95%;
    max-height: 80vh;
    margin: 0 10px;
  }
  
  .search-input-wrapper {
    padding: 16px;
  }
  
  .search-input {
    padding: 10px 16px 10px 40px;
    font-size: 14px;
  }
  
  .search-icon {
    left: 16px;
    font-size: 16px;
  }
  
  .clear-btn {
    right: 16px;
  }
  
  .search-results {
    padding: 16px;
  }
  
  .result-title {
    font-size: 16px;
  }
  
  .search-snippet {
    font-size: 13px;
  }
  
  .search-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-shortcuts {
    flex-direction: column;
    gap: 8px;
  }
}
</style>