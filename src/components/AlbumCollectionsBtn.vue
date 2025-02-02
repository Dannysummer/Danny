<template>
  <button class="album-collections-btn" @click="showCollections">
    <i class="fas fa-images"></i>
  </button>
  <AlbumCollections 
    ref="collectionsRef" 
    @select-album="handleAlbumSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlbumCollections from './AlbumCollections.vue'
import type { AlbumImage } from '../data/albumImages'

const emit = defineEmits<{
  'select-album': [id: string, images: AlbumImage[]]
}>()

const collectionsRef = ref<InstanceType<typeof AlbumCollections>>()

const handleAlbumSelect = (id: string, images: AlbumImage[]) => {
  emit('select-album', id, images)
}

const showCollections = () => {
  collectionsRef.value?.show()
}
</script>

<style scoped>
.album-collections-btn {
  position: relative;
  width: 75px;
  height: 75px;
  left: -80px;
  border-radius: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  font-size: 2.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.album-collections-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

:deep(.dark-theme) .album-collections-btn {
  background: rgba(255, 255, 255, 0.1);
}
</style> 