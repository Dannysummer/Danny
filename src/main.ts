// 添加global对象polyfill解决sockjs-client兼容性问题
window.global = window;

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/theme.css'
import './assets/styles/fonts.css'
import './assets/styles/config-based.css'
import './styles/markdown.css'
import { createPinia } from 'pinia'
import type { Engine } from "tsparticles-engine"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useDark } from '@vueuse/core'
import './styles/reset.css'
import './assets/styles/global.css'

declare global {
  interface Window {
    tsParticles: Engine
  }
}

export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light'
})

const pinia = createPinia()

// 统一使用App作为根组件
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
