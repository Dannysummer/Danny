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
        <button class="save-draft-button" @click="saveDraft" :disabled="isSaving" title="快捷键: Ctrl+S">
          <Icon icon="mdi:content-save-outline" />
          <span>{{ isSaving ? '保存中...' : '保存草稿' }}</span>
        </button>
        <button class="full-update-button" @click="fullUpdateArticle" :disabled="isSaving" title="完整更新所有字段 (快捷键: Ctrl+Shift+U)">
          <Icon icon="mdi:update" />
          <span>{{ isSaving ? '更新中...' : '完整更新' }}</span>
        </button>
        <button class="publish-button" @click="publish" :disabled="isSaving" title="快捷键: Ctrl+Shift+P">
          <Icon icon="mdi:publish" />
          <span>{{ isSaving ? '发布中...' : '发布' }}</span>
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
            <label>封面图</label>
            <div class="cover-image-uploader">
              <div v-if="article.coverImage" class="cover-preview">
                <img :src="article.coverImage" alt="封面预览" />
                <div class="cover-overlay">
                  <button class="change-cover-btn" @click="selectCoverImage">
                    <Icon icon="mdi:camera" />
                    <span>更换</span>
                  </button>
                  <button class="remove-cover-btn" @click="removeCover">
                    <Icon icon="mdi:delete" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
              <div v-else class="cover-upload-area" 
                   @click="selectCoverImage"
                   @dragover.prevent="handleCoverDragOver"
                   @dragleave.prevent="handleCoverDragLeave"
                   @drop.prevent="handleCoverDrop"
                   :class="{ 'dragging': coverDragging }">
                <Icon icon="mdi:image-plus" class="upload-icon" />
                <span>上传封面图</span>
                <small>支持拖拽或点击上传</small>
              </div>
              
              <!-- 上传进度 -->
              <div v-if="coverUploadProgress.show" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: coverUploadProgress.percentage + '%' }"></div>
                </div>
                <span class="progress-text">{{ Math.round(coverUploadProgress.percentage) }}%</span>
              </div>
              
              <!-- 隐藏的文件输入 -->
              <input 
                type="file" 
                ref="coverFileInput" 
                @change="handleCoverFileSelect" 
                accept="image/*" 
                style="display: none"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <div class="status-selector">
              <label class="status-option" :class="{ active: article.status === 'draft' }">
                <input type="radio" v-model="article.status" value="draft" />
                <div class="status-indicator draft"></div>
                <div class="status-info">
                  <span class="status-name">草稿</span>
                  <small>仅自己可见</small>
                </div>
              </label>
              <label class="status-option" :class="{ active: article.status === 'published' }">
                <input type="radio" v-model="article.status" value="published" />
                <div class="status-indicator published"></div>
                <div class="status-info">
                  <span class="status-name">已发布</span>
                  <small>公开可见</small>
                </div>
              </label>
              <label class="status-option" :class="{ active: article.status === 'archived' }">
                <input type="radio" v-model="article.status" value="archived" />
                <div class="status-indicator archived"></div>
                <div class="status-info">
                  <span class="status-name">已归档</span>
                  <small>隐藏状态</small>
                </div>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>发布时间</label>
            <div class="publish-date-group">
              <input type="datetime-local" v-model="article.publishDate" />
              <button type="button" class="set-now-btn" @click="setCurrentTime">
                <Icon icon="mdi:clock" />
                <span>现在</span>
              </button>
            </div>
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
import { config } from '../../config/index'
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
  status: 'draft' | 'published' | 'archived';
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

// 封面图上传相关
const coverFileInput = ref<HTMLInputElement | null>(null);
const coverDragging = ref(false);
const coverUploadProgress = ref({
  show: false,
  percentage: 0
});

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

// 选择封面图
const selectCoverImage = () => {
  coverFileInput.value?.click();
};

// 处理封面图文件选择
const handleCoverFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    uploadCoverImage(file);
  }
};

// 处理封面图拖拽
const handleCoverDragOver = (event: DragEvent) => {
  event.preventDefault();
  coverDragging.value = true;
};

const handleCoverDragLeave = (event: DragEvent) => {
  event.preventDefault();
  coverDragging.value = false;
};

