<template>
  <div class="article-editor">
    <div class="editor-header">
      <div class="left-actions">
        <button class="back-button" @click="goBack">
          <Icon icon="mdi:arrow-left" />
          <span>返回</span>
        </button>
        <h1 class="editor-title">{{ isNewArticle ? '创建文章' : '编辑文章' }}</h1>
      </div>
      <div class="right-actions">
        <button class="save-draft-button" @click="saveDraft">
          <Icon icon="mdi:content-save-outline" />
          <span>保存草稿</span>
        </button>
        <button class="publish-button" @click="publish">
          <Icon icon="mdi:publish" />
          <span>发布</span>
        </button>
      </div>
    </div>

    <div class="editor-body">
      <div class="editor-main">
        <!-- 基本信息部分 -->
        <div class="basic-info-section">
          <input 
            type="text" 
            v-model="article.title" 
            placeholder="请输入文章标题..." 
            class="title-input"
          />

          <div class="meta-inputs">
            <div class="form-group">
              <label>分类</label>
              <select v-model="article.categoryId">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>标签</label>
              <div class="tags-input">
                <div v-for="(tag, index) in article.tags" :key="index" class="tag-item">
                  {{ tag }}
                  <button class="remove-tag" @click="removeTag(index)">
                    <Icon icon="mdi:close" />
                  </button>
                </div>
                <input 
                  type="text" 
                  v-model="newTag" 
                  @keydown.enter="addTag" 
                  placeholder="输入标签按回车添加..." 
                  class="tag-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>摘要</label>
              <textarea 
                v-model="article.excerpt" 
                placeholder="请输入文章摘要..." 
                class="excerpt-input"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 编辑区和预览区 -->
        <div class="content-editor-section">
          <div class="editor-tabs">
            <button 
              class="tab-button" 
              :class="{ active: currentTab === 'edit' }" 
              @click="currentTab = 'edit'"
            >
              <Icon icon="mdi:pencil" />
              <span>编辑</span>
            </button>
            <button 
              class="tab-button" 
              :class="{ active: currentTab === 'split' }" 
              @click="currentTab = 'split'"
            >
              <Icon icon="mdi:view-split-horizontal" />
              <span>分屏</span>
            </button>
            <button 
              class="tab-button" 
              :class="{ active: currentTab === 'preview' }" 
              @click="currentTab = 'preview'"
            >
              <Icon icon="mdi:eye" />
              <span>预览</span>
            </button>
          </div>

          <div class="editor-container" :class="currentTab">
            <div class="edit-area" :class="{ 'hidden': currentTab === 'preview' }">
              <div class="toolbar">
                <button @click="insertFormat('# ', '')" title="标题1">
                  <Icon icon="mdi:format-header-1" />
                </button>
                <button @click="insertFormat('## ', '')" title="标题2">
                  <Icon icon="mdi:format-header-2" />
                </button>
                <button @click="insertFormat('### ', '')" title="标题3">
                  <Icon icon="mdi:format-header-3" />
                </button>
                <div class="separator"></div>
                <button @click="insertFormat('**', '**')" title="粗体">
                  <Icon icon="mdi:format-bold" />
                </button>
                <button @click="insertFormat('*', '*')" title="斜体">
                  <Icon icon="mdi:format-italic" />
                </button>
                <button @click="insertFormat('~~', '~~')" title="删除线">
                  <Icon icon="mdi:format-strikethrough" />
                </button>
                <div class="separator"></div>
                <button @click="insertFormat('[', '](url)')" title="链接">
                  <Icon icon="mdi:link" />
                </button>
                <button @click="insertFormat('![alt text](', ')')" title="图片">
                  <Icon icon="mdi:image" />
                </button>
                <div class="separator"></div>
                <button @click="insertFormat('- ', '')" title="无序列表">
                  <Icon icon="mdi:format-list-bulleted" />
                </button>
                <button @click="insertFormat('1. ', '')" title="有序列表">
                  <Icon icon="mdi:format-list-numbered" />
                </button>
                <button @click="insertFormat('> ', '')" title="引用">
                  <Icon icon="mdi:format-quote-open" />
                </button>
                <button @click="insertFormat('```\n', '\n```')" title="代码块">
                  <Icon icon="mdi:code-braces" />
                </button>
                <div class="separator"></div>
                <button @click="insertFormat('---\n', '')" title="分割线">
                  <Icon icon="mdi:minus" />
                </button>
                <button @click="insertFormat('| 表头 | 表头 |\n| --- | --- |\n| 内容 | 内容 |', '')" title="表格">
                  <Icon icon="mdi:table" />
                </button>
              </div>
              <textarea 
                ref="contentEditor"
                v-model="article.content" 
                @input="autoResize"
                @scroll="syncScroll"
                class="content-textarea" 
                placeholder="开始撰写文章内容..." 
              ></textarea>
            </div>
            <div class="preview-area" :class="{ 'hidden': currentTab === 'edit' }">
              <div class="markdown-content" v-html="renderedContent"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置侧边栏 -->
      <div class="editor-sidebar">
        <div class="settings-panel">
          <h3>文章设置</h3>
          
          <div class="form-group">
            <label>状态</label>
            <select v-model="article.status">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>封面图</label>
            <div class="cover-image-uploader">
              <div v-if="article.coverImage" class="cover-preview">
                <img :src="article.coverImage" alt="封面预览" />
                <button class="remove-cover" @click="removeCover">
                  <Icon icon="mdi:close" />
                </button>
              </div>
              <button v-else class="upload-cover-btn">
                <Icon icon="mdi:upload" />
                <span>上传封面图</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>发布时间</label>
            <input type="datetime-local" v-model="article.publishDate" />
          </div>
          
          <div class="form-group">
            <label>URL别名</label>
            <input type="text" v-model="article.slug" placeholder="文章的URL别名" />
          </div>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="allowComments" v-model="article.allowComments" />
            <label for="allowComments">允许评论</label>
          </div>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="sticky" v-model="article.sticky" />
            <label for="sticky">置顶文章</label>
          </div>
        </div>
        
        <!-- 分页设置 -->
        <div class="settings-panel">
          <h3>分页设置</h3>
          <div class="pagination-settings">
            <div class="form-group checkbox">
              <input type="checkbox" id="enablePagination" v-model="enablePagination" />
              <label for="enablePagination">启用分页</label>
            </div>
            
            <div v-if="enablePagination" class="pagination-controls">
              <button @click="addPageBreak" class="add-break-btn">
                <Icon icon="mdi:page-next" />
                <span>在光标处添加分页</span>
              </button>
              <div class="page-breaks-list">
                <p>当前分页数: {{ pageBreaks.length + 1 }}</p>
                <ul v-if="pageBreaks.length > 0">
                  <li v-for="(pos, index) in pageBreaks" :key="index">
                    第 {{ index + 1 }} 页 - 在第 {{ getLineNumber(pos) }} 行
                    <button @click="removePageBreak(index)" class="remove-break">
                      <Icon icon="mdi:close" />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import DOMPurify from 'dompurify';
