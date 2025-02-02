<template>
  <div class="album-card" @click="$emit('select', album.id)">
    <div class="album-cover">
      <img :src="album.coverUrl" :alt="album.title">
    </div>
    <div class="album-info">
      <h3>{{ album.title }}</h3>
      <p>{{ album.description }}</p>
      <div class="album-meta">
        <span>{{ album.count }} photos</span>
        <span>{{ album.date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '../data/albumCollections'

defineProps<{
  album: Album
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.album-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  box-shadow: var(--card-shadow);
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--border-color-hover);
}

.album-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-cover img {
  transform: scale(1.1);
}

.album-info {
  padding: 1rem;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
}

.album-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary, #333);
}

.album-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.album-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  margin-top: 0.5rem;
}

:root {
  --text-primary: #333;
  --text-secondary: #666;
  --bg-primary: #fff;
  --border-color: rgba(0, 0, 0, 0.1);
  --border-color-hover: rgba(0, 0, 0, 0.2);
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --card-shadow-hover: 0 10px 20px rgba(0, 0, 0, 0.15);
}

:deep(.dark-theme) .album-card {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.dark-theme) {
  --text-primary: #fff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --bg-primary: rgba(0, 0, 0, 0.3);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-color-hover: rgba(255, 255, 255, 0.2);
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  --card-shadow-hover: 0 10px 20px rgba(0, 0, 0, 0.4),
                      0 0 15px rgba(255, 255, 255, 0.1);
}
</style> 