const handleCoverDrop = (event: DragEvent) => {
  event.preventDefault();
  coverDragging.value = false;
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
      uploadCoverImage(file);
    } else {
      showMessage('请选择图片文件', 'error');
    }
  }
};

// 上传封面图
const uploadCoverImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    showMessage('请选择图片文件', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showMessage('图片大小不能超过10MB', 'error');
    return;
  }

  try {
    coverUploadProgress.value = { show: true, percentage: 0 };
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');
    
    const API_BASE_URL = config.api.apiUrl;
    
    // 尝试使用进度监控端点
    const response = await fetch(`${API_BASE_URL}/image/upload-with-progress`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Referer': 'https://www.dannysummer.asia'
      },
      body: formData
    });

    if (!response.ok) {
      // 如果进度监控端点失败，尝试使用普通上传端点
      console.log('进度监控端点失败，尝试普通上传端点');
      const fallbackResponse = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Referer': 'https://www.dannysummer.asia'
        },
        body: formData
      });

      if (!fallbackResponse.ok) {
        throw new Error('上传失败');
      }

      const fallbackResult = await fallbackResponse.json();
      if (fallbackResult.success || fallbackResult.code === 200) {
        // 处理批量上传的返回结果
        const uploadedImages = fallbackResult.data;
        if (uploadedImages && uploadedImages.length > 0) {
          article.value.coverImage = uploadedImages[0].url;
          showMessage('封面图上传成功');
        } else {
          throw new Error('上传结果为空');
        }
      } else {
        throw new Error(fallbackResult.message || '上传失败');
      }
    } else {
      const result = await response.json();
      if (result.success || result.code === 200) {
        article.value.coverImage = result.data.url;
        showMessage('封面图上传成功');
      } else {
        throw new Error(result.message || '上传失败');
      }
    }
  } catch (error) {
    console.error('上传封面图失败:', error);
    showMessage('上传失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
  } finally {
    coverUploadProgress.value.show = false;
    if (coverFileInput.value) {
      coverFileInput.value.value = '';
    }
  }
};

// 设置当前时间
const setCurrentTime = () => {
  article.value.publishDate = new Date().toISOString().slice(0, 16);
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
  if (!article.value.title.trim()) {
    showMessage('请输入文章标题', 'error');
    return;
  }

  try {
    isSaving.value = true;
    const API_BASE_URL = config.api.apiUrl;
    
    // 准备文章数据
    const articleData: any = {
      title: article.value.title,
      content: article.value.content,
      excerpt: article.value.excerpt || '',
      categoryId: article.value.categoryId,
      tags: article.value.tags,
      coverImage: article.value.coverImage,
      slug: article.value.slug,
      allowComments: article.value.allowComments,
      sticky: article.value.sticky,
      status: 'DRAFT', // 明确设置为草稿状态
      publishDate: article.value.publishDate
    };

    // 如果是编辑现有文章，添加ID
    if (article.value.id && article.value.id !== 'new') {
      articleData.id = article.value.id;
    }

    const response = await fetch(`${API_BASE_URL}/article`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '保存草稿失败' }));
      throw new Error(errorData.message || '保存草稿失败');
    }

    const result = await response.json();
    
    if (result.success || result.code === 200) {
      showMessage('草稿保存成功');
      if (result.data && result.data.id) {
        article.value.id = result.data.id;
        article.value.status = 'draft';
        // 更新路由参数，避免重复创建
        if (route.params.id === 'new') {
          router.replace(`/admin/article-editor/${result.data.id}`);
        }
      }
    } else {
      throw new Error(result.message || '保存草稿失败');
    }
  } catch (error) {
    console.error('保存草稿失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    showMessage(`保存草稿失败: ${errorMessage}`, 'error');
  } finally {
    isSaving.value = false;
  }
};

