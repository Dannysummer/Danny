<template>
  <div class="article-management">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <div class="header-actions">
        <button class="add-button" @click="showUploadDialog = true">
          <Icon icon="mdi:upload" />
          <span>上传文章</span>
        </button>
        <button class="add-button" @click="createNewArticle">
          <Icon icon="mdi:plus" />
          <span>写文章</span>
        </button>
      </div>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <div class="search-box">
        <Icon icon="mdi:magnify" class="search-icon" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索文章标题或内容..." 
          @input="handleSearch"
        />
        <button class="clear-button" @click="clearSearch" v-if="searchQuery">
          <Icon icon="mdi:close" />
        </button>
      </div>
      
      <div class="filter-group">
        <div class="filter">
          <select v-model="categoryFilter" @change="handleFilter">
            <option value="">所有分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="filter">
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>
        </div>
        
        <div class="filter">
          <select v-model="sortBy" @change="handleFilter">
            <option value="newest">最新创建</option>
            <option value="oldest">最早创建</option>
            <option value="updated">最近更新</option>
            <option value="views">浏览量</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
            </th>
            <th>标题/文件</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>状态</th>
            <th>标签</th>
            <th>文件链接</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in paginatedArticles" :key="article.id" 
              :class="{ 'selected': selectedArticles.includes(article.id), 'featured': article.isFeatured }">
            <td class="checkbox-col">
              <input type="checkbox" :value="article.id" v-model="selectedArticles" />
            </td>
            <td class="title-col">
              <div class="article-title">
                {{ article.title }}
                <span class="featured-badge" v-if="article.isFeatured">
                  <Icon icon="mdi:star" />精选
                </span>
              </div>
              <div class="article-file-info">
                <span class="file-path">{{ article.filePath || article.filepath || '无路径' }}</span>
                <span class="file-size">{{ formatFileSize(article.fileSize || article.filesize) }}</span>
              </div>
            </td>
            <td>{{ formatDate(article.createdAt) }}</td>
            <td>{{ formatDate(article.updatedAt) }}</td>
            <td>
              <div class="status-display" @click="toggleStatusDropdown(article.id)">
                <div :class="['status-badge', getStatusClass(article.status)]">
                  {{ getStatusText(article.status) }}
                </div>
                <div class="status-dropdown" v-if="activeDropdown === article.id">
                  <div 
                    class="status-option" 
                    :class="{ active: article.status === 'PUBLISHED' }"
                    @click.stop="updateArticleStatus(article.id, 'PUBLISHED')">
                    已发布
                  </div>
                  <div 
                    class="status-option" 
                    :class="{ active: article.status === 'DRAFT' }"
                    @click.stop="updateArticleStatus(article.id, 'DRAFT')">
                    草稿
                  </div>
                  <div 
                    class="status-option" 
                    :class="{ active: article.status === 'ARCHIVED' }"
                    @click.stop="updateArticleStatus(article.id, 'ARCHIVED')">
                    已归档
                  </div>
                </div>
              </div>
            </td>
            <td class="tags-col">
              <div class="article-tags" v-if="article.tagArray && article.tagArray.length">
                <span class="tag" v-for="tag in article.tagArray" :key="tag">{{ tag }}</span>
              </div>
              <div class="article-tags" v-else-if="article.tags">
                <span class="tag" v-for="tag in article.tags.split(',')" :key="tag">{{ tag }}</span>
              </div>
              <span class="no-tags" v-else>无标签</span>
            </td>
            <td>
              <a :href="article.fileUrl" target="_blank" class="file-link" v-if="article.fileUrl">
                <Icon icon="mdi:link" />
                查看文件
              </a>
              <span v-else class="no-link">无链接</span>
            </td>
            <td class="actions-col">
              <div class="action-buttons">
                <button class="action-btn feature" 
                        @click="toggleFeatureStatus(article.id, !article.isFeatured)"
                        :title="article.isFeatured ? '取消精选' : '设为精选'">
                  <Icon :icon="article.isFeatured ? 'mdi:star' : 'mdi:star-outline'" />
                </button>
                <button class="action-btn edit" @click="openArticleEditor(article.id)" title="编辑">
                  <Icon icon="mdi:pencil" />
                </button>
                <button class="action-btn view" @click="viewArticle(article.id)" title="预览">
                  <Icon icon="mdi:eye" />
                </button>
                <button class="action-btn delete" @click="confirmDelete(article.id)" title="删除">
                  <Icon icon="mdi:delete" />
                </button>
              </div>
            </td>
          </tr>
          
          <!-- 空状态 -->
          <tr v-if="paginatedArticles.length === 0">
            <td colspan="6" class="empty-state">
              <div v-if="isLoading">
                <Icon icon="mdi:loading" class="loading-icon spin" />
                <p>加载中...</p>
              </div>
              <div v-else>
                <Icon icon="mdi:file-document-outline" class="empty-icon" />
                <p>没有找到文章</p>
                <button class="upload-button" @click="showUploadDialog = true">上传Markdown文章</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination">
      <div class="pagination-info">
        显示 {{ paginationStart }} - {{ paginationEnd }} 共 {{ filteredArticles.length }} 项
      </div>
      <div class="pagination-controls">
        <button 
          class="pagination-button" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        
        <button 
          v-for="page in displayedPages" 
          :key="page" 
          class="pagination-button" 
          :class="{ 'current': currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        
        <button 
          class="pagination-button" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
      
      <div class="per-page-selector">
        <select v-model="perPage" @change="handlePerPageChange">
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
          <option :value="100">100 条/页</option>
        </select>
      </div>
    </div>
    
    <!-- 批量操作工具栏 -->
    <div class="batch-actions" v-show="selectedArticles.length > 0">
      <div class="selection-info">已选择 {{ selectedArticles.length }} 项</div>
      <div class="batch-buttons">
        <button class="batch-btn" @click="batchPublish">
          <Icon icon="mdi:publish" />
          <span>发布</span>
        </button>
        <button class="batch-btn" @click="batchDraft">
          <Icon icon="mdi:file-document-outline" />
          <span>设为草稿</span>
        </button>
        <button class="batch-btn" @click="batchArchive">
          <Icon icon="mdi:archive" />
          <span>归档</span>
        </button>
        <button class="batch-btn delete" @click="confirmBatchDelete">
          <Icon icon="mdi:delete" />
          <span>删除</span>
        </button>
      </div>
    </div>
    
    <!-- 修改确认删除对话框，支持单个和批量删除 -->
    <div class="confirm-dialog" v-if="showDeleteConfirm">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>{{ articleToDelete ? '确认删除' : '确认批量删除' }}</h3>
          <button class="close-btn" @click="cancelDelete">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="dialog-body">
          <p v-if="articleToDelete">确定要删除这篇文章吗？此操作不可恢复。</p>
          <p v-else>确定要删除这 {{ selectedArticles.length }} 篇文章吗？此操作不可恢复。</p>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-btn" @click="articleToDelete ? deleteArticle() : deleteArticles()">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 添加上传对话框 -->
    <div class="upload-dialog" v-if="showUploadDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>上传Markdown文章</h3>
          <button class="close-btn" @click="cancelUpload">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="article-title">文章标题</label>
            <input 
              type="text" 
              id="article-title" 
              v-model="uploadForm.title" 
              placeholder="输入文章标题（可选，默认使用文件名）"
            />
          </div>
          <div class="form-group">
            <label for="article-file">选择Markdown文件</label>
            <div 
              class="file-drop-area" 
              :class="{ 'dragging': isDragging, 'has-file': uploadForm.file }"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <input 
                type="file" 
                id="article-file" 
                class="file-input" 
                @change="handleFileSelected" 
                accept=".md,.markdown,.txt"
                ref="fileInput"
              />
              <div class="file-info" v-if="uploadForm.file">
                <Icon icon="mdi:file-document" class="file-icon" />
                <div class="file-details">
                  <div class="file-name">{{ uploadForm.file.name }}</div>
                  <div class="file-size">{{ formatFileSize(uploadForm.file.size) }}</div>
                </div>
                <button class="remove-file-btn" @click.stop="removeFile">
                  <Icon icon="mdi:close" />
                </button>
              </div>
              <div class="drop-message" v-else>
                <Icon icon="mdi:upload" class="upload-icon" />
                <span>拖放Markdown文件到此处或</span>
                <button class="browse-btn" @click.stop="selectFile">浏览文件</button>
              </div>
            </div>
          </div>
          
          <!-- 上传进度条 -->
          <div class="progress-container" v-if="uploadProgress.show">
            <div class="progress-info">
              <span class="progress-status">
                {{ uploadProgress.status === 'COMPLETED' ? '上传完成' : 
                   uploadProgress.status === 'FAILED' ? '上传失败' : 
                   `正在上传 (${Math.round(uploadProgress.percentage)}%)` }}
              </span>
              <span class="progress-bytes" v-if="uploadProgress.status === 'IN_PROGRESS'">
                {{ formatFileSize(uploadProgress.bytesTransferred) }} / {{ formatFileSize(uploadProgress.totalBytes) }}
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-inner" 
                :style="{ width: uploadProgress.percentage + '%' }"
                :class="{
                  'progress-complete': uploadProgress.status === 'COMPLETED',
                  'progress-error': uploadProgress.status === 'FAILED'
                }"
              ></div>
            </div>
            <div class="progress-error-message" v-if="uploadProgress.errorMessage">
              {{ uploadProgress.errorMessage }}
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="cancelUpload" :disabled="isUploading">取消</button>
          <button 
            class="confirm-btn" 
            @click="uploadFile" 
            :disabled="!uploadForm.file || isUploading"
          >
            {{ isUploading ? '上传中...' : '上传文章' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加通知组件 -->
    <MessageNotification ref="notification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
// @ts-ignore
const SockJS = window.SockJS;
// @ts-ignore
const Stomp = window.Stomp;
import { useUserStore } from '@/stores/user';
// 导入消息通知组件
import MessageNotification from '@/components/MessageNotification.vue';

interface Article {
  id: number;
  title: string;
  filepath?: string;
  filesize?: number;
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  status: string; // 修改为更通用的类型
  category?: string;
  tags?: string;
  tagArray?: string[];
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  isFeatured?: boolean;
}

interface CategoryType {
  id: number;
  name: string;
}

interface UploadProgress {
  show: boolean;
  uploadId?: string;
  filename?: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
}

const router = useRouter();
const userStore = useUserStore();

// 修改API基础URL
const API_BASE_URL = 'http://localhost:8088/api';
const totalItems = ref(0);

// 状态和变量定义
const articles = ref<Article[]>([]);
const searchQuery = ref('');
const selectedArticles = ref<number[]>([]);
const selectAll = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const articleToDelete = ref<number | null>(null);

// 修改分类变量类型
const categories = ref<CategoryType[]>([]);
const categoryFilter = ref('');
const statusFilter = ref('');
const sortBy = ref('newest');

// 上传对话框相关状态
const showUploadDialog = ref(false);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const stompClient = ref<any>(null);
const uploadProgress = ref<UploadProgress>({
  show: false,
  bytesTransferred: 0,
  totalBytes: 0,
  percentage: 0,
  status: 'STARTED',
  errorMessage: null
});

const uploadForm = ref({
  title: '',
  file: null as File | null
});

// 修改notification引用类型
const notification = ref<InstanceType<typeof MessageNotification> | null>(null);

// 状态相关
const activeDropdown = ref<number | null>(null);

// 修改获取认证头部的方法
const getAuthHeader = (): HeadersInit => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Referer': 'https://www.dannysummer.asia'
  };
};

