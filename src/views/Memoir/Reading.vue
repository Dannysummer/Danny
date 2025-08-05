<template>
  <div class="reading-container">
    <ParticlesBackground />
    
    <!-- 顶部横幅 -->
    <div class="banner">
      <div class="banner-background" 
           :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
                     url(${bannerImages[currentSlide]})` }">
        <div class="banner-content">
          <h1>DANNYの书屋</h1>
          <p class="banner-text1">一冊の本を開くとき、そこには無限の世界が広がっています。</p>
          <p class="banner-text2">(当你打开一本书时，无限的世界便在你面前展开。)</p>
        </div>
        <div class="banner-indicators">
          <span v-for="i in 4" :key="i" 
                :class="['indicator', { active: currentSlide === i-1 }]"
                @click="setSlide(i-1)">
          </span>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box">
        <Icon icon="mdi:magnify" class="search-icon" />
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="搜索书籍、作者或标签..."
          @input="handleSearch"
        />
      </div>
      <div class="filter-tags">
        <span 
          v-for="tag in tags" 
          :key="tag"
          :class="['tag', { active: selectedTags.includes(tag) }]"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Danny在读 -->
    <div class="current-reading">
      <Icon icon="mdi:book-open-page-variant-outline" />
      <span class="reading-message">{{ currentReading.message }}</span>
    </div>

    <!-- Danny首推 -->
    <div class="section top-pick">
      <div class="section-header">
        <h2>Danny首推</h2>
      </div>
      <div class="top-pick-content">
        <div class="book-image">
          <img :src="topPick.cover" :alt="topPick.title" />
        </div>
        <div class="book-content">
          <h3>{{ topPick.title }}</h3>
          <p class="author">{{ topPick.author }}</p>
          <div class="rating">
            <Icon 
              v-for="n in 5" 
              :key="n"
              :icon="n <= topPick.rating ? 'mdi:star' : 'mdi:star-outline'"
              :class="{ filled: n <= topPick.rating }"
            />
            <span class="rating-count">({{ topPick.ratingCount }}条评价)</span>
          </div>
          <div class="tags">
            <span v-for="tag in topPick.tags" :key="tag">{{ tag }}</span>
          </div>
          <p class="description">{{ topPick.description }}</p>
          <div class="recommend-reason">
            <h4>Dannyの推荐理由</h4>
            <p>{{ topPick.recommendReason }}</p>
          </div>
          <div class="actions">
            <button class="primary-btn" @click="startReading(topPick)">
              <Icon icon="mdi:book-open-page-variant" />
              开始阅读
            </button>
            <button class="secondary-btn" @click="downloadBook(topPick)">
              <Icon icon="mdi:download" />
              下载这本书
            </button>
            <button class="notes-btn" @click="viewReadingNotes(topPick)">
              <Icon icon="mdi:notebook-edit-outline" />
              Danny的读书笔记
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- 精选推荐 -->
    <div class="section featured">
      <div class="section-header">
        <h2>精选推荐</h2>
        <div class="carousel-controls">
          <button @click="prevSlide"><Icon icon="mdi:chevron-left" /></button>
          <button @click="nextSlide"><Icon icon="mdi:chevron-right" /></button>
        </div>
      </div>
      <div class="books-carousel" ref="carousel">
        <div v-for="book in featuredBooks" :key="book.id" class="book-card featured">
          <div class="book-cover">
            <img :src="book.cover" :alt="book.title" />
            <div class="book-overlay">
              <div class="book-info">
                <h3>{{ book.title }}</h3>
                <p class="author">{{ book.author }}</p>
                <div class="tags">
                  <span v-for="tag in book.tags" :key="tag">{{ tag }}</span>
                </div>
                <button class="read-more" @click="showBookDetails(book)">
                  Learn More
                </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类浏览 -->
    <div class="section genres">
      <div class="section-header">
        <h2>分类浏览</h2>
      </div>
      <div class="genres-grid">
        <div v-for="genre in genres" :key="genre.id" class="genre-card">
          <div class="genre-image" :style="{ backgroundImage: `url(${genre.image})` }">
            <h3>{{ genre.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 书籍详情模态框 -->
    <div v-if="selectedBook" class="book-modal" @click.self="closeBookDetails">
      <div class="modal-content">
        <button class="close-btn" @click="closeBookDetails">
          <Icon icon="mdi:close" />
        </button>
        <div class="book-details">
          <div class="book-cover">
            <img :src="selectedBook.cover" :alt="selectedBook.title" />
          </div>
          <div class="book-info">
            <h2>{{ selectedBook.title }}</h2>
            <p class="author">{{ selectedBook.author }}</p>
            <div class="rating">
              <Icon 
                v-for="n in 5" 
                :key="n"
                :icon="n <= selectedBook.rating ? 'mdi:star' : 'mdi:star-outline'"
                :class="{ filled: n <= selectedBook.rating }"
              />
              <span class="rating-count">({{ selectedBook.ratingCount }}条评价)</span>
            </div>
            <div class="tags">
              <span v-for="tag in selectedBook.tags" :key="tag">{{ tag }}</span>
            </div>
            <p class="description">{{ selectedBook.description }}</p>
            <div class="actions">
              <button class="primary-btn" @click="startReading(selectedBook)">
                <Icon icon="mdi:book-open-page-variant" />
                开始阅读
              </button>
              <button class="secondary-btn" @click="downloadBook(selectedBook)">
                <Icon icon="mdi:download" />
                下载图书
              </button>
              <button class="notes-btn" @click="viewReadingNotes(selectedBook)">
                <Icon icon="mdi:notebook-edit-outline" />
                读书笔记
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全部推荐 -->
    <div class="section all-recommend">
      <div class="section-header">
        <h2>全部推荐</h2>
                <!-- 查看全部按钮 -->
                <div class="view-all-container">
          <button class="view-all-btn" @click="showAllBooksModal">
            <Icon icon="mdi:book-open-variant" class="btn-icon" />
            查看全部推荐
          </button>
        </div>
      </div>
      <div class="all-recommend-container">
        <div class="all-books-grid">
          <!-- 第一行书籍 -->
          <div class="grid-row">
            <div class="books-wrapper1">
              <div v-for="book in firstRowBooks" 
                   :key="book.id" 
                   class="book-card all"
              >
                <div class="book-cover" @click="showBookDetails(book)">
                  <img :src="book.cover" :alt="book.title" />
                  <div class="all-book-overlay">
                    <div class="book-info">
                      <h3>{{ book.title }}</h3>
                      <p class="author">{{ book.author }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <img src="/background/reading/book-1.svg" class="shelf-image" alt="书架" />
          </div>

          <!-- 第二行书籍 -->
          <div class="grid-row">
            <div class="books-wrapper2">
              <div v-for="book in secondRowBooks" 
                   :key="book.id" 
                   class="book-card all"
              >
                <div class="book-cover" @click="showBookDetails(book)">
                  <img :src="book.cover" :alt="book.title" />
                  <div class="all-book-overlay">
                    <div class="book-info">
                      <h3>{{ book.title }}</h3>
                      <p class="author">{{ book.author }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <img src="/background/reading/book-2.svg" class="shelf-image" alt="书架" />
          </div>

          <!-- 第三行书籍 -->
          <div class="grid-row">
            <div class="books-wrapper3">
              <div v-for="book in thirdRowBooks" 
                   :key="book.id" 
                   class="book-card all"
              >
                <div class="book-cover" @click="showBookDetails(book)">
                  <img :src="book.cover" :alt="book.title" />
                  <div class="all-book-overlay">
                    <div class="book-info">
                      <h3>{{ book.title }}</h3>
                      <p class="author">{{ book.author }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <img src="/background/reading/book-3.svg" class="shelf-image" alt="书架" />
          </div>
        </div>
      </div>
    </div>

    <!-- 全部书籍列表模态框 -->
    <div v-if="showAllBooks" class="all-books-modal" @click.self="closeAllBooksModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>全部推荐书籍</h3>
          <button class="close-btn" @click="closeAllBooksModal">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="books-list">
          <div 
            v-for="book in allBooks" 
            :key="book.id" 
            class="book-list-item"
            @click="showBookDetails(book)"
          >
            <img :src="book.cover" :alt="book.title" class="book-thumbnail" />
            <div class="book-info">
              <h4>{{ book.title }}</h4>
              <p class="author">{{ book.author }}</p>
              <div class="tags">
                <span v-for="tag in book.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <Icon icon="mdi:chevron-right" class="arrow-icon" />
          </div>
        </div>
      </div>
    </div>

    <div class="fill-Blok" style="height: 0px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import ParticlesBackground from '../../components/ParticlesBackground.vue'
import type { Book } from '@/data/readingData'
import { tags, allBooks, genres, topPick, currentReading } from '@/data/readingData'

const router = useRouter()

// 搜索和标签
const searchQuery = ref('')
const selectedTags = ref<string[]>([])

// 当前选中的书籍
const selectedBook = ref<Book | null>(null)

// featuredBooks 初始化时使用 allBooks
const featuredBooks = ref<Book[]>(allBooks.slice(0, 6))

// 轮播控制
const carousel = ref<HTMLElement | null>(null)
const currentSlide = ref(0)

const setSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  if (carousel.value instanceof HTMLElement) {
    carousel.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

const prevSlide = () => {
  if (carousel.value instanceof HTMLElement) {
    carousel.value.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

// 搜索和过滤逻辑
const handleSearch = () => {
  const query = searchQuery.value.toLowerCase()
  const filteredBooks = allBooks.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.tags.some(tag => tag.toLowerCase().includes(query))
  )
  
  // 更新显示的书籍
  featuredBooks.value = filteredBooks.slice(0, 6)
}

// 标签过滤
watch(selectedTags, (newTags) => {
  if (newTags.length === 0) {
    featuredBooks.value = allBooks.slice(0, 6)
    return
  }
  
  const filteredBooks = allBooks.filter(book =>
    book.tags.some(tag => newTags.includes(tag))
  )
  featuredBooks.value = filteredBooks.slice(0, 6)
})

// 轮播图片数据
const bannerImages = [
  '/background/reading/reading-bg5.png',
  '/background/startBg/start-bg5.png',
  '/background/startBg/start-bg6.png',
  '/background/reading/reading.png',
]

// 监听轮播图变化，同步更新页面背景
watch(currentSlide, (newSlide) => {
  const container = document.querySelector('.reading-container') as HTMLElement
  if (container) {
    container.style.backgroundImage = `linear-gradient(rgba(35, 42, 51, 0.8), rgba(148, 182, 219, 0.1)), 
                                     url(${bannerImages[newSlide]})`
  }
})

// 标签切换
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 添加滚动监听器
const updateModalPosition = () => {
  if (showAllBooks.value || selectedBook.value) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const viewportHeight = window.innerHeight
    const modalTop = scrollTop + (viewportHeight * 0.5)
    
    const modalElements = document.querySelectorAll('.modal-content') as NodeListOf<HTMLElement>
    modalElements.forEach(modal => {
      modal.style.top = `${modalTop}px`
      modal.style.left = '50%'
      modal.style.transform = 'translate(-50%, -50%)'
    })
  }
}

onMounted(() => {
  // 初始化背景图片
  const container = document.querySelector('.reading-container') as HTMLElement
  if (container) {
    container.style.backgroundImage = `linear-gradient(rgba(35, 42, 51, 0.8), rgba(148, 182, 219, 0.1)), 
                                     url(${bannerImages[currentSlide.value]})`
  }
  
  // 加载书架数据
  const savedBookshelf = localStorage.getItem('bookshelf')
  if (savedBookshelf) {
    bookshelf.value = JSON.parse(savedBookshelf)
  }
  
  const handleScroll = () => {
    const scrollPosition = window.pageYOffset
    document.documentElement.style.setProperty('--scroll-position', scrollPosition.toString())
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始化

  // 添加滚动事件监听
  window.addEventListener('scroll', updateModalPosition)
})

onUnmounted(() => {
  if (cleanupScroll) {
    cleanupScroll()
  }
  
  // 移除滚动事件监听
  window.removeEventListener('scroll', updateModalPosition)
})

// 修改打开模态框的方法
const showBookDetails = (book: Book) => {
  selectedBook.value = book
  // 初始化模态框位置
  nextTick(() => {
    updateModalPosition()
  })
}

const closeBookDetails = () => {
  selectedBook.value = null
}

// 修改全部书籍列表的显示控制
const showAllBooksModal = () => {
  showAllBooks.value = true
  // 初始化模态框位置
  nextTick(() => {
    updateModalPosition()
  })
}

const closeAllBooksModal = () => {
  showAllBooks.value = false
}

// 下载图书
const downloadBook = (book: Book) => {
  // 这里添加下载逻辑
  console.log('Downloading book:', book.title)
}

// 查看读书笔记
const viewReadingNotes = (book: Book) => {
  router.push({
    path: '/reading/notes',
    query: { id: book.id }
  })
}

// 初始化和状态管理
const bookshelf = ref<Book[]>([])
let cleanupScroll: (() => void) | null = null

onMounted(() => {
  // 加载书架数据
  const savedBookshelf = localStorage.getItem('bookshelf')
  if (savedBookshelf) {
    bookshelf.value = JSON.parse(savedBookshelf)
  }
  
  const handleScroll = () => {
    const scrollPosition = window.pageYOffset
    document.documentElement.style.setProperty('--scroll-position', scrollPosition.toString())
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始化

  cleanupScroll = () => {
    window.removeEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (cleanupScroll) {
    cleanupScroll()
  }
})

// 添加到模板中的按钮事件
const startReading = (book: Book) => {
  // 可以跳转到阅读页面
  router.push({
    path: '/reading/book',
    query: { id: book.id }
  })
}

// const addToBookshelf = (book: Book) => {
//   if (!bookshelf.value.find(b => b.id === book.id)) {
//     bookshelf.value.push(book)
//     // 可以保存到 localStorage
//     localStorage.setItem('bookshelf', JSON.stringify(bookshelf.value))
//   }
// }

// 每行显示的书籍
const firstRowBooks = computed(() => allBooks.slice(0, 6))
const secondRowBooks = computed(() => allBooks.slice(6, 12))
const thirdRowBooks = computed(() => allBooks.slice(12, 18))

// 控制全部书籍列表的显示
const showAllBooks = ref(false)

// 修改模态框位置计算属性
// const modalPosition = computed(() => {
//   if (typeof window === 'undefined') return {}
  
//   const scrollTop = window.pageYOffset || document.documentElement.scrollTop
//   const viewportHeight = window.innerHeight
//   const modalTop = scrollTop + (viewportHeight * 0.5)
  
//   return {
//     top: `${modalTop}px`,
//     transform: 'translate(-50%, -50%)',
//     left: '50%'
//   }
// })
</script>

<style scoped>
.reading-container {
  font-family: var(--font-mixed-primary);
  background-color: #94B6DB;
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease;
  background-attachment: fixed;
  min-height: 100vh;
  padding: 0px 0px;
  position: relative;
  transform: translateZ(0);
}

/* :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
  url(${bannerImages[currentSlide]})` }"> */