// import { getArticleById, createArticle, updateArticle, uploadImage, type Article } from '../../services/article';

const router = useRouter();
const route = useRoute();

// 文章ID，如果有值表示编辑现有文章，否则是新建
const articleId = computed(() => {
  if (route.params.id === 'new') return 'new';
  return route.params.id ? Number(route.params.id) : null;
});
const isNewArticle = computed(() => !articleId.value || articleId.value === 'new');

// 分类数据
const categories = ref([
  { id: 1, name: '神经网络' },
  { id: 2, name: '机器学习' },
  { id: 3, name: '人工智能' },
  { id: 4, name: 'Web开发' },
  { id: 5, name: '性能优化' },
  { id: 6, name: '后端开发' },
  { id: 7, name: '其他' }
]);

// 添加isLoading状态变量
const isLoading = ref(false);

// 修改文章数据类型定义
const article = ref<{
  id: number | string | null;  // 允许字符串类型的ID
  title: string;
  content: string;
  excerpt: string;
  categoryId: number;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  coverImage: string;
  cover: string;
  publishDate: string;
  slug: string;
  allowComments: boolean;
  sticky: boolean;
  views: number;
  comments: number;
  createTime: string;
  updateTime: string;
  pageBreaks?: number[];  // 添加pageBreaks字段
}>({
  id: articleId.value,
  title: '',
  content: '',
  excerpt: '',
  categoryId: 1,
  category: '',
  tags: [] as string[],
  status: 'draft' as 'draft' | 'published',
  coverImage: '',
  cover: '', // 兼容原有数据结构
  publishDate: new Date().toISOString().slice(0, 16), // 格式化为yyyy-MM-ddThh:mm
  slug: '',
  allowComments: true,
  sticky: false,
  views: 0,
  comments: 0,
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString(),
  pageBreaks: []
});