// 修改过滤逻辑
const filteredArticles = computed(() => {
  let result = [...articles.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(article => 
      article.title.toLowerCase().includes(query) || 
      (article.filepath && article.filepath.toLowerCase().includes(query))
    );
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(article => article.category === categoryFilter.value);
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(article => article.status === statusFilter.value);
  }
  
  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
    } else if (sortBy.value === 'oldest') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    } else if (sortBy.value === 'updated') {
      return new Date(a.updatedAt || '').getTime() - new Date(b.updatedAt || '').getTime();
    } else if (sortBy.value === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return 0;
  });
  
  return result;
});

// 分页逻辑
const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / perPage.value);
});

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredArticles.value.slice(start, end);
});

const paginationStart = computed(() => {
  return filteredArticles.value.length === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * perPage.value, filteredArticles.value.length);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  
  if (totalPages.value <= maxPagesToShow) {
    // 如果总页数小于等于最大显示页数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // 否则，显示当前页附近的页码
    let startPage = Math.max(currentPage.value - Math.floor(maxPagesToShow / 2), 1);
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages.value) {
      endPage = totalPages.value;
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// 处理分页跳转
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 处理每页条数变化
const handlePerPageChange = () => {
  currentPage.value = 1;
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  handleSearch();
};

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1;
};

// 重置所有筛选条件
const resetFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = '';
  statusFilter.value = '';
  sortBy.value = 'newest';
  currentPage.value = 1;
};

