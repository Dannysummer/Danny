<template>
  <div class="start-page" :class="{ 'search-focused': isSearchFocused }" :style="{ '--bg-image': `url(${backgroundImage})` }">
    <!-- 使用 ParticlesBackground 组件 -->
    <ParticlesBackground v-if="wallpaperSettings.showParticles" />
    <!-- 模糊遮罩 -->
    <div class="blur-overlay"></div>
          <!-- 在搜索框上方添加问候语 -->
    <Transition name="greeting">
      <div v-if="showGreeting" class="greeting-text">
        {{ greeting }}
      </div>
    </Transition>

    <div class="search-container" :class="{ 'focused': isSearchFocused }">       
      <!-- 时钟和日历 -->
      <div class="datetime-container" v-if="showDateTime" @click="showSettings = true">
        <div class="time">
          {{ currentTime.slice(0, 2) }}
          <span class="colon">:</span>
          {{ currentTime.slice(2, 4) }}
          <template v-if="timeSettings.showSeconds">
            <span class="colon">:</span>
            {{ currentTime.slice(4, 6) }}
          </template>
          <span class="period">{{ currentPeriod }}</span>
        </div>
        <div class="date">
          <div class="lunar-date" v-if="showLunarDate">{{ lunarDate }}</div>
          <div class="solar-date">{{ solarDate }}</div>
          <div class="weather-info" v-if="showWeatherInfo">
            <Icon :icon="getWeatherIcon(weather.icon)" class="weather-icon" />
            <span class="temperature">{{ weather.temperature }}°C</span>
            <span class="weather-text">{{ weather.text }}</span>
            <span v-if="weather.warning" class="weather-warning">
              <Icon icon="mdi:weather-lightning" class="warning-icon" />
              {{ weather.warning }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <div class="search-icon">
          <svg viewBox="0 0 1024 1024" class="bing-logo">
            <path 
              d="M716.791024 639.892174c-36.210888-12.486513-67.302306-24.265457-99.018048-34.088181-32.797908-10.155697-54.690927-29.135197-66.594737-62.432565-19.062743-53.567141-41.163871-106.010496-61.974726-158.953312-7.53353-19.145987-10.197319-38.167108 6.492986-54.108223s35.378454-12.111918 54.108224-2.538925c56.106065 29.135197 112.711591 56.896878 168.359818 86.656401 155.831683 83.243421 191.459867 302.797942 69.716365 429.952267a169.566848 169.566848 0 0 1-26.304921 23.516267c-65.346085 44.576852-132.273795 86.698023-201.657187 124.86513-161.11764 88.279647-361.15158-20.810855-392.409484-198.577179a294.72333 294.72333 0 0 1-4.162171-51.694164q0.499461-340.257481 0.624326-680.514963A190.003107 190.003107 0 0 1 164.470929 39.124408c3.537845-31.008174 35.04548-49.238483 61.225536-33.130882 48.447671 29.717901 96.85372 59.935263 142.304627 93.981822 30.050875 22.475724 42.079549 56.9385 41.996306 95.729934q-0.332974 297.553607 0.624326 595.190457c0 9.198398-5.202714 22.059506 3.91244 26.887624 7.408664 3.912441 15.774628-6.368122 23.308158-10.821644q130.775414-77.249894 261.217854-155.082493c4.62001-2.788655 8.990289-6.160013 17.730848-11.987052z" 
              fill="currentColor"
            />
          </svg>
        </div>
        <input 
          type="text" 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          placeholder=""
          ref="searchInput"
        >
        <button class="search-btn" @click="handleSearch">
          <Icon icon="material-symbols:search" />
        </button>
      </div>

      <!-- 搜索建议 -->
      <div class="suggestions" v-if="showSuggestions && suggestions.length > 0">
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion"
          class="suggestion-item"
          @mousedown="handleSuggestionClick(suggestion)"
        >
          <Icon icon="material-symbols:search" class="suggestion-icon" />
          <span>{{ suggestion }}</span>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div class="settings-modal" v-if="showSettings" @click.self="showSettings = false">
      <div class="settings-content">
        <div class="settings-header">
          <h2 class="settings-title">设置</h2>
          <div class="header-actions">
            <button class="reset-btn" @click="resetSettings">
              <Icon icon="material-symbols:restore" />
              <span>重置</span>
            </button>
            <button class="close-btn" @click="showSettings = false">
              <Icon icon="material-symbols:close" />
            </button>
          </div>
        </div>
        <div class="settings-body-wrapper">
          <div class="settings-body">
            <!-- 分类标题 -->
            <div class="settings-group">
              <div class="settings-category">壁纸</div>
              <div class="settings-section">
                <div class="settings-desc">刷新页面后生效</div>
                <div class="wallpaper-options">
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'startBg' }"
                    @click="wallpaperSettings.type = 'startBg'"
                  >站长推荐</div>
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'bing' }"
                    @click="wallpaperSettings.type = 'bing'"
                  >每日必应</div>
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'landscape' }"
                    @click="wallpaperSettings.type = 'landscape'"
                  >随机风景</div>
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'anime' }"
                    @click="wallpaperSettings.type = 'anime'"
                  >随机动漫</div>
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'cover' }"
                    @click="wallpaperSettings.type = 'cover'"
                  >随机封面</div>
                  <div 
                    class="option"
                    :class="{ active: wallpaperSettings.type === 'website' }"
                    @click="wallpaperSettings.type = 'website'"
                  >网站首页</div>
                </div>
                <div class="settings-row">
                  <span>粒子特效</span>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox"
                      v-model="wallpaperSettings.showParticles"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <div class="settings-row">
                  <span>壁纸模糊</span>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model="wallpaperSettings.blur" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      class="range-slider"
                    >
                    <span class="slider-value">{{ Math.round(wallpaperSettings.blur * 10) }}px</span>
                  </div>
                </div>
                <div class="settings-row">
                  <span>壁纸变更</span>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox"
                      v-model="wallpaperSettings.autoChange"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <div class="settings-category">搜索</div>
              <div class="settings-section">
                <div class="search-options">
                  <div class="settings-row">
                    <span>搜索建议</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="searchSettings.suggestions">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <span>新标签页打开</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="searchSettings.newTab">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <div class="settings-category">时间</div>
              <div class="settings-section">
                <div class="settings-group">
                  <div class="group-title">显示选项</div>
                  <div class="settings-row">
                    <span>时钟显示</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="timeSettings.showClock">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <span>农历显示</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="timeSettings.showLunar">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <span>天气显示</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="timeSettings.showWeather">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div class="settings-group">
                  <div class="group-title">时间格式</div>
                  <div class="settings-row">
                    <span>显示秒数</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="timeSettings.showSeconds">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <span>12小时制</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="timeSettings.use12Hour">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快速链接 -->
            <div class="settings-group">
              <div class="settings-category">快速链接</div>
              <div class="settings-section">
                <div class="settings-row">
                  <span>显示数量</span>
                  <div class="slider-container">
                    <input 
                      type="range" 
                      v-model="quickLinkSettings.displayCount" 
                      min="1" 
                      max="7" 
                      step="1"
                      class="range-slider"
                    >
                    <span class="slider-value">{{ quickLinkSettings.displayCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速链接 -->
    <div class="quick-links" :class="{ 'collapsed': isCollapsed }">
      <div class="quick-links-toggle" @click="toggleQuickLinks">
        <Icon :icon="isCollapsed ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'" />
      </div>
      <transition name="slide-fade">
        <div class="quick-links-content" v-show="!isCollapsed">
          <div class="quick-links-wrapper">
            <a 
              v-for="link in visibleQuickLinks" 
              :key="link.url"
              :href="link.url"
              target="_blank"
              class="quick-link"
            >
              <Icon :icon="link.icon" />
              <span>{{ link.name }}</span>
            </a>
          </div>
          <button class="more-btn" @click="showMoreLinks = true">
            <Icon icon="material-symbols:apps" />
            <span>更多</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- 在 quick-links 后面添加备案信息 -->
    <div class="beian-info">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">
        本网站由 DANSELA 强力支持 浙ICP备20250126Z6号-1
      </a>
    </div>

    <!-- 添加更多链接弹窗 -->
    <div class="more-links-modal" v-if="showMoreLinks" @click.self="showMoreLinks = false">
      <div class="more-links-content">
        <div class="more-links-header">
          <h3 class="more-Links-title">快速链接</h3>
          <button class="close-btn" @click="showMoreLinks = false">
            <Icon icon="material-symbols:close" />
          </button>
        </div>
        
        <div class="more-links-body">
          <div v-for="[category, links] in currentCategories" :key="category" class="link-category">
            <div class="category-title">{{ category }}</div>
            <div class="category-links">
              <a v-for="link in links" 
                 :key="link.url" 
                 :href="link.url" 
                 target="_blank"
                 class="quick-link"
              >
                <Icon :icon="link.icon" />
                <span>{{ link.name }}</span>
              </a>
            </div>
          </div>
        </div>
        
        <div class="pagination-dots" v-if="totalPages > 1">
          <span v-for="i in totalPages" 
                :key="i" 
                class="dot"
                :class="{ active: i - 1 === currentPage }"
                @click="currentPage = i - 1"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch} from 'vue'
import { Icon } from '@iconify/vue'
import ParticlesBackground from '../components/ParticlesBackground.vue'

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const suggestions = ref<string[]>([])
const showSuggestions = ref(false)
const isLoading = ref(false)

// 时间和日期状态
const currentTime = ref('')
const solarDate = ref('')
const lunarDate = ref('')
const currentPeriod = ref('')
let timer: number

// 随机选择背景图片
const randomBgNumber = computed(() => Math.floor(Math.random() * 9) + 1)
const backgroundImage = computed(() => {
  switch (wallpaperSettings.value.type) {
    case 'startBg':
      return `/background/startBg/start-bg${randomBgNumber.value}.png`
    case 'bing':
      return `url(https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN)`
    case 'landscape':
      return `/background/landscape/bg${Math.floor(Math.random() * 9) + 1}.jpg`
    case 'anime':
      return `/background/anime/bg${Math.floor(Math.random() * 9) + 1}.jpg`
    case 'cover':
      return `/background/cover/bg${Math.floor(Math.random() * 9) + 1}.jpg`
    case 'website':
      return `/background/website/bg${Math.floor(Math.random() * 9) + 1}.jpg`
    default:
      return `/background/startBg/start-bg1.png`
  }
})

// 获取搜索建议
const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    suggestions.value = []
    return
  }
  
  try {
    isLoading.value = true
    const response = await fetch(
      `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(query)}`
    )
    const data = await response.json()
    suggestions.value = data.AS.Results?.[0]?.Suggests?.map((s: any) => s.Txt) || []
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

// 监听输入变化
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    fetchSuggestions(newQuery)
  } else {
    suggestions.value = []
  }
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery.value)}`
    if (searchSettings.value.newTab) {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
    showSuggestions.value = false
  }
}

const handleSuggestionClick = (suggestion: string) => {
  searchQuery.value = suggestion
  handleSearch()
}

const handleSearchFocus = () => {
  isSearchFocused.value = true
  showSuggestions.value = true
  isCollapsed.value = true // 收起快速链接
}

const handleSearchBlur = () => {
  isSearchFocused.value = false
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 更新时间
const updateDateTime = () => {
  const now = new Date()
  let hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  // 根据设置决定是否使用12小时制
  if (timeSettings.value.use12Hour) {
    const isPM = hours >= 12
    hours = hours % 12 || 12
    currentPeriod.value = isPM ? 'PM' : 'AM'
  } else {
    hours = hours
    currentPeriod.value = ''
  }
  
  // 格式化时间
  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')
  
  currentTime.value = timeSettings.value.showSeconds
    ? `${formattedHours}${formattedMinutes}${formattedSeconds}`
    : `${formattedHours}${formattedMinutes}`
  
  // 更新阳历日期
  const month = now.getMonth() + 1
  const date = now.getDate()
  const day = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  solarDate.value = `${month}月${date}日 ${day}`
  
  // 这里可以添加农历转换逻辑
  lunarDate.value = '甲辰年 十二月二十'
}

interface WeatherInfo {
  temperature: number
  text: string
  icon: string
  warning?: string
}

const weather = ref<WeatherInfo>({
  temperature: 0,
  text: '加载中...',
  icon: 'sunny'
})

// 获取天气信息
const fetchWeather = async () => {
  try {
    // 这里需要替换为你的高德 API Key
    const key = 'your_amap_key'
    const city = '440300' // 深圳市的城市编码
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}&extensions=all`
    )
    const data = await response.json()
    if (data.status === '1' && data.lives?.[0]) {
      const live = data.lives[0]
      weather.value = {
        temperature: parseInt(live.temperature),
        text: live.weather,
        icon: getWeatherType(live.weather),
        warning: live.warning || ''
      }
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error)
  }
}

