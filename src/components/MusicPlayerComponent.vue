<template>
  <div class="music-container">
    <div class="music-player">
      <!-- 添加标题和分隔线 -->
      <div class="player-header">
        <h3 class="player-title">
          <span class="title-static">MusicPlayer</span>
          <span class="title-separator">-</span>
          <span class="title-dynamic">{{ currentText }}</span>
          <span class="title-separator">-</span>
          <span class="title-status">{{ musicStore.isPlaying ? 'Playing' : 'Stop' }}</span>
        </h3>
        <div class="player-divider">
          <img :src="dividerImage" alt="divider" class="divider-image" />
        </div>
      </div>
      
      <div class="music-info">
        <img :src="coverImage" alt="music cover" class="music-cover" />
        <div class="music-details">
          <div class="marquee-container">
            <div class="marquee-content" :class="{ 'marquee-animation': shouldMarquee }">
              <span class="song-name">{{ musicStore.currentSong.title }}</span>
            </div>
          </div>
          <div class="marquee-container">
            <div class="marquee-content" :class="{ 'marquee-animation': shouldMarqueeArtist }">
              <span class="artist-name">{{ musicStore.currentSong.artist }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="player-controls">
        <div class="progress-container">
          <span class="time">{{ formatTime(musicStore.currentTime) }}</span>
          <div class="progress-bar" 
              @mousedown="startDragging"
              @mousemove="handleDragging"
              @mouseup="stopDragging"
              @mouseleave="stopDragging"
              @click="handleProgressClick">
            <div class="progress" :style="{ width: `${progress}%` }"></div>
            <div class="progress-handle" 
                  :style="{ left: `${progress}%` }"
                  v-show="isDragging || isHovering"
            ></div>
          </div>
          <span class="time">{{ formatTime(musicStore.duration) }}</span>
        </div>
        <div class="controls-volume">
          <div class="control-buttons">
            <button class="control-btn" @click="musicStore.prevSong">
              <Icon icon="mdi:skip-previous" />
            </button>
            <button class="control-btn play-btn" @click="handlePlayClick">
              <Icon :icon="musicStore.isPlaying ? 'mdi:pause' : 'mdi:play'" />
            </button>
            <button class="control-btn" @click="musicStore.nextSong">
              <Icon icon="mdi:skip-next" />
            </button>
          </div>
          <div class="volume-control">
            <button class="volume-btn" @click="toggleMute">
              <Icon :icon="volumeIcon" />
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model="volume" 
              @input="handleVolumeChange"
              class="volume-slider"
            />
          </div>
          <div class="extra-controls">
            <button class="control-btn mode-btn" @click="togglePlayMode" :title="playModeTitle">
              <Icon :icon="playModeIcon" />
            </button>
            <button class="control-btn list-btn" @click="toggleMusicList">
              <Icon icon="mdi:playlist-music" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加音乐列表弹出层 -->
  <Transition name="slide-right">
    <div v-if="showMusicList" class="music-list-overlay" @click="toggleMusicList">
      <div class="music-list-container" @click.stop>
        <div class="list-header">
          <span class="list-title">播放列表 ({{ musicStore.playlist.length }})</span>
          <button class="close-btn" @click="toggleMusicList">
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
        <div class="list-content">
          <div 
            v-for="(song, index) in musicStore.playlist" 
            :key="index"
            class="list-item"
            :class="{ 'active': song === musicStore.currentSong }"
            @click="musicStore.playSong(index)"
          >
            <div class="song-info">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <Icon 
              v-if="song === musicStore.currentSong" 
              :icon="musicStore.isPlaying ? 'mdi:volume-high' : 'mdi:volume-off'" 
              class="playing-icon"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 添加提示组件 -->
  <div class="mode-toast" v-if="showToast" :class="{ 'show': showToast }">
    {{ toastMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useMusicStore } from '../stores/music'
import { useThemeStore } from '../stores/theme'

const musicStore = useMusicStore()
const themeStore = useThemeStore()
const showToast = ref(false)
const toastMessage = ref('')
const volume = ref(20)
const previousVolume = ref(20)
const shouldMarquee = ref(false)
const shouldMarqueeArtist = ref(false)
const showMusicList = ref(false)
const isDragging = ref(false)
const isHovering = ref(false)

// 文本池
const textPool = [
  '起风了~~',
  '让音乐带你飞',
  '聆听美好时光',
  '感受音乐的魅力',
  '让心灵随乐起舞'
]

const currentTextIndex = ref(0)
const currentText = ref(textPool[0])

// 计算属性
const progress = computed(() => {
  if (!musicStore.duration) return 0
  return (musicStore.currentTime / musicStore.duration) * 100
})

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'mdi:volume-off'
  if (volume.value < 30) return 'mdi:volume-low'
  if (volume.value < 70) return 'mdi:volume-medium'
  return 'mdi:volume-high'
})