// 处理选择与删除
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedArticles.value = filteredArticles.value.map(article => article.id);
  } else {
    selectedArticles.value = [];
  }
};

watch(selectedArticles, () => {
  selectAll.value = selectedArticles.value.length > 0 && 
    selectedArticles.value.length === filteredArticles.value.length;
});

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 获取文章列表
const fetchArticles = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/article/list`, {
      credentials: 'include',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('获取文章列表失败');
    }
    
    const data = await response.json();
    articles.value = data.data || [];
    totalItems.value = data.total || articles.value.length;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    showNotification('获取文章列表失败', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 文件上传相关方法
const selectFile = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
      uploadForm.value.file = file;
      // 如果没有设置标题，使用文件名(不含扩展名)作为默认标题
      if (!uploadForm.value.title) {
        uploadForm.value.title = file.name.replace(/\.md$/, '');
      }
    } else {
      showNotification('请选择Markdown文件(.md)', 'warning');
      target.value = '';
    }
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
      uploadForm.value.file = file;
      // 如果没有设置标题，使用文件名(不含扩展名)作为默认标题
      if (!uploadForm.value.title) {
        uploadForm.value.title = file.name.replace(/\.md$/, '');
      }
    } else {
      showNotification('请选择Markdown文件(.md)', 'warning');
    }
  }
};

// 修改上传文件的方法
const uploadWithoutProgress = async (file: File, title: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await fetch(`${API_BASE_URL}/article/upload`, {
      method: 'POST',
      credentials: 'include',  // 添加凭证
      headers: getAuthHeader(),
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '上传失败');
    }
    
    const result = await response.json();
    showNotification('上传成功', 'success');
    showUploadDialog.value = false;
    resetUploadForm();
    fetchArticles();
  } catch (error) {
    console.error('上传文件时出错:', error);
    throw error;
  }
};

// 修改获取上传策略的地址
const getUploadPolicy = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/article/policy`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('获取上传策略失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取上传策略时出错:', error);
    throw error;
  }
};