// 标签输入
const newTag = ref('');

// 编辑器状态
const currentTab = ref('edit'); // edit, split, preview
const contentEditor = ref<HTMLTextAreaElement | null>(null);

// 分页设置
const enablePagination = ref(false);
const pageBreaks = ref<number[]>([]); // 保存分页断点的位置（字符索引）

// 保存状态
const isSaving = ref(false);

// 显示消息提示
const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
  alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
};

// 创建marked实例
const marked = new Marked({
  gfm: true,
  breaks: true,
}).use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlightedCode = hljs.highlight(code, { language }).value;
      const lines = highlightedCode.split('\n')
        .map(line => `<span class="hljs-line">${line}</span>`)
        .join('\n');
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
      `;
    }
  })
);

// 渲染Markdown为HTML
const renderedContent = computed(() => {
  try {
    // 使用marked将Markdown转换为HTML
    const html = marked.parse(article.value.content || '') as string;
    // 使用DOMPurify清理HTML，防止XSS攻击
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('渲染内容出错:', error);
    return '<p>渲染错误</p>';
  }
});

// 获取指定位置的行号
const getLineNumber = (position: number) => {
  const contentBefore = article.value.content.substring(0, position);
  return contentBefore.split('\n').length;
};

// 在光标位置插入格式化文本
const insertFormat = (prefix: string, suffix: string) => {
  if (!contentEditor.value) return;
  
  const textarea = contentEditor.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = article.value.content.substring(start, end);
  
  // 拼接新内容
  const newContent = article.value.content.substring(0, start) + 
                    prefix + selectedText + suffix + 
                    article.value.content.substring(end);
  
  article.value.content = newContent;
  
  // 设置光标位置到合适的位置
  nextTick(() => {
    textarea.focus();
    const newCursorPosition = start + prefix.length + selectedText.length + (selectedText ? 0 : suffix.length);
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

// 添加分页断点
const addPageBreak = () => {
  if (!contentEditor.value) return;
  
  const position = contentEditor.value.selectionStart;
  // 确保不重复添加
  if (!pageBreaks.value.includes(position)) {
    // 按位置排序
    pageBreaks.value.push(position);
    pageBreaks.value.sort((a, b) => a - b);
  }
};

// 移除分页断点
const removePageBreak = (index: number) => {
  pageBreaks.value.splice(index, 1);
};

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !article.value.tags.includes(tag)) {
    article.value.tags.push(tag);
    newTag.value = '';
  }
};

// 移除标签
const removeTag = (index: number) => {
  article.value.tags.splice(index, 1);
};

// 移除封面图
const removeCover = () => {
  article.value.coverImage = '';
};

// 返回上一页
const goBack = () => {
  router.push('/admin/articles');
};

// 自动调整文本区域高度
const autoResize = () => {
  if (!contentEditor.value) return;
  
  contentEditor.value.style.height = 'auto';
  contentEditor.value.style.height = `${contentEditor.value.scrollHeight}px`;
};

// 同步滚动编辑区和预览区
const syncScroll = (e: Event) => {
  if (currentTab.value !== 'split' || !contentEditor.value) return;
  
  const target = e.target as HTMLTextAreaElement;
  const previewArea = document.querySelector('.preview-area');
  if (!previewArea) return;
  
  const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
  previewArea.scrollTop = percentage * (previewArea.scrollHeight - previewArea.clientHeight);
};

// 保存草稿
const saveDraft = async () => {
  article.value.status = 'draft';
  await saveArticle();
};

// 发布文章
const publish = async () => {
  article.value.status = 'published';
  await saveArticle();
};

// 保存文章
const saveArticle = async (status?: 'published' | 'draft') => {
  if (!article.value.title.trim()) {
    showMessage('请输入文章标题', 'error');
    return;
  }
  
  try {
    isSaving.value = true;
    
    // 如果传入了状态参数，则更新文章状态
    if (status) {
      article.value.status = status;
    }
    
    // 保存分页断点
    if (enablePagination.value) {
      article.value.pageBreaks = pageBreaks.value;
    } else {
      article.value.pageBreaks = [];
    }
    
    const API_BASE_URL = 'http://localhost:8088/api';
    const method = article.value.id && article.value.id !== 'new' ? 'PUT' : 'POST';
    const endpoint = article.value.id && article.value.id !== 'new' 
      ? `${API_BASE_URL}/articleDraftSave/${article.value.id}` 
      : `${API_BASE_URL}/articleDraftSave`;
    
    const response = await fetch(endpoint, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Referer': 'https://www.dannysummer.asia'
      },
      body: JSON.stringify(article.value)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '保存失败');
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      // 更新文章ID（如果是新创建的文章）
      if (!article.value.id || article.value.id === 'new') {
        article.value.id = result.data.id;
        // 更新URL以反映文章ID
        router.replace(`/admin/article-editor/${result.data.id}`);
      }
      
      showMessage('文章保存成功');
    } else {
      throw new Error(result.message || '保存失败');
    }
  } catch (error) {
    console.error('保存文章失败:', error);
    showMessage('保存失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
  } finally {
    isSaving.value = false;
  }
};

// 修改loadArticle方法以使用API代理接口
const loadArticle = async () => {
  if (!articleId.value || articleId.value === 'new') {
    // 创建新文章，不需要加载数据
    return;
  }

  try {
    isLoading.value = true;
    const API_BASE_URL = 'http://localhost:8088/api';
    
    // 获取文章基本信息
    const response = await fetch(`${API_BASE_URL}/article/${articleId.value}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Referer': 'https://www.dannysummer.asia'
      }
    });
    
    if (!response.ok) {
      throw new Error('获取文章失败');
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      // 更新文章数据
      article.value = {
        ...article.value,
        ...result.data,
        publishDate: new Date(result.data.createdAt || result.data.createTime || new Date())
          .toISOString().slice(0, 16), // 格式化为yyyy-MM-ddThh:mm
        tags: result.data.tags || [],
      };
      
      // 如果有分页断点数据，则开启分页
      if (result.data.pageBreaks && result.data.pageBreaks.length > 0) {
        pageBreaks.value = result.data.pageBreaks;
        enablePagination.value = true;
      }

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
          reader.onload = () => {
            article.value.content = reader.result as string;
          };
          reader.readAsText(blob, 'utf-8');
        } else {
          console.error('加载文章内容失败:', contentResponse.statusText);
          showMessage('加载文章内容失败', 'error');
        }
      } catch (error) {
        console.error('加载文章内容失败:', error);
        showMessage('加载文章内容失败', 'error');
      }
    } else {
      throw new Error(result.message || '获取文章失败');
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    showMessage('加载文章失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadArticle();
  nextTick(() => {
    autoResize();
    
    // 添加代码复制按钮功能
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const copyButton = target.closest('.copy-button');
      if (copyButton) {
        const codeBlock = copyButton.closest('pre');
        if (codeBlock) {
          const codeContent = codeBlock.querySelector('.code-content');
          if (codeContent) {
            // 获取代码内容，去除行号
            const code = Array.from(codeContent.querySelectorAll('.hljs-line'))
              .map(line => line.textContent || '')
              .join('\n');
            
            // 复制到剪贴板
            navigator.clipboard.writeText(code).then(() => {
              // 显示复制成功动画
              copyButton.classList.add('copied');
              const spanElement = copyButton.querySelector('span');
              if (spanElement) {
                spanElement.textContent = '已复制';
              }
              
              // 3秒后恢复
              setTimeout(() => {
                copyButton.classList.remove('copied');
                const spanElement = copyButton.querySelector('span');
                if (spanElement) {
                  spanElement.textContent = '复制代码';
                }
              }, 3000);
            });
          }
        }
      }
    });
  });
});
</script>