const coverImage = computed(() => {
  if (themeStore.isDarkTheme) {
    return '/music/cover/phonograph.png'
  }
  return musicStore.currentSong.cover || '/music/cover/music.png'
})

const dividerImage = computed(() => {
  return themeStore.isDarkTheme ? '/Icon/line-w.png' : '/Icon/line-b.png'
})

const playModeIcon = computed(() => {
  switch (musicStore.playMode) {
    case 'sequence': return 'mdi:repeat'
    case 'loop': return 'mdi:repeat-once'
    case 'random': return 'mdi:shuffle'
    default: return 'mdi:repeat'
  }
})

const playModeTitle = computed(() => {
  switch (musicStore.playMode) {
    case 'sequence': return '顺序播放'
    case 'loop': return '单曲循环'
    case 'random': return '随机播放'
    default: return '顺序播放'
  }
})

// 方法
const handlePlayClick = () => {
  musicStore.togglePlay()
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const handleProgressClick = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  musicStore.setProgress(percent * 100)
}

const handleVolumeChange = () => {
  musicStore.setVolume(Number(volume.value))
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
  handleVolumeChange()
}

const checkMarquee = () => {
  const titleEl = document.querySelector('.song-name')
  const artistEl = document.querySelector('.artist-name')
  
  if (titleEl) {
    shouldMarquee.value = titleEl.scrollWidth > (titleEl.parentElement?.clientWidth || 0)
  }
  if (artistEl) {
    shouldMarqueeArtist.value = artistEl.scrollWidth > (artistEl.parentElement?.clientWidth || 0)
  }
}

const switchText = () => {
  const nextIndex = (currentTextIndex.value + 1) % textPool.length
  currentTextIndex.value = nextIndex
  
  const titleDynamic = document.querySelector('.title-dynamic')
  if (titleDynamic) {
    titleDynamic.classList.add('fade-out')
    
    setTimeout(() => {
      currentText.value = textPool[nextIndex]
      titleDynamic.classList.remove('fade-out')
      titleDynamic.classList.add('fade-in')
      
      setTimeout(() => {
        titleDynamic.classList.remove('fade-in')
      }, 500)
    }, 500)
  }
}