// 修改带进度的上传方法
const uploadWithProgressRequest = async (file: File, title: string, uploadId: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('uploadId', uploadId);
    
    const response = await fetch(`${API_BASE_URL}/article/upload-with-progress`, {
      method: 'POST',
      credentials: 'include',  // 添加凭证
      headers: getAuthHeader(),
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '上传失败');
    }
  } catch (error) {
    console.error('上传文件时出错:', error);
    uploadProgress.value.status = 'FAILED';
    uploadProgress.value.errorMessage = error instanceof Error ? error.message : String(error);
  }
};

// 修改WebSocket连接地址
const uploadWithProgress = async (file: File, title: string) => {
  if (!file) {
    showNotification('请选择要上传的Markdown文件', 'warning');
    return;
  }
  
  if (!title.trim()) {
    showNotification('请输入文章标题', 'warning');
    return;
  }
  
  try {
    isUploading.value = true;
    const policy = await getUploadPolicy();
    const uploadId = policy.uploadId;
    
    // 使用SockJS和Stomp连接WebSocket
    if (SockJS && Stomp) {
      const socket = new SockJS('http://localhost:8088/ws');
      stompClient.value = Stomp.over(socket);
      
      // 连接成功后订阅进度通知
      stompClient.value.connect({}, () => {
        stompClient.value.subscribe(`/topic/upload-progress/${uploadId}`, (message: any) => {
          const progress = JSON.parse(message.body);
          
          uploadProgress.value = {
            show: true,
            uploadId: uploadId,
            filename: file.name,
            bytesTransferred: progress.bytesTransferred,
            totalBytes: progress.totalBytes,
            percentage: Math.round((progress.bytesTransferred / progress.totalBytes) * 100),
            status: progress.status,
            errorMessage: progress.errorMessage
          };
          
          if (progress.status === 'COMPLETED') {
            showNotification('上传成功', 'success');
            disconnectWebSocket();
            showUploadDialog.value = false;
            resetUploadForm();
            fetchArticles(); // 刷新文章列表
          } else if (progress.status === 'FAILED') {
            showNotification(`上传失败: ${progress.errorMessage || '未知错误'}`, 'error');
            disconnectWebSocket();
          }
        });
        
        // 订阅成功后开始上传
        uploadWithProgressRequest(file, title, uploadId);
      }, (error: any) => {
        console.error('WebSocket连接失败:', error);
        // 如果WebSocket连接失败，使用不带进度的上传
        uploadWithoutProgress(file, title);
      });
    } else {
      // 如果SockJS或Stomp不可用，使用不带进度的上传
      uploadWithoutProgress(file, title);
    }
  } catch (error) {
    console.error('准备上传时出错:', error);
    // 如果获取上传策略失败，使用不带进度的上传
    uploadWithoutProgress(file, title);
  } finally {
    isUploading.value = false;
  }
};

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.disconnect();
    stompClient.value = null;
  }
  
  uploadProgress.value.show = false;
};

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    title: '',
    file: null
  };
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 取消上传对话框
const cancelUpload = () => {
  showUploadDialog.value = false;
  resetUploadForm();
  disconnectWebSocket();
};