/* 确保所有文本元素都继承字体 */
.reading-container * {
  font-family: inherit;
}

.banner {
  height: 700px;
  position: relative;
  overflow: hidden;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.banner-content {
  width: 100%;
  height: 40%;
  z-index: 1;
}

.banner-content h1 {
  font-family: inherit;
  font-weight: 500;
  font-size: 3.8rem;
  margin-top: 1.8rem;
  margin-bottom: 1.3rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-content .banner-text1 {
  font-size: 1.1rem;
  max-width: 100%;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.9);
}

.banner-content .banner-text2 {
  font-size: 1.2rem;
  max-width: 100%;
  letter-spacing: 0.35em;
  color: rgba(255,255,255,0.9);
}

.banner-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #fff;
  transform: scale(1.2);
}

.search-section {
  padding: 40px;
  text-align: center;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}

.search-box {
  max-width: 600px;
  margin: 0 auto 20px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 15px 50px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 30px;
  color: #fff;
  font-size: 16px;
  backdrop-filter: blur(5px);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.6);
  font-size: 20px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.tag {
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.tag:hover, .tag.active {
  background: rgba(135,206,235,0.2);
  color: #87CEEB;
  transform: translateY(-2px);
}

.section {
  padding: 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  color: var(--color-primary);
  margin: 0;
}

.carousel-controls {
  display: flex;
  gap: 10px;
  margin-right: 20px;
}

.carousel-controls button {
  background: rgba(0, 183, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #00b7ff;
  transition: all 0.3s ease;
}

.carousel-controls button:hover {
  background: rgba(0, 183, 255, 0.2);
  transform: translateY(-2px);
}

.books-carousel {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 183, 255, 0.5) rgba(255, 255, 255, 0.1);
}

/* 自定义滚动条样式 */
.books-carousel::-webkit-scrollbar {
  height: 8px;
}

.books-carousel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.books-carousel::-webkit-scrollbar-thumb {
  background: rgba(0, 183, 255, 0.5);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.books-carousel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 183, 255, 0.7);
}