// 天气图标映射
const getWeatherIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    sunny: 'material-symbols:sunny',
    cloudy: 'material-symbols:cloud',
    rainy: 'material-symbols:rainy',
    snowy: 'material-symbols:weather-snowy',
    thunder: 'material-symbols:thunderstorm',
    foggy: 'material-symbols:foggy'
  }
  return iconMap[type] || 'material-symbols:sunny'
}

// 将中文天气描述转换为图标类型
const getWeatherType = (text: string): string => {
  if (text.includes('晴')) return 'sunny'
  if (text.includes('云') || text.includes('阴')) return 'cloudy'
  if (text.includes('雨')) return 'rainy'
  if (text.includes('雪')) return 'snowy'
  if (text.includes('雷')) return 'thunder'
  if (text.includes('雾')) return 'foggy'
  return 'sunny'
}

const showSettings = ref(false)
const searchSettings = ref({
  suggestions: true,
  newTab: true
})

interface WallpaperSettings {
  type: 'startBg' | 'bing' | 'landscape' | 'anime' | 'cover' | 'website'
  blur: number
  autoChange: boolean
  showParticles: boolean
}

const wallpaperSettings = ref<WallpaperSettings>({
  type: 'startBg',
  blur: 0.8,
  autoChange: true,
  showParticles: true
})