// 删除按钮直接执行删除，不再打开确认框
const confirmDelete = (id: number) => {
  articleToDelete.value = id;
  showDeleteConfirm.value = true;
};

// 修改删除文章方法，支持自动关闭对话框
const deleteArticle = async () => {
  if (!articleToDelete.value) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/article/${articleToDelete.value}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('删除文章失败');
    }
    
    articles.value = articles.value.filter(article => article.id !== articleToDelete.value);
    selectedArticles.value = selectedArticles.value.filter(id => id !== articleToDelete.value);
    
    showNotification('文章已删除', 'success');
    // 自动关闭对话框
    showDeleteConfirm.value = false;
    articleToDelete.value = null;
  } catch (error) {
    console.error('删除文章时出错:', error);
    showNotification(`删除失败: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
};

// 批量删除功能保留确认框，但删除成功后自动关闭
const deleteArticles = async () => {
  if (selectedArticles.value.length === 0) {
    showNotification('请选择要删除的文章', 'warning');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const id of selectedArticles.value) {
    try {
      const response = await fetch(`${API_BASE_URL}/article/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`删除文章 ${id} 时出错:`, error);
      failCount++;
    }
  }
  
  await fetchArticles();
  selectedArticles.value = [];
  
  showNotification(`删除完成: ${successCount} 成功, ${failCount} 失败`, successCount > 0 ? 'success' : 'error');
  // 操作完成后自动关闭确认框
  showDeleteConfirm.value = false;
};

// 查看文章
const viewArticle = (id: number) => {
  router.push(`/admin/article-content/${id}`);
};

// 打开文章编辑器
const openArticleEditor = (id: number) => {
  router.push(`/admin/article-editor/${id}`);
};

// 创建新文章
const createNewArticle = () => {
  router.push('/admin/article-editor/new');
};

// 批量操作方法
const batchPublish = async () => {
  await updateArticlesStatus('published');
};

const batchDraft = async () => {
  await updateArticlesStatus('draft');
};

const batchArchive = async () => {
  await updateArticlesStatus('archived');
};

// 更新文章状态通用方法
const updateArticlesStatus = async (status: 'published' | 'draft' | 'archived') => {
  if (selectedArticles.value.length === 0) {
    showNotification('请选择要操作的文章', 'warning');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const id of selectedArticles.value) {
    try {
      const response = await fetch(`${API_BASE_URL}/article/${id}/status`, {
        method: 'PUT',
        credentials: 'include',  // 添加凭证
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`更新文章 ${id} 状态时出错:`, error);
      failCount++;
    }
  }
  
  await fetchArticles();
  selectedArticles.value = [];
  
  showNotification(`状态更新完成: ${successCount} 成功, ${failCount} 失败`, successCount > 0 ? 'success' : 'error');
};

// 用于取消删除操作
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  articleToDelete.value = null;
};

