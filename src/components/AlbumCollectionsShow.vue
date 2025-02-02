<template>
  <div class="album-collections">
    <div class="albums-title">
      <h1>The Memories In Gap Of My Life</h1>
      <div class="title-divider"></div>
    </div>
    <div class="timeline">
      <div v-for="(group, date) in groupedAlbums" :key="date" class="timeline-section">
        <div class="timeline-date">{{ formatDateTitle(date) }}</div>
        <div class="albums-grid">
          <div v-for="album in group" :key="album.id" class="album-card">
            <div class="album-cover">
              <img :src="album.coverUrl" :alt="album.title" />
              <div class="album-overlay">
                <span class="album-count">{{ album.count }} 张照片</span>
              </div>
            </div>
            <div class="album-info">
              <h3>{{ album.title }}</h3>
              <p>{{ album.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { albums } from '../data/albumCollections'
import { computed } from 'vue'

// 按日期对相册进行分组
const groupedAlbums = computed(() => {
  const groups: { [key: string]: typeof albums } = {}
  
  // 对相册按日期排序（从新到旧）
  const sortedAlbums = [...albums].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  sortedAlbums.forEach(album => {
    if (!groups[album.date]) {
      groups[album.date] = []
    }
    groups[album.date].push(album)
  })
  
  return groups
})

const formatDateTitle = (date: string | number) => {
  if (typeof date === 'number') return '';
  const [year, month] = date.split('-')
  return `${year} 年 ${month} 月`
}
</script>

<style scoped>
.album-collections {
  width: 100%;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(135, 206, 235, 0.8) 0%,
    rgba(135, 206, 235, 0.4) 100%
  );
}

.timeline-section {
  position: relative;
  padding-bottom: 4rem;
}

.timeline-section:last-child {
  padding-bottom: 0;
}

.timeline-date {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
  padding-left: 2rem;
  position: relative;
  display: flex;
  align-items: center;
}

.timeline-date::before {
  content: '';
  position: absolute;
  left: 0;
  width: 8px;
  height: 8px;
  background: #87CEEB;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
  z-index: 1;
}

:deep(.dark-theme) .timeline-date {
  color: rgba(255, 255, 255, 0.9);
}

@media screen and (max-width: 768px) {
  .timeline-date {
    font-size: 1.5rem;
    padding-left: 1.5rem;
  }

  .timeline {
    gap: 3rem;
  }
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin-left: 2rem;
  margin: 0 auto;
}

.album-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
}

.album-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(135, 206, 235, 0.5);
}

.album-cover {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
}

.album-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-cover img {
  transform: scale(1.1);
}

.album-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    transparent 100%
  );
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.5rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-count, .album-date {
  font-size: 0.8rem;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.album-info {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(5px);
}

.album-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 暗色主题适配 */
:deep(.dark-theme) .album-card {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.dark-theme) .album-info h3 {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.dark-theme) .album-info p {
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media screen and (max-width: 1400px) {
  .albums-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 1024px) {
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 640px) {
  .albums-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

.albums-showcase {
  width: 100%;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  position: relative;
  z-index: 3;
}

.albums-title {
  text-align: left;
  margin-bottom: 3rem;
  position: relative;
  padding-left: 2rem;
}

.title-divider {
  width: 800px;
  margin: 1rem 0;
  height: 3px;
  background: linear-gradient(90deg, 
    #87CEEB 0%,
    rgba(135, 206, 235, 0.8) 40%,
    rgba(135, 206, 235, 0.4) 70%,
    transparent 100%
  );
  position: relative;
}

.title-divider::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #87CEEB;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}
</style> 