<template>
  <div class="article-management">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <button class="add-button" @click="openArticleEditor()">
        <Icon icon="mdi:plus" />
        <span>写文章</span>
      </button>
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
            <th>标题</th>
            <th>分类</th>
            <th>标签</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>浏览量</th>
            <th>评论数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in paginatedArticles" :key="article.id" :class="{ 'selected': selectedArticles.includes(article.id) }">
            <td class="checkbox-col">
              <input type="checkbox" :value="article.id" v-model="selectedArticles" />
            </td>
            <td class="title-col">
              <div class="article-title">{{ article.title }}</div>
              <div class="article-excerpt">{{ article.excerpt }}</div>
            </td>
            <td>{{ article.category }}</td>
            <td class="tags-col">
              <div class="tag-list">
                <span 
                  v-for="tag in article.tags" 
                  :key="tag" 
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td>
              <span 
                class="status-badge" 
                :class="{
                  'published': article.status === 'published',
                  'draft': article.status === 'draft',
                  'archived': article.status === 'archived'
                }"
              >
                {{ 
                  article.status === 'published' ? '已发布' : 
                  article.status === 'draft' ? '草稿' : '已归档' 
                }}
              </span>
            </td>
            <td>{{ formatDate(article.publishDate) }}</td>
            <td>{{ article.views }}</td>
            <td>{{ article.comments }}</td>
            <td class="actions-col">
              <div class="action-buttons">
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
            <td colspan="9" class="empty-state">
              <div v-if="isLoading">
                <Icon icon="mdi:loading" class="loading-icon spin" />
                <p>加载中...</p>
              </div>
              <div v-else>
                <Icon icon="mdi:file-document-outline" class="empty-icon" />
                <p>没有找到符合条件的文章</p>
                <button class="reset-button" @click="resetFilters">重置筛选条件</button>
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
    
    <!-- 确认删除对话框 -->
    <div class="confirm-dialog" v-if="showDeleteConfirm">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="cancelDelete">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="dialog-body">
          <p v-if="selectedArticles.length > 1">确定要删除这 {{ selectedArticles.length }} 篇文章吗？此操作不可恢复。</p>
          <p v-else>确定要删除这篇文章吗？此操作不可恢复。</p>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-btn" @click="deleteArticles">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';

// 模拟数据
const categories = ref([
  { id: 1, name: '神经网络' },
  { id: 2, name: '机器学习' },
  { id: 3, name: '人工智能' },
  { id: 4, name: 'Web开发' },
  { id: 5, name: '性能优化' },
  { id: 6, name: '后端开发' },
  { id: 7, name: '其他' }
]);

// 生成模拟文章数据
const generateMockArticles = (count: number) => {
  const statuses = ['published', 'draft', 'archived'];
  const articles = [];
  
  for (let i = 1; i <= count; i++) {
    const categoryIndex = Math.floor(Math.random() * categories.value.length);
    const category = categories.value[categoryIndex];
    
    // 生成随机标签
    const allTags = ['JavaScript', 'Python', 'Docker', '深度学习', 'Node.js', 'Vue', 'React', 'TypeScript', 'CSS', '算法'];
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const tags: string[] = [];
    
    for (let j = 0; j < tagCount; j++) {
      const tagIndex = Math.floor(Math.random() * allTags.length);
      const tag = allTags[tagIndex];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    // 生成随机日期（过去一年内）
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    articles.push({
      id: i,
      title: `文章标题 ${i}`,
      excerpt: `这是文章 ${i} 的摘要，简短描述了文章的主要内容...`,
      content: `这是文章 ${i} 的完整内容，详细展开...`,
      category: category.name,
      categoryId: category.id,
      tags: tags,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      publishDate: pastDate,
      views: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50)
    });
  }
  
  return articles;
};

// 状态变量
const articles = ref(generateMockArticles(50));
const searchQuery = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');
const sortBy = ref('newest');
const selectedArticles = ref<number[]>([]);
const selectAll = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const articleToDelete = ref<number | null>(null);

// 根据筛选条件过滤文章
const filteredArticles = computed(() => {
  let result = [...articles.value];
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query)
    );
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(article => article.categoryId.toString() === categoryFilter.value);
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(article => article.status === statusFilter.value);
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      case 'oldest':
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      case 'updated':
        // 假设有 updateDate 字段，这里简化为使用 publishDate
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
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

// 切换全选
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedArticles.value = paginatedArticles.value.map(article => article.id);
  } else {
    selectedArticles.value = [];
  }
};

