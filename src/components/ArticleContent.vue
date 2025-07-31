<template>
    <!-- 文章 Banner -->
    <div class="article-banner" :style="{ backgroundImage: `url(${article.cover})` }">
      <div class="banner-overlay">
        <div class="banner-content">
          <span class="banner-title-box">
            <h1 class="banner-title">{{ article.title }}</h1>
            <div class="meta-item banner-title-tag" v-if="article.tags?.length">
              <Icon icon="mdi:tag-multiple" />
              <span>:
                <span v-for="tag in article.tags" :key="tag" class="banner-tag">
                  {{ tag }}
                </span>
              </span>
            </div>
          </span>
          <div class="banner-meta">
            <div class="meta-item">
              <Icon icon="mdi:pencil" />
              <span>发表于: {{ formatDate(article.createTime) }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:update" />
              <span>更新于: {{ formatDate(article.updateTime || article.createTime) }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:clock-outline" />
              <span>阅读时长: {{ article.readingTime || '9' }} 分钟</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:text" />
              <span>字数: {{ article.wordCount || '0' }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:eye" />
              <span>阅读量: {{ article.views }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:comment-text-outline" />
              <span>评论: {{ article.commentCount || '0' }}</span>
            </div>
            <div class="meta-item" v-if="article.category">
              <Icon icon="mdi:folder" />
              <span>分类: {{ article.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>




    
      <div class="contentAndFunction-container">
      <!-- AI 摘要 -->
      <div class="ai-summary-article-container">
        <div class="ai-summary">
        <div class="summary-header">
          <Icon icon="mdi:robot" class="robot-icon" />
          <span class="summary-title">AI 摘要</span>
          <div class="model-info">
            <span class="model-name">          
              <img 
                :src="currentModel === AI_MODEL.QWEN ? '/Icon/Logo/通义千问-copy.svg' : '/Icon/Logo/deepseek.svg'" 
                :alt="currentModel === AI_MODEL.QWEN ? '通义千问' : 'DeepSeek'" 
                class="model-icon"
              />
              <span class="model-text">{{ currentModel === AI_MODEL.QWEN ? 'Qwen-plus' : 'DeepSeek-V3' }}</span>
            
            </span>
            <span @click="toggleModel">
              <Icon icon="mdi:swap-horizontal" class="swap-icon"  />
            </span>
          </div>
        </div>
        <div class="summary-content" :class="{ 'generating': isGeneratingSummary }">
          {{ aiSummary }}
        </div>
      </div>
      <div class="article-content">
        <!-- 文章内容 -->
        <div class="article-body">
          <div v-if="!renderedContent">Loading content...</div>
          <div class="markdown-content" v-html="renderedContent"></div>
          <CopyrightCard :article="article" />
          <ArticleNavigation :currentArticleId="article.id" />
          <RelatedArticles :currentArticle="article" />
          <ArticleComments :article="article" />
        </div>
      </div>
      </div>
      <div class="function-bar">
        <div class="card-slider">
      <div class="slider-container">
        <span class="slider-label">背景透明度</span>
        <input 
          type="range" 
          class="slider" 
          v-model="bgOpacity" 
          min="0" 
          max="100" 
          step="1"
        >
        <span class="slider-value">{{ bgOpacity }}%</span>
      </div>
    </div>
        <div class="quickNavAndRecentBar">
          <QuickNav :content="renderedContent" />
          <RecentArticles />
        </div>
      </div>
    </div>


    <!-- 图片预览弹窗 -->
    <div v-if="showImagePreview" class="image-preview" @click="showImagePreview = false">
      <div class="preview-content">
        <img :src="previewImage" alt="preview">
        <div class="preview-actions">
          <button @click.stop="downloadImage(previewImage)">下载</button>
        </div>
      </div>
    </div>

    <!-- 外链跳转提示 -->
    <ExternalLinkAlert
      v-if="showExternalLinkAlert"
      :url="externalLinkUrl"
      :show="showExternalLinkAlert"
      @close="showExternalLinkAlert = false"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, onUnmounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import { Marked } from 'marked'
  import { markedHighlight } from 'marked-highlight'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/atom-one-dark.css'
  import { generateSummary as genAISummary, AI_MODEL, type AIModel } from '../services/openai'
  import { formatDate } from '../utils/formatDate'
  import QuickNav from './QuickNav.vue'
  import RecentArticles from './RecentArticles.vue'
  import CopyrightCard from './CopyrightCard.vue'
  import ArticleNavigation from './ArticleNavigation.vue'
  import RelatedArticles from './RelatedArticles.vue'
  import ArticleComments from './ArticleComments.vue'
  import ExternalLinkAlert from './ExternalLinkAlert.vue'
  
  const marked = new Marked(
    {
      gfm: true,
      breaks: true,
    }
  ).use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        const highlightedCode = hljs.highlight(code, { language }).value
        const lines = highlightedCode.split('\n')
          .map(line => `<span class="hljs-line">${line}</span>`)
          .join('\n')
        return `
          <div class="code-header">
            <span class="language-label">
              <div class="code-dots">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
              </div>
              <span>${language}</span>
            </span>
            <div class="header-actions">
              <button class="copy-button">
                <i class="iconify" data-icon="material-symbols:content-copy-outline"></i>
                <span>复制代码</span>
              </button>
            </div>
          </div>
          <div class="code-content">${lines}</div>
        `
      }
    })
  )
  
  const props = defineProps<{
    article: {
      id: number
      title: string
      createTime: string
      updateTime: string
      views: number
      content: string
      category?: string
      tags?: string[]
      cover: string
      aiSummary?: string
      readingTime?: string
      wordCount?: number
      commentCount?: number
      author?: string
      license?: string
    }
  }>()
  
  const renderedContent = ref('')
  
  interface CodeBlock {
    type: 'code'
    language: string
    content: string
    lines: string[]
  }

  interface TextBlock {
    type: 'text'
    content: string
  }

  type ContentBlock = CodeBlock | TextBlock

  const contentBlocks = ref<ContentBlock[]>([])
  
  const showImagePreview = ref(false)
  const previewImage = ref('')
  
  const bgOpacity = ref(0)
  
  const aiSummary = ref('')
  const isGeneratingSummary = ref(false)
  const isTyping = ref(false)
  
  // 当前使用的模型，默认使用 DEEPSEEK
  const currentModel = ref<AIModel>(AI_MODEL.DEEPSEEK)
  
  // 外链跳转提示相关
  const showExternalLinkAlert = ref(false);
  const externalLinkUrl = ref('');
  
  const typeText = (text: string) => {
    isTyping.value = true
    let index = 0
    aiSummary.value = ''
    
    const type = () => {
      if (index < text.length) {
        aiSummary.value += text[index]
        index++
        setTimeout(type, 50) // 控制打字速度
      } else {
        isTyping.value = false
      }
    }
    
    type()
  }
  
  const generateSummary = async (content: string) => {
    try {
      isGeneratingSummary.value = true
      const summary = await genAISummary(content, currentModel.value)
      typeText(summary)
    } catch (error) {
      console.error('生成摘要失败:', error)
      if (error instanceof Error) {
        // 显示错误消息
        if (error.message.includes('402') || error.message.includes('金库空空如也')) {
          aiSummary.value = '领主大人的金库空空如也了，用不起我了 (｡•́︿•̀｡)'
        } else {
          aiSummary.value = '省流：自己看吧... (っ °Д °;)っ'
        }
      } else {
        aiSummary.value = '省流：自己看吧... (っ °Д °;)っ'
      }
    } finally {
      isGeneratingSummary.value = false
    }
  }
  
  // 切换模型
  const toggleModel = () => {
    currentModel.value = currentModel.value === AI_MODEL.QWEN ? AI_MODEL.DEEPSEEK : AI_MODEL.QWEN
    // 重新生成摘要
    if (props.article.content) {
      generateSummary(props.article.content)
    }
  }
  
  const updateNavPosition = () => {
    const scrollPosition = window.scrollY
    const navBar = document.querySelector('.quickNavAndRecentBar') as HTMLElement
    if (navBar) {
      if (scrollPosition < 600) {
        navBar.style.transform = 'translateY(0px)'
      } else {
        // 使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
          navBar.style.transform = `translateY(${scrollPosition - 600}px)`
        })
      }
    }
  }
  
  onMounted(() => {
    console.log('Raw content:', props.article.content)
    let content = marked.parse(props.article.content) as string
    renderedContent.value = content
    
    // 解析内容块
    const blocks = content.split(/(<pre><code class="language-.*?<\/code><\/pre>)/)
    contentBlocks.value = blocks.map(block => {
      const codeMatch = block.match(/<pre><code class="language-(\w+)">([\s\S]+?)<\/code><\/pre>/)
      if (codeMatch) {
        const [_, language, code] = codeMatch
        const cleanCode = code.replace(/&lt;/g, '<')
                             .replace(/&gt;/g, '>')
                             .replace(/&amp;/g, '&')
        return {
          type: 'code',
          language,
          content: cleanCode,
          lines: cleanCode.split('\n')
        }
      }
      return {
        type: 'text',
        content: block
      }
    })

    // 修改事件监听的添加方式
    setTimeout(() => {
      document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function(this: HTMLButtonElement, e: Event) {
          const pre = (e.target as HTMLElement).closest('pre')
          if (pre) {
            const code = pre.querySelector('.code-content')?.textContent || ''
            copyCode.call(this, code)
          }
        })
      })
    }, 0)

    // 为所有图片添加点击事件
    setTimeout(() => {
      document.querySelectorAll('.markdown-content img').forEach(img => {
        img.addEventListener('click', handleImageClick)
      })
    }, 0)

    // 在 onMounted 中获取摘要
    generateSummary(props.article.content)

    window.addEventListener('scroll', updateNavPosition, { passive: true })

    // 添加外链点击事件处理
    addExternalLinkHandlers();
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', updateNavPosition)
    
    // 移除外链点击事件处理
    removeExternalLinkHandlers();
  })
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // 创建提示元素
      const tip = document.createElement('div')
      tip.className = 'copy-tip'
      tip.textContent = '成功偷到这个代码喽！ (๑•̀ㅂ•́)و✧'
      document.body.appendChild(tip)
      
      // 3秒后移除提示
      setTimeout(() => {
        document.body.removeChild(tip)
      }, 2000)
    })
  }

  const handleImageClick = (e: Event) => {
    const img = e.target as HTMLImageElement
    previewImage.value = img.src
    showImagePreview.value = true
  }

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      
      // 创建canvas添加水印
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      await new Promise(resolve => img.onload = resolve)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      // 添加水印
      ctx.font = '24px ZhuZiAWan'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.rotate(-45 * Math.PI / 180)
      const text = 'Dansela'
      const textWidth = ctx.measureText(text).width
      
      // 重复水印
      for(let i = -canvas.height; i < canvas.width * 2; i += textWidth + 100) {
        for(let j = -canvas.width; j < canvas.height * 2; j += 50) {
          ctx.fillText(text, i, j)
        }
      }
      
      // 下载带水印的图片
      const link = document.createElement('a')
      link.download = 'dansela_image.png'
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('下载图片失败:', error)
    }
  }

  // 监听透明度变化
  watch(bgOpacity, (newValue) => {
    const articleContent = document.querySelector('.article-content')
    if (articleContent) {
      (articleContent as HTMLElement).style.background = `rgba(0, 0, 0, ${newValue / 100})`
    }
  })

  // 处理外部链接点击
  function addExternalLinkHandlers() {
    setTimeout(() => {
      const contentEl = document.querySelector('.article-content');
      if (!contentEl) return;

      // 先移除可能存在的事件监听，避免重复
      contentEl.removeEventListener('click', handleLinkClick as EventListener);
      // 添加事件监听
      contentEl.addEventListener('click', handleLinkClick as EventListener);
      console.log('外链点击事件监听已添加');
    }, 1000); // 增加延迟时间以确保DOM已完全渲染
  }

  // 移除外链点击事件处理
  function removeExternalLinkHandlers() {
    const contentEl = document.querySelector('.article-content');
    if (contentEl) {
      contentEl.removeEventListener('click', handleLinkClick as EventListener);
    }
  }

  // 链接点击处理函数
  function handleLinkClick(e: MouseEvent) {
    // 找到最近的链接元素
    let target = e.target as HTMLElement;
    let linkElement: HTMLAnchorElement | null = null;
    
    // 向上查找最近的<a>标签
    while (target && target !== e.currentTarget) {
      if (target.tagName === 'A') {
        linkElement = target as HTMLAnchorElement;
        break;
      }
      target = target.parentElement as HTMLElement;
    }
    
    // 如果找到链接元素并且是外部链接
    if (linkElement && isExternalLink(linkElement.href)) {
      e.preventDefault(); // 阻止默认行为
      externalLinkUrl.value = linkElement.href;
      showExternalLinkAlert.value = true;
    }
  }

  // 判断是否为外部链接
  function isExternalLink(url: string): boolean {
    if (!url) return false;
    try {
      // 解析URL
      const parsedUrl = new URL(url);
      
      // 如果链接是http/https协议，且不包含dansela域名，则视为外链
      return (
        (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && 
        !parsedUrl.hostname.includes('dansela')
      );
    } catch (e) {
      // URL解析错误，可能是相对路径，不是外链
      return false;
    }
  }
  </script>
  
  <style scoped>
  @font-face {
    font-family: 'ZhuZiAWan';
    src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  .quickNavAndRecentBar {
    position: sticky;
    top: 0;
    width: 300px;
    will-change: transform;
    display: flex;
    flex-direction: column;
  }
  
  .article-banner {
    width: 110%;
    height: 40vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    font-family: 'ZhuZiAWan', sans-serif;
  }
  
  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .banner-content {
    margin-top: auto;
    max-width: 1300px;
    width: 100%;
    text-align: center;
    color: #fff;
  }

  .banner-title-box {
    display: flex;
    align-items: left;
    justify-content: left;
    gap: 10px;
  }

  .banner-title-tag {
    /* margin-top: auto; */
    margin-bottom: -30px;
    .iconify {
      font-size: 1.5em;
      vertical-align: middle;
    }
  }
  
  .banner-title {
    margin-left: 0px;
    text-align: left;
    font-size: 3.5rem;
    margin-bottom: 0px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .banner-meta {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    font-size: 0.95rem;
    
    .meta-item {
      padding: 4px 0px;
      border-radius: 20px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      
      &:not(:last-child)::after {
        content: "•";
        margin: 0 12px;
        color: rgba(255, 255, 255, 0.747);
      }
      
      &:hover {
        color: rgb(0, 195, 255);
      }
      
      .iconify {
        font-size: 1.2em;
        margin-right: 4px;
        
        /* 增加选择器优先级 */
        :deep(.iconify[data-icon="mdi:pencil"]) { color: #4CAF50 !important; }
        :deep(.iconify[data-icon="mdi:update"]) { color: #2196F3 !important; }
        :deep(.iconify[data-icon="mdi:clock-outline"]) { color: #FF9800 !important; }
        :deep(.iconify[data-icon="mdi:text"]) { color: #E91E63 !important; }
        :deep(.iconify[data-icon="mdi:eye"]) { color: #9C27B0 !important; }
        :deep(.iconify[data-icon="mdi:comment-text-outline"]) { color: #00BCD4 !important; }
        :deep(.iconify[data-icon="mdi:folder"]) { color: #FFEB3B !important; }
        :deep(.iconify[data-icon="mdi:tag-multiple"]) { color: #FF5722 !important; }
      }
    }
  }
  
  .banner-tag {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 4px;
    margin: 0 4px;
    backdrop-filter: blur(4px);
  }
  
  .contentAndFunction-container {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 20px;
    padding: 0 20px;
    align-items: start;
  }
  
  .article-content {
    width: 100%;
    min-width: 1040px;
    padding: 20px;
    /* background: rgba(0, 0, 0, var(--content-bg-opacity)); */
    /* backdrop-filter: blur(10px); */
    border-radius: 12px;
    border: 1px solid rgba(0, 168, 255, 0.2);
  }
  
  .article-body {
    line-height: 1.8;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0px;
  }
  
  /* Markdown 样式 */
  :deep(.markdown-content) {
    color: #fff;
    line-height: 2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-family: 'ZhuZiAWan', sans-serif;
  
    strong {
      font-weight: 900;
      color: rgb(0, 217, 255);
      text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
      display: inline-block;
      transition: all 0.3s ease;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      &:hover {
        color: rgb(0, 238, 255);
        text-shadow: 0 0 8px rgb(0, 170, 255);
      }
    }
  
    b {
      font-weight: 900;
      color: rgb(0, 217, 255);
      text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
      display: inline-block;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  
    h1, h2, h3, h4, h5, h6 {
      color: #fff;
      margin: 0.1em 0 1em;
      font-weight: 600;
      line-height: 1.4;
    }
  
    h1 {
      font-size: 3rem;
      text-align: left;
    }
  
    h2 {
      font-size: 2.5em;
      padding-bottom: 0.2em;
      border-bottom: 2px solid var(--border-color);
      position: relative;
      border-radius: 1px;
      
      &::before {
        content: "§";
        color: var(--theme-color);
        margin-right: 0.4rem;
        font-size: 0.9em;
        display: inline-block;
        transition: all 0.3s ease;
      }

      &:hover::before {
        transform: rotate(180deg) translateY(-5px);
        color: rgb(0, 238, 255);
        text-shadow: 0 0 8px rgb(0, 170, 255);
      }

      &:hover {
        border-color: var(--theme-color);
        box-shadow: 0 0 20px rgba(0,168,255,0.1);
        /* transition: all 0.3s ease; */
      }
    }

    h3 {
      font-size: 2.4rem;
      margin: 1em 0;
      text-align: justify;
      display: flex;
      align-items: center;
      gap: 10px;
      
      &::before {
        content: "";
        margin-top: 4px;
        left: 0;
        width: 8px;
        height: 28px;
        background: var(--theme-color);
        border-radius: 2px;
        display: inline-block;
        transition: all 0.3s ease;
      }
      
      &:hover::before {
        height: 35px;
        background: rgb(0, 238, 255);
        box-shadow: 0 0 8px rgb(0, 170, 255);
      }
    }

    h4 {
      font-size: 2.0rem;
      margin: 1em 0;
      text-align: justify;
    }

    h5 {
      font-size: 1.5rem;
      margin: 1em 0;
      text-align: justify;
    }

    h6 {
      font-size: 1.35rem;
      margin: 1em 0;
      text-align: justify;
    }
  
    p {
      font-size: 1.5rem;
      margin: 1.5em 0;
      text-align: justify;
      line-height: 1.6;
    }
  
    code {
      /* background: rgba(0, 0, 0, 0.5); */
      padding: 2px 6px;
      border-radius: 8px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      margin: 0 0.2em;
    }
  
    pre {
      background: var(--code-block-bg);
      padding: 0;
      border-radius: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      margin: 1em 0;
      position: relative;
      counter-reset: line;
      border: 1px solid rgba(255,255,255,0);
      transition: all 0.3s ease-in-out;
      
      /* 隐藏滚动条但保持功能 */
      &::-webkit-scrollbar {
        height: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        
        &:hover {
          background: var(--theme-color);
        }
      }
      
      &:hover {
        border-color: var(--theme-color);
        box-shadow: 0 0 20px rgba(0,168,255,0.1);
        /* transition: all 0.3s ease; */
      }
      
      .code-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 35px;
        background: rgba(0, 120, 168, 0.89);
        border-radius: 0px 0px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
        z-index: 1;
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .language-label {
        font-family: 'ZhuZiAWan', sans-serif;
        color: #888;
        justify-content: left;
        align-items: left;
        font-size: 1.5em;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        color: var(--theme-color);
        gap: 10px;
        
        .code-dots {
          display: flex;
          gap: 6px;
          align-items: center;
          
          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            
            &.dot-red {
              background: #ff5f56;
            }
            
            &.dot-yellow {
              background: #ffbd2e;
            }
            
            &.dot-green {
              background: #27c93f;
            }
          }
        }
      }
      
      .header-actions {
        display: flex;
        gap: 8px;
      }
      
      .action-button {
        background: transparent;
        border: none;
        color: #ffffff;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        
        &:hover {
          width: 80%;
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
      }
      
      .copy-button {
        background: transparent;
        border: none;
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 1.2em;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.3s ease;
        position: relative;
        font-family: 'ZhuZiAWan', sans-serif;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 2px;
          margin-left: 2px;
          width: 0;
          height: 3px;
          border-radius: 1px;
          background: var(--theme-color);
          transition: all 0.3s ease;
          box-shadow: 0 0 8px var(--theme-color);
        }
        
        &:hover {
          color: var(--theme-color);
          
          &::after {
            border-radius: 2px;
            width: 82%;
          }
        }
        
        &.copied {
          color: var(--theme-color);
          
          span {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.9em;
          }
          
          &::after {
            width: 100%;
            background: var(--theme-color);
          }
        }
        
        .iconify {
          font-size: 1.2em;
          width: 1.2em;
          height: 1.2em;
        }
      }
      
      .code-content {
        margin: -35px 0px;
        padding: 0px 0px 0px 4em;
        position: relative;
        font-family: 'Fira Code', monospace;
        
        &::before {
          content: '';
          position: absolute;
          left: 3em;
          top: -10%;
          height: 120%;
          bottom: 0;
          border-left: 2px solid #333;
        }
      }
      
      .hljs-line {
        display: block;
        padding: 0 0.5em;
        position: relative;
        line-height: 0.5;
        margin: 0px 0;
        
        &::before {
          counter-increment: line;
          content: counter(line);
          position: absolute;
          left: -4em;
          width: 3em;
          text-align: right;
          color: #666;
          padding-right: 1em;
          user-select: none;
          line-height: 0.5;
        }
      }
    }
  
    img {
      max-width: 100%;
      border-radius: 8px;
      display: block;
      margin: 1em auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: zoom-in;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.02);
      }
    }
  
    blockquote {
      border-left: 8px solid var(--theme-color);
      padding-left: 1em;
      margin: 1em 0;
      background: var(--quote-bg);
      padding: 1em;
      border-radius: 4px;
      color: #fff;
      position: relative;
      
      &::before {
        content: "\201C";
        font-size: 2em;
        color: #fff;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 8px;
      }
    }
  
    a {
      color: var(--link-color);
      text-decoration: none;
      border-bottom: 1px dashed var(--link-border-color);
      transition: all 0.3s ease;
      
      &:hover {
        border-bottom-style: solid;
        color: var(--link-hover-color);
      }
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      background: rgba(52, 53, 65, 0.3);
      border-radius: 8px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      th, td {
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px;
        text-align: left;
        transition: all 0.3s ease;
      }
      
      th {
        background: rgba(0, 168, 255, 0.1);
        font-weight: 600;
        color: var(--theme-color);
        font-size: 1.1em;
        text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
      }
      
      tr {
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(0, 168, 255, 0.1);
        }
      }
      
      tr:nth-child(even) {
        background: rgba(255, 255, 255, 0.05);
        
        &:hover {
          background: rgba(0, 168, 255, 0.1);
        }
      }
      
      td {
        color: #fff;
      }
    }
  
    ul, ol {
      padding-left: 2em;
      margin: 0.8em 0;
      list-style: none;
      font-size: 1.3em;
    }
    
    ol {
      counter-reset: item;
      
      li {
        position: relative;
        margin: 0.5em 0;
        padding-left: 0;
        display: flex;
        transition: all 0.3s ease;
        
        &::before {
          counter-increment: item;
          content: counter(item) ".";
          flex: 0 0 1.5em;
          margin-right: 0.5em;
          text-align: right;
          color: var(--theme-color);
          font-weight: bold;
          text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        &:hover {
          transform: translateX(10px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          &::before {
            color: rgb(0, 238, 255);
            text-shadow: 0 0 15px rgba(0, 238, 255, 0.8);
            transform: scale(1.2);
          }
        }
      }
    }
    
    ul li {
      position: relative;
      margin: 0.5em 0;
      padding-left: 2em;
      line-height: 1.5;
      transition: all 0.3s ease;
      
      &::before {
        content: '';
        position: absolute;
        left: 0.8em;
        top: 0.8em;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        background: var(--theme-color);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0, 168, 255, 0.5);
        transition: all 0.3s ease;
      }
    }
    
    ul li::after {
      content: '';
      position: absolute;
      left: 0.8em;
      top: 0.75em;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--theme-color);
      opacity: 0;
      pointer-events: none;
      animation: ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    @keyframes ripple {
      0% {
        transform: translateY(-50%) scale(1);
        opacity: 0;
      }
      25% {
        transform: translateY(-50%) scale(1.5);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-50%) scale(2);
        opacity: 0.3;
      }
      75% {
        transform: translateY(-50%) scale(2.5);
        opacity: 0.1;
      }
      100% {
        transform: translateY(-50%) scale(3);
        opacity: 0;
      }
    }

    ul li:hover {
      transform: translateX(10px);
      
      &::before {
        background: rgb(0, 238, 255);
        box-shadow: 0 0 15px rgba(0, 238, 255, 0.8);
      }
      
      &::after {
        border-color: rgba(0, 238, 255, 0.6);
      }
    }
  }

  .image-preview {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: zoom-out;

    .preview-content {
      max-width: 90%;
      max-height: 90%;
      position: relative;
      
      img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
      }
      
      .preview-actions {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        
        button {
          background: var(--theme-color);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'ZhuZiAWan', sans-serif;
          
          &:hover {
            background: rgba(0, 168, 255, 0.8);
          }
        }
      }
    }
  }

  .card-slider {
    width: 100%;
    /* max-width: 900px; */
    margin: 0px auto 20px;
    padding: 0 0px;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    margin-top: 30px;
    gap: 15px;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px 20px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
  }
  
  .slider-label {
    color: #fff;
    font-size: 1.2em;
    font-family: 'ZhuZiAWan', sans-serif;
  }
  
  .slider-value {
    color: var(--theme-color);
    min-width: 3em;
    text-align: right;
    font-family: 'Fira Code', monospace;
  }
  
  .slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--theme-color);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 168, 255, 0.5);
      
      &:hover {
        transform: scale(1.2);
        box-shadow: 0 0 15px rgba(0, 168, 255, 0.8);
      }
    }
  }

  .ai-summary {
    /* max-width: 900px; */
    width: 100%;
    margin: 30px auto 20px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(0, 168, 255, 0.2);
    font-family: 'ZhuZiAWan', sans-serif;
    transition: all 0.3s ease-in-out;
  }
  
  .summary-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--theme-color);
    justify-content: space-between;
  }
  
  .robot-icon {
    font-size: 1.5em;
    animation: float 3s ease-in-out infinite;
    color: #03A9F4;
    text-shadow: 0 0 10px rgba(3, 169, 244, 0.5);
    
    &:hover {
      color: #40C4FF;
      text-shadow: 0 0 15px rgba(3, 169, 244, 0.8);
    }
  }
  
  .summary-title {
    margin-right: auto;
    font-size: 1.2em;
    font-weight: bold;
  }

  .model-info {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .qwen-icon {
      width: 24px;
      height: 24px;
      filter: brightness(0) invert(1);
    }
  }

  .model-name {
    background-color: rgb(3, 129, 202);
    padding: 0px 12px 2px;
    border-radius: 20px;
    font-size: 1.3em;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: cursor;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.00);
      background-color: rgb(4, 144, 224);
    }
  }
  
  .model-icon {
    filter: brightness(0) invert(1);
    margin-right: 2px;
  }

  /* 分别设置不同模型的图标大小 */
  .model-name img[alt="DeepSeek"] {
    width: 32px;
    height: 32px;
  }

  .model-name img[alt="通义千问"] {
    width: 24px;
    height: 24px;
  }

  .swap-icon {
    cursor: pointer;
    font-size: 1.2em;
    color: #fff!important;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  .model-name:hover .swap-icon {
    opacity: 1;
  }
  
  .model-text {
    line-height: 1.6;
  }
  
  .summary-content {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 10px;
    line-height: 1.6;
    font-size: 1.1em;
    text-align: justify;
    min-height: 1.6em;
    overflow: hidden;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &::after {
      content: '|';
      animation: blink 1s infinite;
      opacity: 0;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes blink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  .generate-btn {
    background: rgba(0, 168, 255, 0.1);
    border: 1px solid rgba(0, 168, 255, 0.2);
    color: var(--theme-color);
    padding: 4px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s ease;
    font-family: 'ZhuZiAWan', sans-serif;
    
    &:hover:not(:disabled) {
      background: rgba(0, 168, 255, 0.2);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .iconify {
      font-size: 1.2em;
      
      &.mdi-loading {
        animation: spin 1s linear infinite;
      }
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .summary-content.generating {
    opacity: 0.5;
  }

  /* 给所有图标添加悬浮效果 */
  .iconify {
    color: #03A9F4;
    transition: all 0.3s ease;
    
    &:hover {
      filter: brightness(1.2);
      transform: scale(1.1);
    }
  }

  /* 侧边栏容器样式 */
  .quick-nav,
  .recent-articles {
    position: static;
    margin-bottom: 20px;
  }

  /* 确保子组件也不会产生滚动条 */
  :deep(.quick-nav),
  :deep(.recent-articles) {
    position: static;
    margin-bottom: 20px;
    height: auto;
  }

  /* 移除子组件内部可能的滚动 */
  :deep(.nav-list),
  :deep(.recent-list) {
    overflow: visible; /* 允许内容溢出 */
    max-height: none; /* 移除最大高度限制 */
  }
  </style>