const togglePlayMode = () => {
  const modes = ['sequence', 'loop', 'random'] as const
  const currentIndex = modes.indexOf(musicStore.playMode)
  const nextIndex = (currentIndex + 1) % modes.length
  const nextMode = modes[nextIndex]
  
  musicStore.setPlayMode(nextMode)
  
  const modeMessages = {
    sequence: '顺序播放',
    loop: '单曲循环',
    random: '随机播放'
  }
  
  toastMessage.value = modeMessages[nextMode]
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const toggleMusicList = () => {
  showMusicList.value = !showMusicList.value
}

const startDragging = (e: MouseEvent) => {
  isDragging.value = true
  handleDragging(e)
}

const handleDragging = (e: MouseEvent) => {
  if (!isDragging.value) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  musicStore.setProgress(percent)
}

const stopDragging = () => {
  isDragging.value = false
}

// 监听和生命周期钩子
watch(() => musicStore.currentSong, () => {
  setTimeout(checkMarquee, 100)
  musicStore.setVolume(volume.value)
}, { immediate: true })

onMounted(() => {
  checkMarquee()
  window.addEventListener('resize', checkMarquee)
  setInterval(switchText, 5000)
})
</script>

<style scoped>
/* 这里是从 Home.vue 复制的所有音乐播放器相关样式 */
.music-container {
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 30px;
  width: calc(100% - 40px);
  margin-left: -0px;
}

/* 音乐播放器样式 */
.music-player {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(135, 206, 235, 0.1);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.music-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.music-cover {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.music-details {
  flex: 1;
}

.song-name {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.artist-name {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(135, 206, 235, 0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: height 0.3s ease;
}

.progress-bar:hover {
  height: 8px;
}

.progress {
  height: 100%;
  background: #87CEEB;
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #87CEEB;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.4);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.progress-handle:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 15px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(135, 206, 235, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.play-btn {
  width: 50px;
  height: 50px;
  background: rgba(135, 206, 235, 0.2);
  border-radius: 50%;
}

/* 按钮悬停效果 */
.control-btn:hover {
  background: rgba(135, 206, 235, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(135, 206, 235, 0.2);
}

/* 暗色主题适配 */
.dark-theme .control-btn {
  background: rgba(135, 206, 235, 0.15);
  border: 1px solid rgba(135, 206, 235, 0.2);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .play-btn {
  background: rgba(135, 206, 235, 0.25);
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.2),
    inset 0 0 5px rgba(135, 206, 235, 0.1);
}

/* 按钮悬停效果 */
.dark-theme .control-btn:hover {
  background: rgba(135, 206, 235, 0.3);
  transform: translateY(-2px);
  box-shadow: 
    0 5px 15px rgba(135, 206, 235, 0.3),
    inset 0 0 8px rgba(135, 206, 235, 0.2);
  color: #87CEEB;
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.8),
    0 0 20px rgba(135, 206, 235, 0.4);
}

/* 进度条样式优化 */
.dark-theme .progress-bar {
  background: rgba(135, 206, 235, 0.2);
}

.dark-theme .progress,
.dark-theme .progress-handle {
  background: #87CEEB;
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.6),
    0 0 5px rgba(135, 206, 235, 0.3);
}

/* 音量控制样式优化 */
.dark-theme .volume-slider {
  background: rgba(135, 206, 235, 0.15);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark-theme .volume-slider::-webkit-slider-thumb {
  background: #87CEEB;
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.4),
    0 0 5px rgba(135, 206, 235, 0.2);
}

.dark-theme .volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 
    0 0 15px rgba(135, 206, 235, 0.6),
    0 0 8px rgba(135, 206, 235, 0.3);
}

/* 图标样式 */
.control-btn .iconify {
  font-size: 1.5rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.play-btn .iconify {
  font-size: 1.8rem;
}

.control-btn:hover .iconify {
  color: #87CEEB;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .control-buttons {
    gap: 20px;
  }

  .control-btn {
    width: 35px;
    height: 35px;
  }

  .play-btn {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 480px) {
  .control-buttons {
    gap: 15px;
  }

  .control-btn {
    width: 32px;
    height: 32px;
  }

  .play-btn {
    width: 40px;
    height: 40px;
  }
}

/* 添加音乐播放器容器样式 */
.music-container {
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 30px;
  width: calc(100% - 40px);
  margin-left: -0px;
}

/* 音乐播放器样式 */
.music-player {
  grid-column: 1 / -1;
  width: 100%;
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
  border-radius: 12px;
  padding: 20px;
}

/* 左右布局容器 */
.content-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 30px;
}

/* 响应式布局调整 */
@media (max-width: 1024px) {
  .music-container,
  .content-layout {
    grid-template-columns: 250px minmax(0, 1fr);
  }
  
  .music-player {
    width: calc(100% - 0px);
  }
}

@media (max-width: 768px) {
  .music-container,
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .music-container {
    width: 100%;
    margin-left: 0;
  }
  
  /* 移动端音乐播放器样式调整 */
  .music-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
  
  .music-cover {
    width: 120px;
    height: 120px;
  }
  
  .control-buttons {
    gap: 20px;
  }
  
  .play-btn {
    width: 50px;
    height: 50px;
  }
  
  .sidebar {
    order: 2;
  }

  .music-player {
    width: calc(100% - 40px);
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .music-cover {
    width: 100px;
    height: 100px;
  }
  
  .control-buttons {
    gap: 15px;
  }
  
  .play-btn {
    width: 45px;
    height: 45px;
  }
  
  .music-player {
    padding: 15px;
  }
}

/* 滚动文本容器 */
.marquee-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  padding-right: 50px;
}

.marquee-animation {
  animation: marquee 15s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* 进度条容器 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 0.8rem;
  color: var(--text-primary);
  opacity: 0.8;
  min-width: 45px;
}

/* 音量控制 */
.controls-volume {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.volume-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.volume-btn:hover {
  color: #87CEEB;
}

.volume-slider {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(135, 206, 235, 0.2);
  outline: none;
  transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #87CEEB;
  cursor: pointer;
  transition: all 0.3s ease;
}

.volume-slider:hover::-webkit-slider-thumb {
  transform: scale(1.2);
}

/* 暗色主题适配 */
.dark-theme .volume-slider {
  background: rgba(135, 206, 235, 0.15);
}

/* 亮色主题适配 */
@media (prefers-color-scheme: light) {
  .music-player {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(135, 206, 235, 0.3);
    color: var(--text-primary);
  }

  .song-name {
    color: var(--text-primary);
    text-shadow: none;
  }

  .artist-name,
  .time {
    color: rgba(0, 0, 0, 0.6);
  }

  .volume-icon {
    color: var(--text-primary);
  }
}

/* 暗色主题强制覆盖 */
.dark-theme .music-player {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(135, 206, 235, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .song-name {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .artist-name,
.dark-theme .time {
  color: rgba(255, 255, 255, 0.7);
}

.dark-theme .volume-icon {
  color: rgba(255, 255, 255, 0.8);
}

/* 可以添加封面切换过渡效果 */
.music-cover {
  transition: all 0.3s ease;
}

/* 添加标题和分隔线样式 */
.player-header {
  margin-bottom: 15px;
}

.player-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-separator {
  opacity: 0.5;
}

.title-dynamic {
  color: #87CEEB;
  min-width: 120px;
  text-align: center;
  position: relative;
  transition: opacity 0.5s ease;
}

.title-status {
  color: var(--text-primary);
  opacity: 0.8;
}

/* 添加淡入淡出动画 */
.fade-out {
  opacity: 0;
}

.fade-in {
  opacity: 1;
}

/* 暗色主题适配 */
.dark-theme .title-dynamic {
  color: #87CEEB;
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.3);
}

.dark-theme .title-status {
  color: rgba(255, 255, 255, 0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .player-title {
    font-size: 0.9rem;
    gap: 6px;
  }
  
  .title-dynamic {
    min-width: 100px;
  }
}

/* 修改分隔线样式 */
.player-divider {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.divider-image {
  width: 100%;
  height: 20px;
  object-fit: fill;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

/* 暗色主题适配 */
.dark-theme .divider-image {
  opacity: 0.6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .player-divider {
    height: 15px;
    margin: 8px 0;
  }
  
  .divider-image {
    height: 15px;
  }
}

/* 播放模式和列表按钮样式 */
.extra-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-btn, .list-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.mode-btn:hover, .list-btn:hover {
  opacity: 1;
  color: #87CEEB;
}

/* 音乐列表弹出层样式 */
.music-list-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 350px; /* 设置合适的宽度 */
  background: rgba(0, 0, 0, 0.00001);
  backdrop-filter: blur(5px);
  z-index: 10001;
}

.music-list-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.0001);
}

.list-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.list-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.close-btn {
  position: absolute;
  left: -16px; /* 调整位置到左边 */
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(135, 206, 235, 0.1);
  color: #87CEEB;
  transform: translateY(-50%) scale(1.1);
}

.list-content {
  max-height: calc(70vh - 70px);
  overflow-y: auto;
  padding: 10px 0;
}

.list-item {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover {
  background: rgba(135, 206, 235, 0.1);
}

.list-item.active {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.05);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-size: 0.95rem;
  font-weight: 500;
}

.song-artist {
  font-size: 0.85rem;
  opacity: 0.7;
}

.playing-icon {
  color: #87CEEB;
  animation: pulse 2s infinite;
}

/* 滑入动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 暗色主题适配 */
.dark-theme .music-list-container {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(135, 206, 235, 0.1);
}

.dark-theme .list-item:hover {
  background: rgba(135, 206, 235, 0.15);
}

.dark-theme .list-item.active {
  background: rgba(135, 206, 235, 0.1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .music-list-overlay {
    width: 100%;
  }
}

/* 添加提示组件 */
.mode-toast {
  position: fixed;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(135, 206, 235, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  padding: 10px 24px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  border: 1px solid rgba(135, 206, 235, 0.3);
  box-shadow: 
    0 4px 15px rgba(135, 206, 235, 0.2),
    0 0 10px rgba(135, 206, 235, 0.1);
  font-size: 14px;
  letter-spacing: 1px;
}

.mode-toast.show {
  opacity: 1;
  transform: translate(-50%, -10px);
}

/* 暗色主题适配 */
.dark-theme .mode-toast {
  background: rgba(30, 30, 30, 0.9);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(135, 206, 235, 0.1);
}

/* 最新树洞样式 */
.latest-whispers {
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.whispers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.whisper-item {
  background: rgba(135, 206, 235, 0.05);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(135, 206, 235, 0.1);
  backdrop-filter: blur(5px);
}

.whisper-item.new::before {
  content: 'New';
  position: absolute;
  top: 8px;
  right: 8px;
  background: #87CEEB;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.3);
}

.whisper-item:hover {
  transform: translateY(-2px);
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 12px rgba(135, 206, 235, 0.1),
    0 0 8px rgba(135, 206, 235, 0.05);
}

.whisper-content {
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 8px;
}

.whisper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.8;
}

.whisper-stats {
  display: flex;
  gap: 12px;
}

.whisper-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.whisper-stats .stat:hover {
  color: #87CEEB;
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.4);
}

/* 暗色主题适配 */
.dark-theme .latest-whispers {
  background: var(--card-bg-dark);
  border: var(--card-border-dark);
  box-shadow: var(--card-shadow-dark);
}

.dark-theme .whisper-item {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(135, 206, 235, 0.1);
}

.dark-theme .whisper-item:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(135, 206, 235, 0.1);
}

/* 其他样式代码... */
/* 从 Home.vue 复制所有音乐播放器相关的样式代码到这里 */
</style> 