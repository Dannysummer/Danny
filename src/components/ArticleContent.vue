<template>
    <!-- 文章 Banner -->
    <div class="article-banner" :style="{ backgroundImage: `url(${article.cover})` }">
      <div class="banner-overlay">
        <div class="banner-content">
          <h1 class="banner-title">{{ article.title }}</h1>
          <div class="banner-meta">
            <div class="meta-item">
              <Icon icon="mdi:calendar" />
              <span>发表于 {{ article.createTime }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:eye" />
              <span>阅读量 {{ article.views }}</span>
            </div>
            <div class="meta-item" v-if="article.category">
              <Icon icon="mdi:folder" />
              <span>分类: {{ article.category }}</span>
            </div>
            <div class="meta-item" v-if="article.tags?.length">
              <Icon icon="mdi:tag-multiple" />
              <span>标签: 
                <span v-for="tag in article.tags" :key="tag" class="banner-tag">
                  {{ tag }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="article-content">
      <!-- 文章内容 -->
      <div class="article-body">
        <div v-if="!renderedContent">Loading content...</div>
        <div class="markdown-content" v-html="renderedContent"></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import { Marked } from 'marked'
  import { markedHighlight } from 'marked-highlight'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/atom-one-dark.css'
  
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
      title: string
      createTime: string
      views: number
      content: string
      category?: string
      tags?: string[]
      cover: string
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

    // 添加复制按钮事件监听
    setTimeout(() => {
      document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const pre = (e.target as HTMLElement).closest('pre')
          if (pre) {
            const code = pre.querySelector('.code-content')?.textContent || ''
            copyCode(code)
          }
        })
      })
    }, 0)
  })
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      const button = event?.target as HTMLButtonElement
      const buttonEl = button.closest('.copy-button') as HTMLButtonElement
      buttonEl.classList.add('copied')
      buttonEl.innerHTML = '<i class="iconify" data-icon="material-symbols:check"></i>偷到啦 (｡>∀<｡)'
      setTimeout(() => {
        buttonEl.classList.remove('copied')
        buttonEl.innerHTML = '<i class="iconify" data-icon="material-symbols:content-copy-outline"></i>复制代码'
      }, 2000)
    })
  }
  </script>
  
  <style scoped>
  @font-face {
    font-family: 'ZhuZiAWan';
    src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
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
    max-width: 900px;
    width: 100%;
    text-align: center;
    color: #fff;
  }
  
  .banner-title {
    text-align: left;
    font-size: 2.5rem;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .banner-meta {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 0.95rem;
  }
  
  .banner-tag {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 4px;
    margin: 0 4px;
    backdrop-filter: blur(4px);
  }
  
  .article-content {
    max-width: 900px;
    margin: -60px auto 0;
    position: relative;
    z-index: 1;
    padding: 20px;
    background: rgba(255, 255, 255, 0.0);
    /* backdrop-filter: blur(10px); */
    border-radius: 12px;
  }
  
  .article-body {
    line-height: 1.8;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Markdown 样式 */
  :deep(.markdown-content) {
    color: #fff;
    line-height: 2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-family: 'ZhuZiAWan', sans-serif;
  
    h1, h2, h3, h4, h5, h6 {
      color: #fff;
      margin: 1.5em 0 1em;
      font-weight: 600;
      line-height: 1.4;
    }
  
    h1 {
      font-size: 2.5em;
      text-align: left;
    }
  
    h2 {
      font-size: 1.6em;
      padding-bottom: 0.5em;
      border-bottom: 1px solid var(--border-color);
      position: relative;
      
      &::before {
        content: "§";
        color: var(--theme-color);
        margin-right: 0.4em;
        font-size: 0.9em;
      }
    }
  
    p {
      margin: 1em 0;
      text-align: justify;
    }
  
    code {
      background: var(--code-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      margin: 0 0.2em;
    }
  
    pre {
      background: var(--code-block-bg);
      padding: 0;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
      position: relative;
      counter-reset: line;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--theme-color);
        box-shadow: 0 0 20px rgba(0,168,255,0.1);
      }
      
      .code-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 35px;
        background: rgba(52,53,65,0.95);
        border-radius: 8px 8px 0 0;
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
        color: #888;
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
        color: #888;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
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
          left: 0;
          width: 0;
          height: 1px;
          background: var(--theme-color);
          transition: all 0.3s ease;
          box-shadow: 0 0 8px var(--theme-color);
        }
        
        &:hover {
          color: var(--theme-color);
          
          &::after {
            width: 100%;
          }
        }
        
        &.copied {
          color: var(--theme-color);
          
          &::after {
            width: 100%;
            background: var(--theme-color);
          }
          
          .iconify {
            color: #00ff00;
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
    }
  
    blockquote {
      border-left: 4px solid var(--theme-color);
      padding-left: 1em;
      margin: 1em 0;
      background: var(--quote-bg);
      padding: 1em;
      border-radius: 4px;
      color: var(--quote-color);
      position: relative;
      
      &::before {
        content: "\201C";
        font-size: 2em;
        color: var(--theme-color);
        opacity: 0.2;
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
      
      th, td {
        border: 2px solid var(--border-color);
        padding: 8px;
        text-align: left;
      }
      
      th {
        background: var(--table-header-bg);
        font-weight: 600;
      }
      
      tr:nth-child(even) {
        background: var(--table-row-bg);
      }
    }
  
    ul, ol {
      padding-left: 1.5em;
      margin: 1em 0;
    }
    
    li {
      margin: 0.5em 0;
      position: relative;
    }
  }
  </style>