// 确认批量删除
const confirmBatchDelete = () => {
  showDeleteConfirm.value = true;
};

// 移除文件
const removeFile = () => {
  uploadForm.value.file = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 上传文件
const uploadFile = async () => {
  if (!uploadForm.value.file) {
    showNotification('请选择要上传的Markdown文件', 'warning');
    return;
  }
  
  if (!uploadForm.value.title.trim()) {
    showNotification('请输入文章标题', 'warning');
    return;
  }
  
  try {
    isUploading.value = true;
    const file = uploadForm.value.file;
    const title = uploadForm.value.title.trim();
    
    // 确定是否使用WebSocket进度监控
    const useProgress = file.size > 1024 * 1024; // 大于1MB的文件显示进度
    
    if (useProgress && typeof SockJS === 'function' && typeof Stomp === 'object') {
      await uploadWithProgress(file, title);
    } else {
      await uploadWithoutProgress(file, title);
    }
  } catch (error) {
    console.error('上传文件时出错:', error);
    showNotification(`上传失败: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    isUploading.value = false;
  }
};

// 添加显示通知的便捷方法
const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  notification.value?.addMessage(message, type);
};

// 切换状态下拉菜单
const toggleStatusDropdown = (id: number) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
  }
};

// 更新文章状态并收起下拉菜单
const updateArticleStatus = async (id: number, newStatus: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/article/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) {
      // 更新本地文章状态
      const article = articles.value.find(a => a.id === id);
      if (article) {
        article.status = newStatus;
      }
      showNotification(`文章状态已更新为"${getStatusText(newStatus)}"`, 'success');
    } else {
      showNotification('更新文章状态失败', 'error');
    }
  } catch (error) {
    console.error('更新文章状态出错:', error);
    showNotification('更新文章状态失败', 'error');
  } finally {
    // 关闭下拉菜单
    activeDropdown.value = null;
  }
};

// 获取状态样式类名
const getStatusClass = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PUBLISHED': return 'status-published';
    case 'DRAFT': return 'status-draft';
    case 'ARCHIVED': return 'status-archived';
    default: return '';
  }
};

// 点击页面其他区域关闭下拉菜单
const closeDropdowns = () => {
  activeDropdown.value = null;
};

// 切换文章精选状态
const toggleFeatureStatus = async (id: number, featured: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/article/${id}/feature`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isFeatured: featured })
    });
    
    if (response.ok) {
      // 更新本地文章精选状态
      const article = articles.value.find(a => a.id === id);
      if (article) {
        article.isFeatured = featured;
      }
      showNotification(featured ? '文章已设为精选' : '文章已取消精选', 'success');
    } else {
      showNotification(featured ? '设置精选失败' : '取消精选失败', 'error');
    }
  } catch (error) {
    console.error('更新文章精选状态出错:', error);
    showNotification('更新文章精选状态失败', 'error');
  }
};

// 获取状态显示文本
const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PUBLISHED': return '已发布';
    case 'DRAFT': return '草稿';
    case 'ARCHIVED': return '已归档';
    default: return status;
  }
};

// 页面加载时获取文章列表
onMounted(() => {
  fetchArticles();
  document.addEventListener('click', closeDropdowns);
});

// 组件销毁前断开WebSocket连接
onBeforeUnmount(() => {
  disconnectWebSocket();
  document.removeEventListener('click', closeDropdowns);
});
</script>

<style scoped>
.article-management {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #1c92d2, #0761aa); */
  padding: 20px;
  color: #333;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #49b1f5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-button:hover {
  background-color: #36a0e8;
}

.filter-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
}

