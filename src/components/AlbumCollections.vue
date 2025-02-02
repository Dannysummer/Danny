<template>
  <div class="album-collections" v-show="isVisible" @click.self="close">
    <div class="collections-container">
      <div class="collections-header">
        <h2>相册集</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="albums-grid">
        <AlbumCard
          v-for="album in currentPageAlbums"
          :key="album.id"
          :album="album"
          @select="selectAlbum"
        />
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button 
          :disabled="currentPage === 1"
          @click="prevPage"
        >上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { albums } from '../data/albumCollections'
import { albumImages } from '../data/albumImages'
import type { AlbumImage } from '../data/albumImages'
import AlbumCard from './AlbumCard.vue'

const isVisible = ref(false)
const currentPage = ref(1)
const itemsPerPage = 8

const totalPages = computed(() => Math.ceil(albums.length / itemsPerPage))

const currentPageAlbums = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return albums.slice(start, start + itemsPerPage)
})

const show = () => {
  isVisible.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  isVisible.value = false
  document.body.style.overflow = ''
}

const emit = defineEmits<{
  'select-album': [id: string, images: AlbumImage[]]
}>()

const selectAlbum = (id: string) => {
  const albumData = albumImages[id]
  if (albumData) {
    emit('select-album', id, albumData.images)
  }
  close()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

defineExpose({
  show,
  close
})
</script>

<style scoped>
.album-collections {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.collections-container {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  box-shadow: var(--modal-shadow);
  backdrop-filter: blur(20px);
}

.collections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.collections-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-primary);
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: var(--bg-hover);
}

:root {
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: rgba(0, 0, 0, 0.1);
  --modal-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  --bg-primary: rgba(255, 255, 255, 0.95);
}

:deep(.dark-theme) .collections-container {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark-theme) {
  --text-primary: #fff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
  --modal-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* 自定义滚动条样式 */
.collections-container::-webkit-scrollbar {
  width: 8px;
}

.collections-container::-webkit-scrollbar-track {
  background: transparent;
}

.collections-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-color, rgba(0, 0, 0, 0.2));
  border-radius: 4px;
}

:deep(.dark-theme) .collections-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style> 