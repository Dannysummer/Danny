<template>
  <div class="article-content-container">
    <div class="article-header">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <div class="meta-item">
          <Icon icon="mdi:calendar" />
          <span>{{ formatDate(article.publishDate) }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:folder" />
          <span>{{ article.category }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:eye" />
          <span>{{ article.views }} 阅读</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:comment" />
          <span>{{ article.comments }} 评论</span>
        </div>
      </div>
      <div class="article-tags">
        <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    
    <div class="article-body">
      <div class="markdown-content" v-html="renderedContent"></div>
    </div>
    
    <div class="article-footer">
      <div class="pagination-controls" v-if="pages.length > 1">
        <div class="pagination-info">{{ currentPage }}/{{ pages.length }}</div>
        <div class="page-buttons">
          <button 
            class="page-btn" 
            @click="prevPage" 
            :disabled="currentPage <= 1"
            title="上一页"
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          <button 
            v-for="page in pages.length" 
            :key="page"
            class="page-btn" 
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button 
            class="page-btn" 
            @click="nextPage" 
            :disabled="currentPage >= pages.length"
            title="下一页"
          >
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
      </div>
      <div class="article-actions">
        <button class="action-btn" @click="goBack">
          <Icon icon="mdi:arrow-left" />
          <span>返回</span>
        </button>
        <button class="action-btn" @click="editArticle">
          <Icon icon="mdi:pencil" />
          <span>编辑</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { config } from '../../config/index'

const router = useRouter();
const route = useRoute();

// 文章ID
const articleId = computed(() => route.params.id ? Number(route.params.id) : null);

// 文章数据
const article = ref({
  id: null,
  title: '',
  content: '',
  author: '',
  category: '',
  publishDate: new Date(),
  views: 0,
  likes: 0,
  fileUrl: '',
  filePath: '',
  fileSize: 0,
  comments: 0,
  tags: [] as string[],
  pageBreaks: [] as number[]
});

// 渲染Markdown为HTML
const renderedContent = computed(() => {
  try {
    // 使用当前页的内容
    const html = marked.parse(currentPageContent.value || '') as string;
    // 使用DOMPurify清理HTML，防止XSS攻击
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('渲染内容出错:', error);
    return '<p>渲染错误</p>';
  }
});

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 返回上一页
const goBack = () => {
  router.push('/admin/articles');
};

// 编辑文章
const editArticle = () => {
  router.push(`/admin/article-editor/${articleId.value}`);
};

// 加载文章数据
const loadArticle = async () => {
  if (!articleId.value) {
    router.push('/admin/articles');
    return;
  }
  
  try {
    isLoading.value = true;
    
    // 从后端API获取文章数据
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/article/${articleId.value}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Referer': 'https://www.dannysummer.asia'
      }
    });
    
    if (!response.ok) {
      throw new Error('加载文章失败');
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      // 更新基本文章数据
      article.value = {
        ...article.value,
        ...result.data,
        publishDate: new Date(result.data.createdAt || result.data.createTime || new Date())
      };
      
      // 使用代理接口获取文章内容
      try {
        const contentResponse = await fetch(`${API_BASE_URL}/article/content/${articleId.value}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Referer': 'https://www.dannysummer.asia',
            'Accept': 'text/plain; charset=utf-8'
          }
        });
        
        if (contentResponse.ok) {
          // 确保以UTF-8方式处理响应
          const blob = await contentResponse.blob();
          const reader = new FileReader();
          reader.onload = (e) => {
            article.value.content = e.target?.result as string || '';
          };
          reader.readAsText(blob, 'utf-8');
        } else {
          console.error('加载文章内容失败:', contentResponse.statusText);
          alert('加载文章内容失败');
        }
      } catch (error) {
        console.error('加载文章内容失败:', error);
        alert('加载文章内容失败');
      }
    } else {
      throw new Error(result.message || '加载文章失败');
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    alert('加载文章失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

// 初始化时加载文章
const isLoading = ref(false);

// 分页数据，将文章内容按照分页断点分割
const pages = computed(() => {
  const content = article.value.content;
  const pageBreaks = article.value.pageBreaks || [];
  
  if (!pageBreaks || pageBreaks.length === 0) {
    return [content];
  }
  
  const result = [];
  let startPos = 0;
  
  for (const breakPos of pageBreaks) {
    result.push(content.substring(startPos, breakPos));
    startPos = breakPos;
  }
  
  result.push(content.substring(startPos));
  return result;
});

// 当前页码
const currentPage = ref(1);

// 当前页的内容
const currentPageContent = computed(() => {
  if (pages.value.length === 0) return '';
  return pages.value[currentPage.value - 1] || '';
});

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo(0, 0);
  }
};

// 下一页
const nextPage = () => {
  if (currentPage.value < pages.value.length) {
    currentPage.value++;
    window.scrollTo(0, 0);
  }
};

onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
@font-face {
  font-family: 'ZhuZiAWan';
  src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.article-content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'ZhuZiAWan', sans-serif;
}

.article-header {
  margin-bottom: 40px;
  text-align: center;
}

.article-title {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.article-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.tag {
  background-color: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.article-body {
  margin-bottom: 40px;
}

/* Markdown 样式与前台组件保持一致 */
:deep(.markdown-content) {
  color: #333;
  line-height: 2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: 'ZhuZiAWan', sans-serif;

  strong {
    font-weight: 900;
    color: rgb(0, 157, 184);
    text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
    display: inline-block;
    transition: all 0.3s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &:hover {
      color: rgb(0, 168, 184);
      text-shadow: 0 0 8px rgb(0, 170, 255);
    }
  }

  b {
    font-weight: 900;
    color: rgb(0, 157, 184);
    text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #333;
    margin: 0.1em 0 1em;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 {
    font-size: 2.5rem;
    text-align: left;
  }

  h2 {
    font-size: 2.2em;
    padding-bottom: 0.2em;
    border-bottom: 2px solid #eee;
    position: relative;
    border-radius: 1px;
    
    &::before {
      content: "§";
      color: #4a90e2;
      margin-right: 0.4rem;
      font-size: 0.9em;
      display: inline-block;
      transition: all 0.3s ease;
    }

    &:hover::before {
      transform: rotate(180deg) translateY(-5px);
      color: rgb(0, 168, 184);
      text-shadow: 0 0 8px rgb(0, 170, 255);
    }
  }

  h3 {
    font-size: 1.8rem;
    margin: 1em 0;
    text-align: justify;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
      content: "";
      margin-top: 4px;
      width: 6px;
      height: 20px;
      background: #4a90e2;
      border-radius: 2px;
      display: inline-block;
      transition: all 0.3s ease;
    }
    
    &:hover::before {
      height: 25px;
      background: rgb(0, 168, 184);
      box-shadow: 0 0 8px rgb(0, 170, 255);
    }
  }

  h4 {
    font-size: 1.6rem;
    margin: 1em 0;
    text-align: justify;
  }

  h5 {
    font-size: 1.4rem;
    margin: 1em 0;
    text-align: justify;
  }

  h6 {
    font-size: 1.2rem;
    margin: 1em 0;
    text-align: justify;
  }

  p {
    font-size: 1.2rem;
    margin: 1.5em 0;
    text-align: justify;
    line-height: 1.6;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    margin: 0 0.2em;
  }

  pre {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
    position: relative;
    counter-reset: line;
    border: 1px solid rgba(0,0,0,0.05);
    transition: all 0.3s ease-in-out;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      
      &:hover {
        background: #4a90e2;
      }
    }
    
    &:hover {
      border-color: #4a90e2;
      box-shadow: 0 0 20px rgba(74, 144, 226, 0.1);
    }
    
    .code-header {
      background: rgba(74, 144, 226, 0.1);
      padding: 8px 16px;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'ZhuZiAWan', sans-serif;
    }
    
    code {
      background: transparent;
      padding: 0;
      font-family: 'Fira Code', monospace;
    }
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    display: block;
    margin: 1em auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }

  blockquote {
    border-left: 4px solid #4a90e2;
    padding-left: 1em;
    margin: 1em 0;
    background: rgba(74, 144, 226, 0.05);
    padding: 1em;
    border-radius: 4px;
    color: #666;
    position: relative;
    
    &::before {
      content: "\201C";
      font-size: 2em;
      color: #4a90e2;
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 8px;
    }
  }

  a {
    color: #4a90e2;
    text-decoration: none;
    border-bottom: 1px dashed rgba(74, 144, 226, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      border-bottom-style: solid;
      color: #3a7ab8;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #eee;
    
    th, td {
      border: 1px solid #eee;
      padding: 8px;
      text-align: left;
      transition: all 0.3s ease;
    }
    
    th {
      background: rgba(74, 144, 226, 0.1);
      font-weight: 600;
      color: #4a90e2;
    }
    
    tr {
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(74, 144, 226, 0.05);
      }
    }
    
    tr:nth-child(even) {
      background: rgba(0, 0, 0, 0.02);
      
      &:hover {
        background: rgba(74, 144, 226, 0.05);
      }
    }
  }

  ul, ol {
    padding-left: 2em;
    margin: 0.8em 0;
    list-style: none;
    font-size: 1.2em;
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
        color: #4a90e2;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      
      &:hover {
        transform: translateX(10px);
        
        &::before {
          color: #3a7ab8;
          transform: scale(1.1);
        }
      }
    }
  }
  
  ul li {
    position: relative;
    margin: 0.5em 0;
    padding-left: 1.5em;
    line-height: 1.5;
    transition: all 0.3s ease;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.6em;
      width: 8px;
      height: 8px;
      background: #4a90e2;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    &:hover {
      transform: translateX(10px);
      
      &::before {
        background: #3a7ab8;
        box-shadow: 0 0 5px rgba(74, 144, 226, 0.5);
      }
    }
  }
}

.article-footer {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
  margin-right: 10px;
}

.page-buttons {
  display: flex;
  gap: 5px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn.active {
  background-color: #4a90e2;
  border-color: #4a90e2;
  color: white;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f7ff;
  border-color: #4a90e2;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.article-actions {
  display: flex;
  justify-content: space-between;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #e0e0e0;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .article-title {
  color: #f0f0f0;
}

:root[class='dark-theme'] .article-meta {
  color: #aaa;
}

:root[class='dark-theme'] .tag {
  background-color: rgba(74, 144, 226, 0.2);
  color: #7ab5ff;
}

:root[class='dark-theme'] :deep(.markdown-content) {
  color: #e0e0e0;

  h1, h2, h3, h4, h5, h6 {
    color: #f0f0f0;
  }

  h2 {
    border-bottom-color: #333;
  }

  code {
    background-color: rgba(255, 255, 255, 0.1);
  }

  pre {
    background-color: #2d2d2d;
    border-color: #333;
  }

  blockquote {
    background-color: rgba(255, 255, 255, 0.05);
    color: #aaa;
  }

  table {
    background: #222;
    border-color: #333;
  }

  table th, table td {
    border-color: #333;
  }

  table th {
    background-color: rgba(74, 144, 226, 0.2);
  }

  table tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
  }
}

:root[class='dark-theme'] .action-btn {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

:root[class='dark-theme'] .action-btn:hover {
  background-color: #3d3d3d;
}

:root[class='dark-theme'] .page-btn {
  background-color: #2d2d2d;
  border-color: #444;
  color: #e0e0e0;
}

:root[class='dark-theme'] .page-btn.active {
  background-color: #4a90e2;
  border-color: #4a90e2;
}

:root[class='dark-theme'] .page-btn:hover:not(:disabled) {
  background-color: #3d3d3d;
}
</style> 