// 监听选定文章的变化，更新全选状态
watch(selectedArticles, (newValue: number[]) => {
  selectAll.value = newValue.length === paginatedArticles.value.length && newValue.length > 0;
});

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 文章编辑器
const openArticleEditor = (id?: number) => {
  if (id) {
    // 编辑现有文章
    console.log(`编辑文章 ID: ${id}`);
  } else {
    // 新建文章
    console.log('新建文章');
  }
};

// 查看文章
const viewArticle = (id: number) => {
  console.log(`查看文章 ID: ${id}`);
  // 通常会打开新窗口或导航到前台文章页面
};

// 确认删除
const confirmDelete = (id: number) => {
  articleToDelete.value = id;
  selectedArticles.value = [id];
  showDeleteConfirm.value = true;
};

// 确认批量删除
const confirmBatchDelete = () => {
  showDeleteConfirm.value = true;
};

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  articleToDelete.value = null;
};

// 执行删除
const deleteArticles = () => {
  console.log(`删除文章 IDs: ${selectedArticles.value.join(', ')}`);
  
  // 模拟删除操作
  articles.value = articles.value.filter(article => !selectedArticles.value.includes(article.id));
  
  // 重置状态
  showDeleteConfirm.value = false;
  articleToDelete.value = null;
  selectedArticles.value = [];
  
  // 如果当前页没有数据了，且不是第一页，则返回上一页
  if (paginatedArticles.value.length === 0 && currentPage.value > 1) {
    currentPage.value--;
  }
};

// 批量操作
const batchPublish = () => {
  updateArticlesStatus('published');
};

const batchDraft = () => {
  updateArticlesStatus('draft');
};

const batchArchive = () => {
  updateArticlesStatus('archived');
};

// 更新文章状态
const updateArticlesStatus = (status: 'published' | 'draft' | 'archived') => {
  articles.value = articles.value.map(article => {
    if (selectedArticles.value.includes(article.id)) {
      return { ...article, status };
    }
    return article;
  });
  
  selectedArticles.value = [];
};

// 页面加载
onMounted(() => {
  // 模拟加载数据
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<style scoped>
.article-management {
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-button:hover {
  background: #3a7bc8;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: #f5f7fc;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  background: #fff;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter select {
  padding: 10px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: #f5f7fc;
  color: #333;
  cursor: pointer;
  min-width: 130px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 30px;
}

.filter select:focus {
  outline: none;
  background-color: #fff;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.data-table th {
  background-color: #f5f7fc;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f5f7fc;
}

.data-table tr.selected {
  background-color: rgba(74, 144, 226, 0.05);
}

.data-table tr.selected:hover {
  background-color: rgba(74, 144, 226, 0.1);
}

.checkbox-col {
  width: 40px;
}

.checkbox-col input[type="checkbox"] {
  cursor: pointer;
}

.title-col {
  max-width: 300px;
}

.article-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.article-excerpt {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tags-col {
  min-width: 150px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.published {
  background: rgba(126, 211, 33, 0.1);
  color: #7ed321;
}

.status-badge.draft {
  background: rgba(248, 151, 27, 0.1);
  color: #f8971b;
}

.status-badge.archived {
  background: rgba(153, 153, 153, 0.1);
  color: #999;
}

.actions-col {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #666;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f0f5fd;
}

.action-btn.edit:hover {
  color: #4a90e2;
}

.action-btn.view:hover {
  color: #7ed321;
}

.action-btn.delete:hover {
  color: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
}

.empty-icon, .loading-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state p {
  color: #666;
  margin-bottom: 16px;
}

.reset-button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e1e5e9;
  background: #fff;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #f0f5fd;
  border-color: #4a90e2;
}

.pagination-button.current {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.pagination-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.per-page-selector select {
  padding: 9px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 30px;
}

.batch-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 15px 25px;
  border-radius: 10px;
  z-index: 10;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translate(-50%, 100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

.selection-info {
  color: #333;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f7fc;
  border: none;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-btn:hover {
  background: #e0e7ff;
}

.batch-btn.delete {
  color: #ff6b6b;
}

.batch-btn.delete:hover {
  background: rgba(255, 107, 107, 0.1);
}

.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  animation: zoomIn 0.2s ease;
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f7fc;
  color: #333;
}

.dialog-body {
  padding: 30px 20px;
  text-align: center;
}

.dialog-body p {
  margin: 0;
  color: #333;
}

.dialog-footer {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #e1e5e9;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f5f7fc;
  border: 1px solid #e1e5e9;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e7ff;
}

.confirm-btn {
  background: #ff6b6b;
  border: none;
  color: white;
}

.confirm-btn:hover {
  background: #ff5252;
}

@media (max-width: 1200px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-wrap: wrap;
  }
  
  .filter select {
    width: 100%;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
  }
}
</style> 