interface TimeSettings {
  showClock: boolean
  showLunar: boolean
  showWeather: boolean
  showSeconds: boolean
  use12Hour: boolean
}

const timeSettings = ref<TimeSettings>({
  showClock: true,
  showLunar: true,
  showWeather: true,
  showSeconds: false,
  use12Hour: true
})

// 计算属性
const showDateTime = computed(() => timeSettings.value.showClock)
const showLunarDate = computed(() => timeSettings.value.showLunar)
const showWeatherInfo = computed(() => timeSettings.value.showWeather)

interface QuickLink {
  name: string
  url: string
  icon: string
  category: string
}

interface QuickLinkSettings {
  displayCount: number
}

const quickLinks = ref<QuickLink[]>([
  { name: 'Gitee', url: 'https://gitee.com', icon: 'simple-icons:gitee', category: '开发' },
  { name: 'Github', url: 'https://github.com', icon: 'mdi:github', category: '开发' },
  { name: '掘金', url: 'https://juejin.cn', icon: 'simple-icons:juejin', category: '开发' },
  { name: '知乎', url: 'https://www.zhihu.com', icon: 'simple-icons:zhihu', category: '社区' },
  { name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'simple-icons:bilibili', category: '娱乐' },
  { name: '美食博客', url: '#', icon: 'material-symbols:restaurant', category: '生活' },
  // ... 可以添加更多链接
])

