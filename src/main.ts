import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/theme.css'
import './assets/styles/fonts.css'
import { createPinia } from 'pinia'
import type { Engine } from "tsparticles-engine"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useDark, useToggle } from '@vueuse/core'
import './styles/reset.css'

declare global {
  interface Window {
    tsParticles: Engine
  }
}

const isDark = useDark({
  // 配置选项
  selector: 'html',  // 应用暗色模式的元素选择器
  attribute: 'class', // 使用的属性
  valueDark: 'dark', // 暗色模式的值
  valueLight: 'light' // 亮色模式的值
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