<style scoped>
@font-face {
  font-family: 'ZhuZiAWan';
  src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.article-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 15px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button,
.save-draft-button,
.publish-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.back-button {
  background-color: #f0f0f0;
  color: #333;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.save-draft-button {
  background-color: #f8f9fa;
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.save-draft-button:hover {
  background-color: #eaf2fd;
}

.publish-button {
  background-color: #4a90e2;
  color: white;
}

.publish-button:hover {
  background-color: #3a7bc8;
}

.editor-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.editor-body {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
}

.editor-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-sidebar {
  width: 320px;
  overflow-y: auto;
}

.basic-info-section {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.title-input {
  width: 100%;
  padding: 15px 0;
  font-size: 24px;
  font-weight: 600;
  border: none;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  outline: none;
  background-color: transparent;
}

.meta-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  background-color: white;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group.checkbox input {
  margin: 0;
}

.form-group.checkbox label {
  margin-bottom: 0;
  cursor: pointer;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background-color: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.remove-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.tag-input {
  border: none !important;
  padding: 5px 8px !important;
  background-color: transparent !important;
  flex-grow: 1;
  min-width: 120px;
  outline: none;
}

.tag-input:focus {
  box-shadow: none !important;
}

.content-editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.editor-tabs {
  display: flex;
  gap: 5px;
  padding: 15px 20px 0;
  border-bottom: 1px solid #eee;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #4a90e2;
}

.tab-button.active {
  background-color: #f0f7ff;
  color: #4a90e2;
  border-bottom: 2px solid #4a90e2;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-container.edit .edit-area {
  width: 100%;
}

.editor-container.preview .preview-area {
  width: 100%;
}

.editor-container.split .edit-area,
.editor-container.split .preview-area {
  width: 50%;
}

.edit-area,
.preview-area {
  height: 100%;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.edit-area.hidden,
.preview-area.hidden {
  display: none;
}

.edit-area {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar button:hover {
  background-color: #f0f7ff;
  color: #4a90e2;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: #eee;
  margin: 0 5px;
}

.content-textarea {
  flex: 1;
  width: 100%;
  border: none;
  padding: 20px;
  font-family: 'Roboto Mono', monospace, system-ui;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  outline: none;
  min-height: 300px;
}

.preview-area {
  padding: 20px;
  overflow-y: auto;
}

/* Markdown 样式与文章内容预览保持一致 */
:deep(.markdown-content) {
  color: #333;
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
    color: #333;
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
    border-bottom: 2px solid var(--border-color, #eee);
    position: relative;
    border-radius: 1px;
    
    &::before {
      content: "§";
      color: var(--theme-color, #4a90e2);
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
      border-color: var(--theme-color, #4a90e2);
      box-shadow: 0 0 20px rgba(0,168,255,0.1);
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
      background: var(--theme-color, #4a90e2);
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
    padding: 2px 6px;
    border-radius: 8px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    margin: 0 0.2em;
    background: rgba(0, 0, 0, 0.05);
  }

  pre {
    background: var(--code-block-bg, #f6f8fa);
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
        background: var(--theme-color, #4a90e2);
      }
    }
    
    &:hover {
      border-color: var(--theme-color, #4a90e2);
      box-shadow: 0 0 20px rgba(0,168,255,0.1);
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
      color: var(--theme-color, #4a90e2);
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
        background: var(--theme-color, #4a90e2);
        transition: all 0.3s ease;
        box-shadow: 0 0 8px var(--theme-color, #4a90e2);
      }
      
      &:hover {
        color: var(--theme-color, #4a90e2);
        
        &::after {
          border-radius: 2px;
          width: 82%;
        }
      }
      
      &.copied {
        color: var(--theme-color, #4a90e2);
        
        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9em;
        }
        
        &::after {
          width: 100%;
          background: var(--theme-color, #4a90e2);
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

/* 暗色主题适配 */
:root[class='dark-theme'] .article-editor {
  background-color: #1e1e1e;
}

:root[class='dark-theme'] .editor-title {
  color: #f0f0f0;
}

:root[class='dark-theme'] .basic-info-section,
:root[class='dark-theme'] .content-editor-section,
:root[class='dark-theme'] .settings-panel {
  background-color: #2d2d2d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

:root[class='dark-theme'] .title-input {
  color: #f0f0f0;
  border-bottom-color: #444;
}

:root[class='dark-theme'] .form-group label {
  color: #e0e0e0;
}

:root[class='dark-theme'] .form-group input[type="text"],
:root[class='dark-theme'] .form-group select,
:root[class='dark-theme'] .form-group textarea,
:root[class='dark-theme'] .tags-input {
  background-color: #333;
  border-color: #444;
  color: #e0e0e0;
}

:root[class='dark-theme'] .tag-input {
  color: #e0e0e0;
}

:root[class='dark-theme'] .form-group input[type="text"]:focus,
:root[class='dark-theme'] .form-group select:focus,
:root[class='dark-theme'] .form-group textarea:focus {
  background-color: #383838;
  border-color: #4a90e2;
}

:root[class='dark-theme'] .tab-button {
  color: #aaa;
}

:root[class='dark-theme'] .tab-button.active {
  background-color: #2a3b50;
  color: #7ab5ff;
}

:root[class='dark-theme'] .toolbar {
  background-color: #333;
  border-bottom-color: #444;
}

:root[class='dark-theme'] .content-textarea {
  background-color: #2d2d2d;
  color: #e0e0e0;
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
    
    .code-header {
      background-color: rgba(0, 80, 115, 0.89);
    }
    
    .code-content::before {
      border-color: #444;
    }
    
    .hljs-line::before {
      color: #777;
    }
  }

  blockquote {
    background-color: rgba(255, 255, 255, 0.05);
    color: #aaa;
  }

  table {
    background-color: #222;
    border-color: #333;
  }

  table th, table td {
    border-color: #333;
  }

  table th {
    background-color: rgba(74, 144, 226, 0.2);
  }

  table tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.03);
  }
}

@media (max-width: 1200px) {
  .editor-body {
    flex-direction: column;
  }

  .editor-main {
    height: calc(100vh - 140px - 400px);
    min-height: 500px;
  }

  .editor-sidebar {
    width: 100%;
    height: 350px;
    overflow-y: auto;
  }

  .meta-inputs {
    grid-template-columns: 1fr;
  }
}

/* 添加复制提示的样式 */
.copy-tip {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  animation: fade-in-out 2s forwards;
}

@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(-20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
</style> 