// 发布文章
const publish = async () => {
  // 验证必填字段
  if (!article.value.title.trim()) {
    showMessage('请输入文章标题', 'error');
    return;
  }
  
  if (!article.value.content.trim()) {
    showMessage('请输入文章内容', 'error');
    return;
  }

  // 如果是新文章，先保存草稿
  if (!article.value.id || article.value.id === 'new') {
    await saveDraft();
  }

  if (!article.value.id || article.value.id === 'new') {
    showMessage('请先保存草稿后再发布', 'error');
    return;
  }

  try {
    isSaving.value = true;
    const API_BASE_URL = config.api.apiUrl;
    
    // 准备完整的文章数据 - 强制更新所有字段
    const completeArticleData = {
      title: article.value.title,
      content: article.value.content,
      excerpt: article.value.excerpt || '',
      categoryId: article.value.categoryId,
      tags: article.value.tags, // 支持数组格式
      coverImage: article.value.coverImage,
      slug: article.value.slug,
      allowComments: article.value.allowComments,
      sticky: article.value.sticky,
      publishDate: article.value.publishDate,
      // 新增字段
      description: article.value.excerpt || '',
      category: getCategoryName(article.value.categoryId),
      cover: article.value.coverImage,
      license: 'CC_BY_NC_SA_4_0', // 默认协议
      isFeatured: article.value.sticky || false,
      // 分页信息
      pageBreaks: enablePagination.value ? pageBreaks.value : []
    };
    
    // 使用新的发布接口 - 强制更新所有字段
    const response = await fetch(`${API_BASE_URL}/article/${article.value.id}/publish`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeArticleData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '发布文章失败' }));
      throw new Error(errorData.message || '发布文章失败');
    }

    const result = await response.json();
    
    if (result.success || result.code === 200) {
      showMessage('文章发布成功 - 已完整更新所有字段');
      article.value.status = 'published';
      // 更新本地数据
      if (result.data) {
        Object.assign(article.value, {
          ...result.data,
          status: 'published',
          updateTime: new Date().toISOString()
        });
      }
    } else {
      throw new Error(result.message || '发布文章失败');
    }
  } catch (error) {
    console.error('发布文章失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    showMessage(`发布文章失败: ${errorMessage}`, 'error');
  } finally {
    isSaving.value = false;
  }
};

// 通用保存文章函数 (支持完整更新和部分更新)
const saveArticle = async (status?: 'PUBLISHED' | 'DRAFT', fullUpdate: boolean = false) => {
  if (!article.value.title.trim()) {
    showMessage('请输入文章标题', 'error');
    return;
  }
  
  try {
    isSaving.value = true;
    
    const API_BASE_URL = config.api.apiUrl;
    
    // 准备文章数据
    const articleData: any = {
      title: article.value.title,
      content: article.value.content,
      excerpt: article.value.excerpt || '',
      categoryId: article.value.categoryId,
      tags: article.value.tags,
      coverImage: article.value.coverImage,
      slug: article.value.slug,
      allowComments: article.value.allowComments,
      sticky: article.value.sticky,
      publishDate: article.value.publishDate,
      // 新增字段
      description: article.value.excerpt || '',
      category: getCategoryName(article.value.categoryId),
      cover: article.value.coverImage,
      license: 'CC_BY_NC_SA_4_0',
      isFeatured: article.value.sticky || false
    };
    
    // 设置状态
    if (status) {
      articleData.status = status;
    } else {
      articleData.status = article.value.status === 'published' ? 'PUBLISHED' : 'DRAFT';
    }
    
    // 添加分页信息
    if (enablePagination.value) {
      articleData.pageBreaks = pageBreaks.value;
    }
    
    const isNewArticle = !article.value.id || article.value.id === 'new';
    const method = isNewArticle ? 'POST' : 'PUT';
    
    let endpoint = '';
    if (isNewArticle) {
      endpoint = `${API_BASE_URL}/article`;
    } else {
      // 使用优化的PUT接口，支持完整更新参数
      endpoint = `${API_BASE_URL}/article/${article.value.id}?fullUpdate=${fullUpdate}`;
    }
    
    // 如果是编辑现有文章，添加ID
    if (!isNewArticle) {
      articleData.id = article.value.id;
    }
    
    const response = await fetch(endpoint, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '保存失败' }));
      throw new Error(errorData.message || '保存失败');
    }
    
    const result = await response.json();
    if (result.success || result.code === 200) {
      // 更新文章ID（如果是新创建的文章）
      if (isNewArticle && result.data && result.data.id) {
        article.value.id = result.data.id;
        // 更新URL以反映文章ID
        router.replace(`/admin/article-editor/${result.data.id}`);
      }
      
      // 更新本地状态
      if (status) {
        article.value.status = status.toLowerCase() as 'draft' | 'published';
      }
      
      const updateMode = fullUpdate ? '完整更新' : '部分更新';
      showMessage(`文章保存成功 (${updateMode})`);
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

// 新增：完整更新文章的方法
const fullUpdateArticle = async () => {
  await saveArticle(undefined, true); // 完整更新模式
};

// 新增：获取分类名称的辅助函数
const getCategoryName = (categoryId: number): string => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '其他';
};

