import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMusicStore = defineStore('music', () => {
  const audio = new Audio()
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const fadeInterval = ref<number | null>(null)
  const playMode = ref<'sequence' | 'loop' | 'random'>('sequence')
  
  // 淡入淡出的持续时间（毫秒）
  const FADE_DURATION = 500
  const FADE_STEPS = 20

  // 淡出效果
  const fadeOut = () => {
    return new Promise<void>((resolve) => {
      const initialVolume = audio.volume
      const decreaseAmount = initialVolume / FADE_STEPS
      let currentStep = 0

      fadeInterval.value = window.setInterval(() => {
        currentStep++
        const newVolume = initialVolume - (decreaseAmount * currentStep)
        
        if (currentStep >= FADE_STEPS || newVolume <= 0) {
          if (fadeInterval.value) clearInterval(fadeInterval.value)
          audio.volume = 0
          audio.pause()
          resolve()
        } else {
          audio.volume = newVolume
        }
      }, FADE_DURATION / FADE_STEPS)
    })
  }

  // 淡入效果
  const fadeIn = () => {
    return new Promise<void>((resolve) => {
      const targetVolume = 1
      const increaseAmount = targetVolume / FADE_STEPS
      let currentStep = 0
      
      audio.volume = 0
      audio.play()

      fadeInterval.value = window.setInterval(() => {
        currentStep++
        const newVolume = increaseAmount * currentStep

        if (currentStep >= FADE_STEPS || newVolume >= targetVolume) {
          if (fadeInterval.value) clearInterval(fadeInterval.value)
          audio.volume = targetVolume
          resolve()
        } else {
          audio.volume = newVolume
        }
      }, FADE_DURATION / FADE_STEPS)
    })
  }

  // 歌曲列表
  const playlist = [
    {
      title: 'eternal moment',
      artist: 'yutaka hirasaka',
      cover: '/music/cover/music.png',
      src: '/music/mp3/yutaka hirasaka - eternal moment.flac'
    },
    {
      title: 'Love Story',
      artist: 'Taylor Swift',
      cover: '/music/cover/music.png',
      src: '/music/mp3/Taylor Swift - Love Story.flac'
    },
    {
      title: '晴·间奏',
      artist: '汪苏泷',
      cover: '/music/cover/music.png',
      src: '/music/mp3/晴·间奏 汪苏泷.mp3'
    },
    {
      title: '那些我尚未知道的美丽',
      artist: '华晨宇',
      cover: '/music/cover/music.png',
      src: '/music/mp3/那些我尚未知道的美丽 - 华晨宇.mp3'
    }
    // 可以添加更多歌曲...
  ]
  
  const currentIndex = ref(0)
  const currentSong = ref(playlist[0])

  // 播放指定歌曲
  const playSong = (index: number) => {
    currentIndex.value = index
    currentSong.value = playlist[index]
    audio.src = currentSong.value.src
    audio.play()
    isPlaying.value = true
  }

  // 上一首
  const prevSong = () => {
    if (playlist.length === 0) return
    
    let prevIndex
    switch (playMode.value) {
      case 'sequence':
        prevIndex = currentIndex.value - 1
        if (prevIndex < 0) {
          prevIndex = playlist.length - 1
        }
        break
      case 'loop':
        prevIndex = currentIndex.value
        break
      case 'random':
        do {
          prevIndex = Math.floor(Math.random() * playlist.length)
        } while (prevIndex === currentIndex.value && playlist.length > 1)
        break
      default:
        prevIndex = currentIndex.value - 1 < 0 ? playlist.length - 1 : currentIndex.value - 1
    }
    
    playSong(prevIndex)
  }

  // 下一首
  const nextSong = () => {
    if (playlist.length === 0) return
    
    let nextIndex
    switch (playMode.value) {
      case 'sequence':
        nextIndex = (currentIndex.value + 1) % playlist.length
        break
      case 'loop':
        nextIndex = currentIndex.value
        break
      case 'random':
        do {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } while (nextIndex === currentIndex.value && playlist.length > 1)
        break
      default:
        nextIndex = (currentIndex.value + 1) % playlist.length
    }
    
    playSong(nextIndex)
  }

  // 更新进度
  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
  })

  // 加载音频时获取总时长
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })

  // 播放结束时重置状态
  audio.addEventListener('ended', () => {
    currentTime.value = 0
    
    switch (playMode.value) {
      case 'sequence':
        nextSong()
        break
        
      case 'loop':
        audio.currentTime = 0
        audio.play()
        isPlaying.value = true
        break
        
      case 'random':
        let nextIndex
        do {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } while (nextIndex === currentIndex.value && playlist.length > 1)
        playSong(nextIndex)
        break
    }
  })

  // 播放/暂停
  const togglePlay = async () => {
    if (!audio.src) {
      audio.src = currentSong.value.src
    }

    // 清除任何正在进行的淡入淡出效果
    if (fadeInterval.value) {
      clearInterval(fadeInterval.value)
      fadeInterval.value = null
    }
    
    if (isPlaying.value) {
      await fadeOut()
      isPlaying.value = false
    } else {
      isPlaying.value = true
      await fadeIn()
    }
  }

  // 设置进度
  const setProgress = (value: number) => {
    const time = (value / 100) * duration.value
    currentTime.value = time
    audio.currentTime = time
  }

  // 设置音量（保持当前的渐变比例）
  const setVolume = (value: number) => {
    const normalizedValue = value / 100
    if (isPlaying.value) {
      audio.volume = normalizedValue
    }
  }

  // 添加 action
  const setPlayMode = (mode: 'sequence' | 'loop' | 'random') => {
    playMode.value = mode
    audio.loop = mode === 'loop'
  }

  // 添加更新播放列表的方法
  const updatePlaylist = (newPlaylist: typeof playlist) => {
    // 找到当前播放歌曲在新列表中的索引
    const newIndex = newPlaylist.findIndex(song => song === currentSong.value)
    if (newIndex !== -1) {
      currentIndex.value = newIndex
    }
    // 更新播放列表
    playlist.splice(0, playlist.length, ...newPlaylist)
  }

  const updateCurrentIndex = (newIndex: number) => {
    currentIndex.value = newIndex
  }

  return {
    isPlaying,
    currentTime,
    duration,
    currentSong,
    playlist,
    currentIndex,
    togglePlay,
    setProgress,
    setVolume,
    prevSong,
    nextSong,
    playSong,
    playMode,
    setPlayMode,
    updatePlaylist,
    updateCurrentIndex
  }
}) 