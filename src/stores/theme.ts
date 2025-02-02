import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkTheme = ref(false)

  const initTheme = () => {
    // 从本地存储或系统偏好获取初始主题
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkTheme.value = savedTheme === 'dark'
    } else {
      // 如果没有保存的主题，则使用系统偏好
      isDarkTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  const toggleTheme = () => {
    console.log('切换主题前:', isDarkTheme.value)
    isDarkTheme.value = !isDarkTheme.value
    console.log('切换主题后:', isDarkTheme.value)
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
    applyTheme()
  }

  const applyTheme = () => {
    // 应用主题到 HTML 元素
    document.documentElement.classList.toggle('dark-theme', isDarkTheme.value)
  }

  return {
    isDarkTheme,
    initTheme,
    toggleTheme
  }
}) 