// 加载文章数据
const loadArticle = async () => {
  if (!articleId.value || articleId.value === 'new') {
    // 创建新文章，不需要加载数据
    return;
  }

  try {
    isLoading.value = true;
    const API_BASE_URL = config.api.apiUrl;
    
    // 获取文章基本信息 - 使用新的详情接口
    const response = await fetch(`${API_BASE_URL}/article/details/${articleId.value}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '获取文章失败' }));
      throw new Error(errorData.message || '获取文章失败');
    }
    
    const result = await response.json();
    if (result.success || result.code === 200) {
      const articleData = result.data;
      
      // 更新文章数据 - 处理后端返回的数据格式
      article.value = {
        ...article.value,
        ...articleData,
        id: articleData.id,
        title: articleData.title || '',
        content: articleData.content || '',
        excerpt: articleData.description || articleData.excerpt || '', // 后端返回description字段
        categoryId: articleData.categoryId || 1,
        category: articleData.category || '',
        tags: typeof articleData.tags === 'string' 
          ? articleData.tags.split(',').filter((tag: string) => tag.trim())
          : (articleData.tags || []), // 处理逗号分隔的字符串
        status: articleData.status === 'PUBLISHED' ? 'published' : 'draft',
        coverImage: articleData.cover || articleData.coverImage || '', // 后端返回cover字段
        cover: articleData.cover || articleData.coverImage || '',
        publishDate: new Date(articleData.createdAt || articleData.publishDate || articleData.createTime || new Date())
          .toISOString().slice(0, 16), // 格式化为yyyy-MM-ddThh:mm
        slug: articleData.slug || '',
        allowComments: articleData.allowComments !== false,
        sticky: articleData.sticky === true,
        views: articleData.views || 0,
        comments: articleData.comments || 0,
        createTime: articleData.createdAt || articleData.createTime || new Date().toISOString(), // 处理时间字段
        updateTime: articleData.updatedAt || articleData.updateTime || new Date().toISOString() // 处理时间字段
      };
      
      // 如果有分页断点数据，则开启分页
      if (articleData.pageBreaks && articleData.pageBreaks.length > 0) {
        pageBreaks.value = articleData.pageBreaks;
        enablePagination.value = true;
      }
      
      console.log('文章加载成功:', article.value);
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
    
    // 添加键盘快捷键
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl+S 保存草稿
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
      // Ctrl+Shift+P 发布文章
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        publish();
      }
      // Ctrl+Shift+U 完整更新
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        fullUpdateArticle();
      }
      // Ctrl+B 加粗
      if (e.ctrlKey && e.key === 'b' && contentEditor.value === document.activeElement) {
        e.preventDefault();
        insertFormat('**', '**');
      }
      // Ctrl+I 斜体
      if (e.ctrlKey && e.key === 'i' && contentEditor.value === document.activeElement) {
        e.preventDefault();
        insertFormat('*', '*');
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // 添加代码复制按钮功能
    const handleCodeCopy = (e: Event) => {
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
    };
    
    document.addEventListener('click', handleCodeCopy);
    
    // 组件卸载时清理事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('click', handleCodeCopy);
    };
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
  overflow: hidden;
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
.full-update-button,
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

.full-update-button {
  background-color: #f8f9fa;
  color: #28a745;
  border: 1px solid #28a745;
}

.full-update-button:hover {
  background-color: #e8f5e8;
}

.full-update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  overflow: hidden;
}

.editor-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
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
  min-height: 0;
}

.editor-tabs {
  display: flex;
  gap: 5px;
  padding: 15px 20px 0;
  border-bottom: 1px solid #eee;
  background-color: white;
  border-radius: 10px 10px 0 0;
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
  margin-bottom: -1px;
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
  border-radius: 0 0 10px 10px;
  background-color: white;
}

.editor-container.edit .edit-area {
  width: 100%;
  border-radius: 0 0 10px 10px;
}

.editor-container.preview .preview-area {
  width: 100%;
  border-radius: 0 0 10px 10px;
}

.editor-container.split .edit-area,
.editor-container.split .preview-area {
  width: 50%;
  background-color: white;
}

.editor-container.split .edit-area {
  border-radius: 0 0 0 10px;
}

.editor-container.split .preview-area {
  border-radius: 0 0 10px 0;
}

.edit-area,
.preview-area {
  height: 100%;
  overflow-y: auto;
  transition: width 0.3s ease;
  background-color: transparent;
}

.edit-area.hidden,
.preview-area.hidden {
  display: none;
  overflow: hidden;
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
  background-color: white;
}

.preview-area {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.editor-container.preview .preview-area {
  border-radius: 0 0 10px 10px;
}

/* Markdown 样式与文章内容预览保持一致 */
:deep(.markdown-content) {
  color: #333;
  line-height: 2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: 'ZhuZiAWan', sans-serif;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;

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

/* 封面图上传样式 */
.cover-image-uploader {
  position: relative;
}

.cover-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.cover-preview img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.change-cover-btn,
.remove-cover-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-cover-btn {
  background: rgba(74, 144, 226, 0.9);
  color: white;
}

.change-cover-btn:hover {
  background: rgba(74, 144, 226, 1);
}

.remove-cover-btn {
  background: rgba(245, 34, 45, 0.9);
  color: white;
}

.remove-cover-btn:hover {
  background: rgba(245, 34, 45, 1);
}

.cover-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  padding: 20px;
}

.cover-upload-area:hover {
  border-color: #4a90e2;
  background: #f0f6ff;
}

.cover-upload-area.dragging {
  border-color: #4a90e2;
  background: #e6f4ff;
  transform: scale(1.02);
}

.cover-upload-area .upload-icon {
  font-size: 24px;
  color: #999;
  margin-bottom: 8px;
}

.cover-upload-area span {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.cover-upload-area small {
  font-size: 12px;
  color: #999;
}

.upload-progress {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #40a9ff);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 35px;
}

/* 状态选择器样式 */
.status-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.status-option:hover {
  border-color: #4a90e2;
  background: #f8fbff;
}

.status-option.active {
  border-color: #4a90e2;
  background: #f0f6ff;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.status-option input[type="radio"] {
  display: none;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.draft {
  background: #faad14;
}

.status-indicator.published {
  background: #52c41a;
}

.status-indicator.archived {
  background: #8c8c8c;
}

.status-info {
  flex: 1;
}

.status-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.status-info small {
  font-size: 12px;
  color: #999;
}

/* 发布时间选择器样式 */
.publish-date-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.publish-date-group input[type="datetime-local"] {
  flex: 1;
}

.set-now-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.set-now-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f8fbff;
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

/* 暗色主题 - 封面图上传样式 */
:root[class='dark-theme'] .cover-upload-area {
  background: #333;
  border-color: #555;
  color: #ccc;
}

:root[class='dark-theme'] .cover-upload-area:hover {
  border-color: #4a90e2;
  background: #2a3b50;
}

:root[class='dark-theme'] .cover-upload-area.dragging {
  background: #1e3a5f;
}

:root[class='dark-theme'] .cover-upload-area .upload-icon {
  color: #777;
}

:root[class='dark-theme'] .cover-upload-area span {
  color: #ccc;
}

:root[class='dark-theme'] .cover-upload-area small {
  color: #888;
}

:root[class='dark-theme'] .progress-bar {
  background: #444;
}

:root[class='dark-theme'] .progress-text {
  color: #ccc;
}

/* 暗色主题 - 状态选择器样式 */
:root[class='dark-theme'] .status-option {
  background: #333;
  border-color: #555;
}

:root[class='dark-theme'] .status-option:hover {
  border-color: #4a90e2;
  background: #2a3b50;
}

:root[class='dark-theme'] .status-option.active {
  border-color: #4a90e2;
  background: #1e3a5f;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

:root[class='dark-theme'] .status-name {
  color: #e0e0e0;
}

:root[class='dark-theme'] .status-info small {
  color: #aaa;
}

/* 暗色主题 - 发布时间选择器样式 */
:root[class='dark-theme'] .set-now-btn {
  background: #333;
  border-color: #555;
  color: #ccc;
}

:root[class='dark-theme'] .set-now-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #2a3b50;
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