const quickLinkSettings = ref<QuickLinkSettings>({
  displayCount: 3
})

const isCollapsed = ref(false)

const visibleQuickLinks = computed(() => {
  // 不再包含更多按钮，直接返回前 N 个链接
  return quickLinks.value
    .filter(link => link.name !== '更多')
    .slice(0, quickLinkSettings.value.displayCount)
})

const toggleQuickLinks = () => {
  isCollapsed.value = !isCollapsed.value
}

// 添加搜索框焦点状态
const isSearchFocused = ref(false)

// 添加弹窗状态
const showMoreLinks = ref(false)
const currentPage = ref(0)
const itemsPerPage = 6

// 计算分类后的链接
const categorizedLinks = computed(() => {
  const categories: Record<string, QuickLink[]> = {}
  quickLinks.value.forEach(link => {
    if (!categories[link.category]) {
      categories[link.category] = []
    }
    categories[link.category].push(link)
  })
  return categories
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(Object.keys(categorizedLinks.value).length / itemsPerPage)
})

// 获取当前页的分类
const currentCategories = computed(() => {
  const categories = Object.entries(categorizedLinks.value)
  return categories.slice(currentPage.value * itemsPerPage, (currentPage.value + 1) * itemsPerPage)
})

// 定义设置的类型
interface Settings {
  wallpaper: WallpaperSettings;
  search: {
    suggestions: boolean;
    newTab: boolean;
  };
  time: TimeSettings;
  quickLink: QuickLinkSettings;
}