.book-card {
  flex: 0 0 280px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}

/* .book-card:hover {
  transform: translateY(-5px);
  border-color: rgba(135,206,235,0.3);
} */

.book-cover {
  position: relative;
  height: 380px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-overlay {
  /* cursor: pointer; */
  position: absolute;
  bottom: -33%;  /* 初始状态在下方隐藏 */
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.35));
  display: flex;
  flex-direction: column;
  padding: 15px;
  transition: all 0.3s ease;
  opacity: 1;  /* 改为默认可见 */
}

.book-card:hover .book-overlay {
  /* cursor: pointer; */
  bottom: 0;  /* hover 时滑入 */
}

.all-book-overlay {
  cursor: pointer;
  position: absolute;
  width: 100%;
  bottom: -25%!important;  /* 初始状态在下方隐藏 */
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.35));
  display: flex;
  flex-direction: column;
  padding: 15px;
  transition: all 0.3s ease;
  opacity: 1;  /* 改为默认可见 */
}

.book-card:hover .all-book-overlay {
  cursor: pointer;
  bottom: 0!important;  /* hover 时滑入 */
}

.book-info {
  padding: 15px;
  text-align: center;
}

.book-info h3 {
  font-family: inherit;
  font-weight: 500;
  font-size: 16px;
  color: #fff;
  margin-top: -17px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author {
  color: rgba(255,255,255,0.7);
  text-align: left;
  font-size: 14px;
  margin: 6px 0;
}

.book-overlay .description {
  color: rgba(255,255,255,0.9);
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.read-more {
  width: 100%;
  padding: 5px 0px;
  margin:15px 0px;
  background: rgba(10, 66, 88, 0.8);
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.read-more:hover {
  background: rgba(3, 184, 255, 0.9);
}

.tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tags span {
  padding: 4px 8px;
  background: rgba(135,206,235,0.1);
  border-radius: 4px;
  color: #87CEEB;
  font-size: 12px;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0px;
}

.genre-card {
  position: relative;
  width: 100%;
  padding-top: calc(2 / 3 * 100%);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #1a1a1a;
  border: none;
  box-shadow: 0px 15px 15px -10px rgba(0, 0, 0, 0.5);
}

.genre-card:hover {
  border-color: rgba(135, 206, 235, 0.3);
}

.genre-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
  background-size: 100% 100% !important;
  background-repeat: no-repeat;
  background-position: center;
}

.genre-image::before {
  content: '';
  position: absolute;
  height: 35%;
  margin: auto;
  inset: 0;
  background: linear-gradient(
    45deg,
    rgba(0,0,0,0.7),
    rgba(0,0,0,0.3)
  );
  transition: all 0.3s ease;
}

.genre-card:hover .genre-image::before {
  background: linear-gradient(
    45deg,
    rgba(0,0,0,0.8),
    rgba(0,0,0,0.4)
  );
}

.genre-image h3 {
  font-family: inherit;
  font-weight: 500;
  color: #fff;
  font-size: 20px;
  position: relative;
  z-index: 1;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.genre-card:hover .genre-image h3 {
  /* transform: scale(1.1); */
  color: #00b7ff;
}

.book-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  position: fixed;  /* 改为 fixed 定位 */
  transition: top 0.2s ease;  /* 添加平滑过渡效果 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  max-width: 900px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.book-details {
  display: flex;
  gap: 30px;
}

.book-details .book-cover {
  flex: 0 0 300px;
}

.book-details .book-info {
  flex: 1;
}

.book-details .actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  text-align: left;
  gap: 15px;
  margin-top: 20px;
}

.primary-btn,
.secondary-btn,
.notes-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  min-width: 140px;
  justify-content: center;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: rgba(135, 206, 235, 0.8);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.1);
}

.notes-btn {
  background: rgba(255, 183, 0, 0.2);
}

.primary-btn:hover,
.secondary-btn:hover,
.notes-btn:hover {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .genres-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .genres-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .genres-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .reading-container {
    background-position: 50% calc(50% + (var(--scroll-position, 0) * 0.5px));
  }
}

/* Danny首推样式 */
.top-pick-content {
  display: flex;
  gap: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.book-image {
  flex: 0 0 300px;
  position: relative;
  aspect-ratio: 3/4;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.book-content {
  flex: 1;
}

.book-content .actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 15px;
  margin-top: 20px;
}

.book-content h3 {
  font-size: 32px;
  color: #fff;
  margin: 0 0 10px;
}

.recommend-reason {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.recommend-reason h4 {
  color: #00b7ff;
  margin: 0 0 10px;
  font-size: 18px;
}

.recommend-reason p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

/* Danny在读样式 */
.current-reading {
  background: rgba(0, 183, 255, 0.1);
  padding: 15px 30px;
  margin: 40px auto -30px;
  max-width: 1320px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-reading .iconify {
  font-size: 24px;
  color: #00b7ff;
}

.reading-message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .top-pick-content {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
  
  .book-image {
    width: 200px;
    margin: 0 auto;
  }
  
  .actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .book-content h3 {
    font-size: 24px;
    text-align: center;
  }
  
  .book-content .author {
    text-align: center;
  }
  
  .rating {
    justify-content: center;
  }
}

/* 评分样式 */
.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0;
}

.rating .iconify {
  color: #ffd700;
  font-size: 20px;
}

.rating-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-left: 8px;
}

.all-recommend-container {
  position: relative;
  margin-top: 40px;
}

.all-books-grid {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px;
}

.grid-row {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.books-wrapper1, .books-wrapper2, .books-wrapper3 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 200px;
  grid-auto-rows: 0;
  overflow: hidden;
  gap: max(20px, calc((100% - (150px * 5)) / 5));
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

.books-wrapper1 {
  margin-bottom: -10px;
}

.books-wrapper2 {
  margin-top: -150px;
  margin-bottom: -25px;
}

.books-wrapper3 {
  margin-top: -150px;
  margin-bottom: -45px;
}

.shelf-image {
  width: 100%;
  max-width: 1200px;
  height: auto;
  margin-top: -10px;
}

.book-card.all {
  aspect-ratio: 3/4;
  height: 200px;
  width: 150px;
  background: none;
  border: none;
  backdrop-filter: none;
  perspective: 1000px;
  justify-self: center;
}

.book-card.all .book-cover {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  transform: rotateY(-10deg);
  box-shadow: 
    5px 5px 20px rgba(0, 0, 0, 0.3),
    2px 0 5px rgba(0, 0, 0, 0.5);
}

/* .book-card.all:hover .book-cover {
  transform: rotateY(-20deg);
} */

.book-card.all .book-cover::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  transform: translateZ(-1px);
  border-radius: 2px;
}

.book-card.all .book-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 5%,
    transparent 95%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

.book-card.all .book-cover img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

.all-book-overlay {
  cursor: pointer;
  position: absolute;
  width: 100%;
  bottom: -33%;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.35));
  display: flex;
  flex-direction: column;
  padding: 15px;
  transition: all 0.3s ease;
  opacity: 1;
}

/* 移除其他可能存在的圆角设置 */
.book-card.all,
.book-cover,
.book-cover img,
.book-overlay,
.all-book-overlay {
  border-radius: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .books-wrapper1, .books-wrapper2, .books-wrapper3 {
    max-width: 900px;
    grid-template-columns: repeat(3, 1fr);
    gap: max(10px, calc((100% - (150px * 4)) / 3));
  }
  
  .book-card.all{
    height: 200px;
  }

  .book-card.all .book-cover{
    height: 100%;
  }

  .books-wrapper1 {
    margin-bottom: -10px;
  }

  .books-wrapper2 {
    margin-top: -50px;
    margin-bottom: -15px;
  }
  
  .books-wrapper3 {
    margin-top: -40px;
    margin-bottom: -20px;
  }
}

@media (max-width: 768px) {
  .books-wrapper1, .books-wrapper2, .books-wrapper3 {
    max-width: 600px;
    grid-template-columns: repeat(3, 1fr);
    gap: max(5px, calc((100% - (150px * 3)) / 2));
  }
  
  .book-card.all {
    height: 200px;
  }
  
  /* .book-card.all:hover .book-cover {
    transform: rotateY(-15deg);
  } */
}

@media (max-width: 480px) {
  .books-wrapper1, .books-wrapper2, .books-wrapper3 {
    max-width: 400px;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 0 10px;
  }

  .book-card.all {
    height: 200px;
  }
  
  /* .book-card.all:hover .book-cover {
    transform: rotateY(0deg);
  } */
  
  .book-card.all .book-cover::before,
  .book-card.all .book-cover::after {
    display: none;
  }
}

/* 调整书架间距响应式 */
@media (max-width: 768px) {
  .books-wrapper1 {
    margin-bottom: -8px;
  }

  .books-wrapper2 {
    margin-top: -50px;
  }
  
  .books-wrapper3 {
    margin-top: -40px;
    margin-bottom: -10px;
  }

  .book-card.all{
    height: 100%;
  }

  .book-card.all .book-cover{
    height: 100%;
  }
}

@media (max-width: 480px) {
  .books-wrapper2 {
    margin-top: -40px;
  }
  
  .books-wrapper3 {
    margin-top: -40px;
  }
}

/* iPad 端适配 */
@media (max-width: 1024px) {
  .top-pick-content {
    gap: 30px;
    padding: 25px;
  }
  
  .book-image {
    flex: 0 0 250px;
  }
  
  .book-content h3 {
    font-size: 28px;
  }
  
  .recommend-reason {
    padding: 15px;
  }
  
  .book-content .actions {
    flex-wrap: wrap;
    gap: 10px;
  }
}

/* 小屏幕适配 */
@media (max-width: 480px) {
  .book-image {
    width: 150px;
  }
  
  .book-content h3 {
    font-size: 20px;
  }
  
  .recommend-reason {
    padding: 12px;
  }
  
  .recommend-reason h4 {
    font-size: 16px;
  }
}

/* 查看全部按钮样式 */
.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.view-all-btn {
  background: rgba(0, 183, 255, 0.699);
  border: 1px solid rgb(0, 183, 255);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 60px;
  gap: 8px;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgb(255, 255, 255);
  color: #00b7ff;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 20px;
}

/* 全部书籍列表模态框样式 */
.all-books-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  z-index: 999;
}

.all-books-modal .modal-content {
  position: absolute;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.books-list {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.book-list-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s ease;
}

.book-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.book-thumbnail {
  width: 60px;
  height: 90px;
  object-fit: cover;
}

.book-list-item .book-info {
  flex: 1;
}

.book-list-item h4 {
  margin: 0 0 5px;
  color: #fff;
}

.book-list-item .author {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px;
}

.book-list-item .tags {
  display: flex;
  gap: 8px;
}

.book-list-item .tags span {
  background: rgba(0, 183, 255, 0.1);
  color: #00b7ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.3);
  font-size: 24px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .book-list-item .tags {
    display: none;
  }
  
  .book-thumbnail {
    width: 50px;
    height: 75px;
  }
}
</style> 