.search-box input {
  width: 100%;
  padding: 8px 30px 8px 30px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.clear-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter select {
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 120px;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f5f5;
  color: #666;
  text-align: left;
  padding: 12px 15px;
  font-weight: 600;
  border-bottom: 1px solid #e8e8e8;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e8e8e8;
  color: #333;
}

.data-table tr:hover {
  background-color: #f0f9ff;
}

.data-table tr.selected {
  background-color: #e6f7ff;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.title-col {
  min-width: 250px;
}

.article-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.article-file-info {
  display: flex;
  font-size: 12px;
  color: #999;
}

.file-path {
  margin-right: 10px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: #666;
}

.actions-col {
  width: 180px;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-btn.edit:hover {
  color: #1890ff;
  background-color: #e6f7ff;
}

.action-btn.view:hover {
  color: #52c41a;
  background-color: #f6ffed;
}

.action-btn.delete:hover {
  color: #f5222d;
  background-color: #fff1f0;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.no-link {
  color: #999;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-icon, .loading-icon {
  font-size: 36px;
  color: #999;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin-bottom: 16px;
}

.upload-button {
  background-color: #49b1f5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.upload-button:hover {
  background-color: #36a0e8;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 5px;
}

.pagination-button {
  min-width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background-color: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.pagination-button:hover:not(:disabled) {
  color: #49b1f5;
  border-color: #49b1f5;
}

.pagination-button:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.pagination-button.current {
  color: white;
  background-color: #49b1f5;
  border-color: #49b1f5;
  font-weight: 500;
}

.per-page-selector select {
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.batch-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.selection-info {
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.batch-btn:hover {
  color: #49b1f5;
  border-color: #49b1f5;
}

.batch-btn.delete:hover {
  color: #f5222d;
  border-color: #f5222d;
}

.confirm-dialog, .upload-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
}

.upload-dialog .dialog-content {
  max-width: 600px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
}

.dialog-body {
  padding: 24px;
}

.dialog-footer {
  padding: 10px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.confirm-btn {
  background-color: #49b1f5;
  border: none;
  color: white;
}

.cancel-btn:hover {
  color: #49b1f5;
  border-color: #49b1f5;
}

.confirm-btn:hover {
  background-color: #36a0e8;
}

.confirm-btn:disabled {
  background-color: #92d1f8;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.file-drop-area {
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s;
}

.file-drop-area.dragging {
  border-color: #49b1f5;
  background-color: #e6f7ff;
}

.file-drop-area.has-file {
  padding: 20px;
}

.file-input {
  display: none;
}

.drop-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #666;
}

.upload-icon {
  font-size: 36px;
  color: #999;
}

.browse-btn {
  background-color: #49b1f5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.file-icon {
  font-size: 36px;
  color: #49b1f5;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-all;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #f5222d;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s;
}

.remove-file-btn:hover {
  background-color: #fff1f0;
}

.progress-container {
  margin-top: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-status {
  font-weight: 500;
}

.progress-bytes {
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #49b1f5;
  transition: width 0.3s ease;
}

.progress-complete {
  background-color: #52c41a;
}

.progress-error {
  background-color: #f5222d;
}

.progress-error-message {
  color: #f5222d;
  margin-top: 8px;
  font-size: 14px;
}

/* 新增的样式 */
.featured {
  background-color: rgba(255, 237, 213, 0.4);
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #ffab2b;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.featured-badge .iconify {
  margin-right: 2px;
}

.tags-col {
  min-width: 120px;
  max-width: 200px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 12px;
}

.no-tags {
  color: #999;
  font-style: italic;
  font-size: 12px;
}

/* 状态显示相关样式 */
.status-display {
  position: relative;
  cursor: pointer;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  min-width: 80px;
}

.status-published {
  background-color: #52c41a;
  color: white;
}

.status-draft {
  background-color: #1890ff;
  color: white;
}

.status-archived {
  background-color: #8c8c8c;
  color: white;
}

.status-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-top: 5px;
}

.status-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-option:hover {
  background-color: #f5f5f5;
}

.status-option.active {
  font-weight: 500;
}

.status-option:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.status-option:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 移除旧的状态选择器样式 */
.status-selector {
  position: relative;
  min-width: 90px;
}

.status-select {
  width: 100%;
  padding: 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 13px;
  transition: all 0.3s;
}

.status-select:hover {
  border-color: #49b1f5;
}
</style> 