// 从 localStorage 读取设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('startPageSettings')
    if (savedSettings) {
      const settings: Settings = JSON.parse(savedSettings)
      wallpaperSettings.value = settings.wallpaper
      searchSettings.value = settings.search
      timeSettings.value = settings.time
      quickLinkSettings.value = settings.quickLink
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

// 保存设置到 localStorage
const saveSettings = () => {
  try {
    const settings: Settings = {
      wallpaper: wallpaperSettings.value,
      search: searchSettings.value,
      time: timeSettings.value,
      quickLink: quickLinkSettings.value
    }
    localStorage.setItem('startPageSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// 监听设置变化并保存
watch([wallpaperSettings, searchSettings, timeSettings, quickLinkSettings], () => {
  saveSettings()
}, { deep: true })

// 修改问候语的显示逻辑
const showGreeting = ref(false)

onMounted(() => {
  loadSettings()
  updateDateTime()
  timer = window.setInterval(updateDateTime, 1000)
  fetchWeather()
  setInterval(fetchWeather, 30 * 60 * 1000)
  searchInput.value?.focus()
  
  // 延迟3秒显示问候语
  setTimeout(() => {
    showGreeting.value = true
  }, 1000)
  
  // 显示5秒后隐藏
  setTimeout(() => {
    showGreeting.value = false
  }, 7000)  // 3000 + 5000
})

// 可以添加一个重置设置的功能
const resetSettings = () => {
  wallpaperSettings.value = {
    type: 'startBg',
    blur: 0.8,
    autoChange: true,
    showParticles: true
  }
  searchSettings.value = {
    suggestions: true,
    newTab: true
  }
  timeSettings.value = {
    showClock: true,
    showLunar: true,
    showWeather: true,
    showSeconds: false,
    use12Hour: true
  }
  quickLinkSettings.value = {
    displayCount: 3
  }
  saveSettings()
}

// 监听壁纸模糊度滑块
watch(() => wallpaperSettings.value.blur, (newValue) => {
  if (!isSearchFocused.value) {
    document.documentElement.style.setProperty('--blur-value', newValue.toString());
  }
}, { immediate: true })

// 监听快速链接显示数量滑块
watch(() => quickLinkSettings.value.displayCount, (newValue) => {
  const percentage = ((newValue - 1) / 6).toString();
  document.documentElement.style.setProperty('--link-value', percentage);
}, { immediate: true })

// 添加问候语相关逻辑
const getGreeting = () => {
  const hour = new Date().getHours()
  let timeGreeting = ''
  let extraMessages: string[] = []  // 声明为字符串数组类型

  if (hour >= 5 && hour < 11) {
    timeGreeting = '早上好'
    extraMessages = [
      '记得喝一杯充满魔力的卡布奇诺丫！',
      '今天也要元气满满呢~',
      '清晨的阳光最适合看书啦！',
      '要记得吃早餐哦，这是一天活力的来源！'
    ]
  } else if (hour >= 11 && hour < 14) {
    timeGreeting = '中午好'
    extraMessages = [
      '午餐时间到啦，不要忘记补充能量哦！',
      '稍微休息一下吧，我会为主人护航的~',
      '来杯下午茶怎么样？我可以为主人服务！',
      '阳光正好，不如来晒晒太阳吧~'
    ]
  } else if (hour >= 14 && hour < 18) {
    timeGreeting = '下午好'
    extraMessages = [
      '下午也要保持干劲哦！',
      '来块小蛋糕补充一下能量吧~',
      '记得适当休息，保护好眼睛呢！',
      '让我们一起加油吧！'
    ]
  } else if (hour >= 18 && hour < 24) {
    timeGreeting = '晚上好'
    extraMessages = [
      '今天也辛苦啦，好好放松一下吧！',
      '要记得早点休息哦~',
      '晚安，愿主人有个好梦呢~',
      '夜深了，注意保暖哦！'
    ]
  } else {
    timeGreeting = '夜深了'
    extraMessages = [
      '主人还没休息吗？要注意身体哦~',
      '熬夜会变丑的，快去睡觉吧！',
      '让我为主人唱首摇篮曲吧~',
      '明天还要元气满满呢，早点休息吧！'
    ]
  }

  // 随机选择一条消息
  const randomMessage = extraMessages[Math.floor(Math.random() * extraMessages.length)]
  return `主人${timeGreeting}！${randomMessage}`
}

// 添加问候语的响应式引用
const greeting = ref(getGreeting())
</script>

<style scoped>
/* 修改滚动条相关样式 */
.settings-body-wrapper,
.quick-links-content,
.more-links-content,
.settings-content {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-y: auto !important;  /* 允许垂直滚动 */
}

.settings-body-wrapper::-webkit-scrollbar,
.quick-links-content::-webkit-scrollbar,
.more-links-content::-webkit-scrollbar,
.settings-content::-webkit-scrollbar {
  display: none;
}

/* 移除之前的全局滚动控制 */
html, 
body, 
.start-page,
.settings-modal,
.settings-body-wrapper,
.quick-links-content,
.more-links-content,
.settings-content {
  margin: 0;
  padding: 0;
}

/* 只在起始页禁用滚动 */
.start-page {
  overflow: hidden !important;
}

/* 允许设置模态框的内容滚动 */
.settings-modal {
  overflow: auto;
}

@font-face {
  font-family: 'TsukuARdGothic';
  src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.start-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 使用伪元素来处理背景图片 */
.start-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

/* 搜索框获得焦点时放大背景 */
.start-page.search-focused::after {
  transform: scale(1.2);
}

/* 遮罩层样式 */
.start-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 10px;
  max-width: 700px;
  width: 90%;
  margin-bottom: 100px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-container.focused {
  transform: translateY(-20px);
}

.logo {
  margin-bottom: 20px;
}

.bing-logo {
  width: 120px;
  height: 120px;
  color: var(--text-primary);
  transition: color 0.3s ease;
  z-index: 3;
}

.bing-logo:hover {
  color: #53ceff;
}

.search-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.focused .search-box {
  transform: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
}

.search-icon .bing-logo {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  font-size: 1.1rem;
  border: 1px solid rgba(var(--text-primary-rgb), 0.1);
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.247);
  color: #ffffff;
  backdrop-filter: blur(10px);
  text-align: left;
}

.search-box input:focus {
  outline: none;
  border-color: #87CEEB;
  box-shadow: 0 0 15px rgba(135, 206, 235, 0.2);
}

.search-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 10px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  color: #87CEEB;
  transform: translateY(-50%) scale(1.1);
}

:root[class='dark-theme'] .search-box input {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

:root[class='dark-theme'] .search-box input:focus {
  border-color: #87CEEB;
  box-shadow: 0 0 20px rgba(135, 206, 235, 0.3);
}

@media (max-width: 768px) {
  .search-container {
    width: 95%;
  }
  
  .bing-logo {
    width: 100px;
  }
  
  .search-box input {
    font-size: 1rem;
    padding: 12px 18px;
  }
}

.search-box:hover .search-icon .bing-logo {
  color: #87CEEB;
  opacity: 1;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 10;
  overflow: hidden;
}

.suggestion-item {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(135, 206, 235, 0.1);
}

.suggestion-icon {
  opacity: 0.5;
  font-size: 1.1rem;
}

:root[class='dark-theme'] .suggestions {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:root[class='dark-theme'] .suggestion-item:hover {
  background: rgba(135, 206, 235, 0.2);
}

.search-box::after {
  content: "主人，上网吗？";
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  animation: breathe 2s ease-in-out infinite;
  transition: all 0.3s ease-out;
  opacity: 1;
  transform: translateY(0);
}

.search-box:focus-within::after {
  animation: hideText 0.3s ease-out forwards;
}

.search-box:not(:focus-within)::after {
  animation: showText 0.3s ease-out forwards;
}

@keyframes hideText {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

@keyframes showText {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.search-box input:focus::placeholder {
  opacity: 0;
}

.datetime-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  color: #ffffff;
  cursor: pointer;
}

.time {
  font-size: 4rem;
  font-weight: 200;
  letter-spacing: 2px;
  margin-bottom: 5px;
  font-family: 'TsukuARdGothic', sans-serif;
  display: flex;
  align-items: baseline;
  gap: 5px;
  transition: transform 0.3s ease;
  user-select: none;
}

.datetime-container:hover .time {
  transform: scale(1.2);
}

.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.lunar-date,
.solar-date {
  font-size: 1rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .time {
    font-size: 3rem;
  }
  
  .lunar-date,
  .solar-date {
    font-size: 0.9rem;
  }
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  font-size: 1rem;
}

.weather-icon {
  font-size: 1.5rem;
  color: #87CEEB;
}

.temperature {
  font-weight: 500;
}

.weather-text {
  opacity: 0.8;
}

.weather-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff6b6b;
}

.warning-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .time {
    font-size: 3rem;
  }
  
  .lunar-date,
  .solar-date,
  .weather-info {
    font-size: 0.9rem;
  }
  
  .weather-icon {
    font-size: 1.2rem;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.colon {
  animation: blink 1s ease-in-out infinite;
  margin: 0 5px;
  position: relative;
  top: -2px;
}

.period {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-left: 10px;
  font-weight: normal;
  letter-spacing: 1px;
  font-family: 'TsukuARdGothic', sans-serif;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.settings-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 720px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 5px;
  transition: transform 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.reset-btn [class^="iconify"] {
  font-size: 1.2rem;
}

.settings-body-wrapper {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  margin-right: -15px;
  padding-right: 15px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.settings-body-wrapper::-webkit-scrollbar {
  display: none;
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-category {
  font-size: 1.2rem;
  color: #fff;
  margin: 0 0 15px;
  padding-left: 15px;
  border-left: 3px solid #fff;
}

.settings-desc {
  font-size: 0.9rem;
  opacity: 0.6;
  margin-bottom: 10px;
}

.settings-section {
  margin-bottom: 20px;
}

.wallpaper-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.option {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.option:hover {
  background: rgba(135, 206, 235, 0.2);
}

.option.active {
  background: #87CEEB;
  color: #000;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.settings-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.settings-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.slider-container {
  flex: 1;
  margin-left: 20px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-slider {
  flex: 1;
  width: auto;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  position: relative;
  cursor: pointer;
}

.settings-group:first-child .range-slider {
  background: linear-gradient(
    to right,
    #87CEEB 0%,
    #87CEEB calc(100% * var(--blur-value)),
    rgba(255, 255, 255, 0.2) calc(100% * var(--blur-value)),
    rgba(255, 255, 255, 0.2) 100%
  );
}

.settings-group:last-child .range-slider {
  background: linear-gradient(
    to right,
    #87CEEB 0%,
    #87CEEB calc(100% * var(--link-value)),
    rgba(255, 255, 255, 0.2) calc(100% * var(--link-value)),
    rgba(255, 255, 255, 0.2) 100%
  );
}

.range-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: transparent;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #87CEEB;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: -6px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
  border-radius: 22px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #87CEEB;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.search-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(calc(var(--blur-value, 0.8) * 10px));
}

.search-focused .blur-overlay {
  backdrop-filter: blur(3px);
  background: rgba(0, 0, 0, 0.2);
}

.settings-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.group-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-group:hover {
  background: rgba(255, 255, 255, 0.08);
}

.quick-links {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  z-index: 10;
  width: auto;
  max-width: 80%;
}

.quick-links.collapsed {
  background: transparent;
}

.quick-links-toggle {
  cursor: pointer;
  margin-bottom: 10px;
  width: 60px;
  height: 20px;
  border-radius: 5px;
  background: rgba(0, 183, 255, 0.637);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.3;
  z-index: 10;
  transform: translateY(0);
}

.quick-links-toggle:hover,
.quick-links-toggle:active,
.quick-links.collapsed .quick-links-toggle {
  opacity: 1;
  transform: translateY(-2px);
}

.more-Links-title {
  color: #fff;
}

.quick-links-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
  width: fit-content;
  transform-origin: bottom center;
}

.quick-links-wrapper {
  display: flex;
  gap: 3px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
  width: 70px;
  min-width: 50px;
}

.quick-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.quick-link [class^="iconify"] {
  font-size: 24px;
}

.quick-link span {
  font-size: 12px;
  opacity: 0.8;
}

.slider-value {
  min-width: 45px;
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.more-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: white;
  background: none;
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 50px;
  min-width: 50px;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.more-btn [class^="iconify"] {
  font-size: 24px;
}

.more-btn span {
  font-size: 12px;
  opacity: 0.8;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.quick-links.collapsed .quick-links-toggle {
  transform: translateY(-10px);
}

.quick-links.collapsed .quick-links-toggle:hover {
  transform: translateY(-12px);
}

.search-box,
.search-container,
.blur-overlay,
.start-page::before {
  will-change: transform, backdrop-filter, background;
}

.beian-info {
  position: fixed;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9;
  text-align: center;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0);
  /* backdrop-filter: blur(5px); */
  border-radius: 5px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* .quick-links:not(.collapsed) ~ .beian-info {
  transform: translate(-50%, -50px);
} */

.beian-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s ease;
}

.beian-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* 添加弹窗相关样式 */
.more-links-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.more-links-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.more-links-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.link-category {
  margin-bottom: 30px;
}

.category-title {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #87CEEB;
}

.category-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
}

.pagination-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #87CEEB;
}

.dot:hover {
  transform: scale(1.2);
}

/* 修改问候语样式 */
.greeting-text {
  position: fixed;
  top: 80px;  /* 从30px改为80px，下移50px */
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  padding: 12px 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* 修改问候语动画 */
.greeting-enter-active {
  animation: greetingIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.greeting-leave-active {
  animation: greetingOut 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes greetingIn {
  from {
    transform: translate(-50%, -150%);  /* 从更高的位置开始 */
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes greetingOut {
  from {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -150%);  /* 消失时往上移动更多 */
    opacity: 0;
  }
}
</style> 