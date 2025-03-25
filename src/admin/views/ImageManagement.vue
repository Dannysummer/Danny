<template>
  <div class="image-management-page">
    <div class="page-header">
      <h1>图床管理</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchImages">
          <Icon icon="mdi:refresh" :class="{ 'rotating': isLoading }" />
          刷新
        </button>
        <button v-if="!isSelectionMode" class="select-btn" @click="enterSelectionMode">
          <Icon icon="mdi:select-multiple" />
          选择
        </button>
        <template v-else>
          <button class="cancel-select-btn" @click="exitSelectionMode">
            <Icon icon="mdi:close" />
            取消
          </button>
          <button class="batch-delete-btn" @click="confirmBatchDelete" :disabled="selectedImages.length === 0">
            <Icon icon="mdi:delete-sweep" />
            删除选中 ({{ selectedImages.length }})
          </button>
        </template>
        <button class="upload-btn" @click="showUploadModal = true">
          <Icon icon="mdi:cloud-upload" />
          上传图片
        </button>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-options">
      <div class="filter-group">
        <label>类型筛选：</label>
        <select v-model="filterType">
          <option value="all">全部类型</option>
          <option value="image">图片</option>
          <option value="avatar">头像</option>
          <option value="cover">封面</option>
          <option value="article">文章图片</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>时间排序：</label>
        <select v-model="sortOrder">
          <option value="newest">最新上传</option>
          <option value="oldest">最早上传</option>
        </select>
      </div>
      
      <div class="search-group">
        <input type="text" v-model="searchQuery" placeholder="搜索文件名..." @keydown.enter="fetchImages" />
        <button @click="fetchImages">
          <Icon icon="mdi:magnify" />
        </button>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="isSelectionMode" class="batch-operation-bar">
      <div class="selection-info">
        <label class="select-all">
          <input type="checkbox" 
                 :checked="selectedImages.length > 0 && selectedImages.length === images.length" 
                 :indeterminate="selectedImages.length > 0 && selectedImages.length < images.length"
                 @change="toggleSelectAll"
          />
          <span class="checkbox-text">全选</span>
        </label>
        <span class="selection-count">已选择 {{ selectedImages.length }} 张图片</span>
      </div>
      <div class="batch-actions">
        <button class="batch-action-btn" @click="confirmBatchDelete" :disabled="selectedImages.length === 0">
          <Icon icon="mdi:delete-sweep" />
          批量删除
        </button>
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="images-container">
      <div v-if="images.length > 0" class="images-grid">
        <div v-for="image in images" :key="image.id" class="image-card" :class="{ 'selected': isSelectionMode && selectedImages.includes(image.id) }">
          <div class="image-preview" @click="isSelectionMode ? toggleImageSelection(image.id) : previewImage(image)">
            <img :src="image.thumbnailUrl || image.url" :alt="image.name" />
            
            <!-- 添加选择指示器 -->
            <div v-if="isSelectionMode" class="selection-indicator">
              <Icon v-if="selectedImages.includes(image.id)" icon="mdi:check-circle" class="selected-icon" />
              <Icon v-else icon="mdi:checkbox-blank-circle-outline" class="unselected-icon" />
            </div>
          </div>
          <div class="image-info">
            <div class="image-name" :title="image.name">{{ truncateText(image.name, 20) }}</div>
            <div class="image-details">
              <span class="image-size">{{ formatSize(image.size) }}</span>
              <span class="image-date">{{ formatDate(image.createdAt) }}</span>
            </div>
          </div>
          <div class="image-actions">
            <button class="copy-btn" @click="copyImageUrl(image.url)">
              <Icon icon="mdi:content-copy" />
            </button>
            <button class="rename-btn" @click="showRenameDialog(image)">
              <Icon icon="mdi:pencil" />
            </button>
            <button class="delete-btn" @click="confirmDeleteImage(image)">
              <Icon icon="mdi:delete" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 没有图片时显示 -->
      <div v-if="images.length === 0 && !isLoading" class="no-images">
        <Icon icon="mdi:image-off" class="no-images-icon" />
        <p>暂无图片数据</p>
      </div>
      
      <!-- 加载中 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 上传图片对话框 -->
    <div class="modal" v-if="showUploadModal" @click.self="showUploadModal = false">
      <div class="modal-content">
        <h3>上传图片</h3>
        <div class="modal-body">
          <div class="form-group">
            <label for="image-type">图片类型</label>
            <select id="image-type" v-model="uploadForm.type">
              <option value="image">普通图片</option>
              <option value="avatar">头像</option>
              <option value="cover">封面</option>
              <option value="article">文章图片</option>
            </select>
          </div>
          
          <div class="upload-area" 
            @dragover.prevent="dragover" 
            @dragleave.prevent="dragleave" 
            @drop.prevent="handleDrop"
            :class="{ 'active': isDragging || uploadForm.files.length > 0 }"
          >
            <input 
              type="file" 
              ref="fileInput" 
              multiple 
              accept="image/*" 
              @change="handleFileSelect" 
              style="display: none"
            />
            
            <div v-if="uploadForm.files.length === 0" class="upload-placeholder">
              <Icon icon="mdi:cloud-upload" class="upload-icon" />
              <p>拖放图片到此处，或 <span class="select-files" @click="selectFiles">选择文件</span></p>
            </div>
            
            <div v-else class="selected-files">
              <div v-for="(file, index) in uploadForm.files" :key="index" class="selected-file">
                <div class="selected-file-preview">
                  <img :src="getPreviewUrl(file)" :alt="file.name" />
                  
                  <!-- 添加进度层和动画效果 -->
                  <div v-if="uploadProgress[file.name]" class="upload-overlay" 
                       :class="{ 'completed': uploadProgress[file.name].percentage >= 100 }">
                    <div class="upload-progress-circle">
                      <svg viewBox="0 0 36 36">
                        <path class="upload-progress-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path class="upload-progress-bar"
                          :stroke-dasharray="`${uploadProgress[file.name].percentage}, 100`"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" class="upload-progress-text">
                          {{ Math.round(uploadProgress[file.name].percentage) }}%
                        </text>
                      </svg>
                      
                      <!-- 完成图标 -->
                      <div v-if="uploadProgress[file.name].percentage >= 100" class="upload-completed-icon">
                        <Icon icon="mdi:check" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="selected-file-info">
                  <div class="selected-file-name-input">
                    <input 
                      type="text" 
                      v-model="uploadForm.fileNames[file.name]" 
                      placeholder="自定义名称..." 
                      class="file-name-input"
                    />
                    <div class="file-extension">{{ getFileExtension(file.name) }}</div>
                  </div>
                  <div class="selected-file-size">{{ formatSize(file.size) }}</div>
                  <div v-if="uploadProgress[file.name]" class="upload-progress">
                    <div class="progress-bar" :style="{ width: uploadProgress[file.name].percentage + '%' }">
                      <!-- 添加波浪动画效果 -->
                      <div class="wave-effect"></div>
                    </div>
                    <div class="progress-text">{{ Math.round(uploadProgress[file.name].percentage) }}%</div>
                  </div>
                </div>
                <button class="remove-file-btn" @click="removeFile(index)">
                  <Icon icon="mdi:close" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showUploadModal = false">取消</button>
          <button 
            class="confirm-btn" 
            @click="uploadImages"
            :disabled="uploadForm.files.length === 0 || isUploading"
          >
            <span v-if="isUploading">上传中...</span>
            <span v-else>上传</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <div class="modal" v-if="showPreviewModal" @click.self="showPreviewModal = false">
      <div class="preview-modal-content">
        <div class="preview-image-container">
          <img :src="previewImageUrl" alt="预览图片" />
        </div>
        <div class="preview-info">
          <div class="preview-name">{{ currentImage?.name }}</div>
          <div class="preview-details">
            <div class="preview-detail">
              <Icon icon="mdi:calendar" />
              <span>{{ formatDate(currentImage?.createdAt) }}</span>
            </div>
            <div class="preview-detail">
              <Icon icon="mdi:file-size" />
              <span>{{ formatSize(currentImage?.size) }}</span>
            </div>
            <div class="preview-detail">
              <Icon icon="mdi:file-type" />
              <span>{{ currentImage?.type }}</span>
            </div>
          </div>
          <div class="preview-actions">
            <button class="preview-btn" @click="copyImageUrl(currentImage?.url)">
              <Icon icon="mdi:content-copy" />
              复制链接
            </button>
            <button class="preview-btn" @click="downloadImage">
              <Icon icon="mdi:download" />
              下载
            </button>
            <button class="preview-delete-btn" @click="confirmDeleteImage(currentImage)">
              <Icon icon="mdi:delete" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div class="modal" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-content">
        <h3>删除图片</h3>
        <div class="modal-body">
          <p>确定要删除图片 <strong>{{ currentImage?.name }}</strong> 吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteConfirm = false">取消</button>
          <button class="delete-confirm-btn" @click="deleteImage">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 批量删除确认对话框 -->
    <div class="modal" v-if="showBatchDeleteConfirm" @click.self="showBatchDeleteConfirm = false">
      <div class="modal-content">
        <h3>批量删除图片</h3>
        <div class="modal-body">
          <p>确定要删除选中的 <strong>{{ selectedImages.length }}</strong> 张图片吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showBatchDeleteConfirm = false">取消</button>
          <button class="delete-confirm-btn" @click="batchDeleteImages">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div class="modal" v-if="showRenameModal" @click.self="showRenameModal = false">
      <div class="modal-content">
        <h3>重命名图片</h3>
        <div class="modal-body">
          <div class="form-group">
            <div class="original-name">
              <label>原名称</label>
              <div class="original-name-display">{{ currentImage?.name }}</div>
            </div>
            <div class="form-group">
              <label for="new-image-name">新名称</label>
              <input 
                type="text" 
                id="new-image-name" 
                v-model="renameForm.newName" 
                placeholder="输入新名称..."
                @keydown.enter="renameImage"
              />
              <div class="name-tips">
                <Icon icon="mdi:information-outline" />
                <span>无需输入文件后缀，系统将自动保留原格式。不支持以下特殊字符：\ / : * ? " &lt; &gt; |</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showRenameModal = false">取消</button>
          <button class="confirm-btn" @click="renameImage" :disabled="!renameForm.newName">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useMessage } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'

interface Image {
  id: number
  name: string
  url: string
  thumbnailUrl?: string
  type: string
  size: number
  contentType?: string
  path?: string
  createdAt: string
  updatedAt: string
}

const images = ref<Image[]>([])
const isLoading = ref(false)
const isUploading = ref(false)
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteConfirm = ref(false)
const currentImage = ref<Image | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewImageUrl = ref('')

// 筛选和排序
const filterType = ref('all')
const sortOrder = ref('newest')
const searchQuery = ref('')

// 上传表单
const uploadForm = ref({
  type: 'image',
  files: [] as File[],
  fileNames: {} as Record<string, string>
})

// 新增WebSocket相关变量
const stompClient = ref<any>(null)
const uploadProgress = ref<Record<string, { percentage: number, status: string }>>({})
const userStore = useUserStore()

// 在data区域添加选中的图片数组
const selectedImages = ref<number[]>([])
const isSelectionMode = ref(false)
const showBatchDeleteConfirm = ref(false)

// 添加重命名相关变量
const showRenameModal = ref(false)
const renameForm = ref({
  newName: ''
})

// 获取图片数据
const fetchImages = async () => {
  isLoading.value = true
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    if (filterType.value !== 'all') {
      params.append('type', filterType.value)
    }
    params.append('sort', sortOrder.value)
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    
    const response = await fetch(`http://localhost:8088/api/images?${params.toString()}`, {
      credentials: 'include',
      headers: {
        'Referer': 'https://www.dannysummer.asia'
      }
    })
    const data = await response.json()
    
    if (data.success || data.code === 200) {
      images.value = data.data || []
      console.log('图片列表:', images.value)
    } else {
      throw new Error(data.message || '获取图片失败')
    }
  } catch (error: any) {
    console.error('获取图片失败:', error)
    showMessage.error(error.message || '获取图片失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 预览图片
const previewImage = (image: Image) => {
  currentImage.value = image
  previewImageUrl.value = image.url
  showPreviewModal.value = true
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化文件大小
const formatSize = (bytes?: number) => {
  if (bytes === undefined) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 选择文件
const selectFiles = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    // 添加新文件并为每个文件设置默认名称
    const newFiles = Array.from(input.files)
    newFiles.forEach(file => {
      // 获取文件名（不包含扩展名）
      const nameWithoutExt = file.name.lastIndexOf('.') > 0 
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : file.name
        
      // 设置默认名称
      uploadForm.value.fileNames[file.name] = nameWithoutExt
    })
    
    uploadForm.value.files = [...uploadForm.value.files, ...newFiles]
    input.value = '' // 清空input，允许再次选择相同文件
  }
}

// 处理拖放
const dragover = () => {
  isDragging.value = true
}

const dragleave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    
    // 为拖放的每个文件设置默认名称
    files.forEach(file => {
      const nameWithoutExt = file.name.lastIndexOf('.') > 0 
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : file.name
        
      // 设置默认名称
      uploadForm.value.fileNames[file.name] = nameWithoutExt
    })
    
    uploadForm.value.files = [...uploadForm.value.files, ...files]
  }
}

// 获取预览URL
const getPreviewUrl = (file: File) => {
  return URL.createObjectURL(file)
}

// 移除文件
const removeFile = (index: number) => {
  // 获取要移除的文件
  const fileToRemove = uploadForm.value.files[index]
  // 移除文件名映射
  if (fileToRemove && uploadForm.value.fileNames[fileToRemove.name]) {
    delete uploadForm.value.fileNames[fileToRemove.name]
  }
  // 移除文件
  uploadForm.value.files.splice(index, 1)
}

// 复制图片URL
const copyImageUrl = (url?: string) => {
  if (!url) return
  
  navigator.clipboard.writeText(url)
    .then(() => {
      showMessage.success('已复制图片链接到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      showMessage.error('复制失败，请手动复制')
    })
}

// 下载图片
const downloadImage = async () => {
  if (!currentImage.value) return
  
  try {
    // 显示下载中提示
    showMessage.info('正在下载图片...')
    
    const response = await fetch(currentImage.value.url, {
      headers: {
        'Referer': 'https://www.dannysummer.asia'
      }
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentImage.value.name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    showMessage.success('下载成功')
  } catch (error: any) {
    console.error('下载失败:', error)
    showMessage.error(error.message || '下载失败，请重试')
  }
}

// 确认删除图片
const confirmDeleteImage = (image: Image | null) => {
  if (!image) return
  
  currentImage.value = image
  showDeleteConfirm.value = true
  showPreviewModal.value = false
}

// 删除图片
const deleteImage = async () => {
  if (!currentImage.value) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/images/${currentImage.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Referer': 'https://www.dannysummer.asia'
      }
    })
    
    const data = await response.json()
    if (data.success || data.code === 200) {
      showMessage.success('删除图片成功')
      showDeleteConfirm.value = false
      currentImage.value = null
      await fetchImages()
    } else {
      throw new Error(data.message || '删除图片失败')
    }
  } catch (error: any) {
    console.error('删除图片失败:', error)
    showMessage.error(error.message || '删除图片失败，请重试')
  }
}

// 连接WebSocket
const connectWebSocket = () => {
  try {
    const socket = new SockJS('http://localhost:8088/ws')
    stompClient.value = Stomp.over(socket)
    
    // 关闭控制台日志
    stompClient.value.debug = () => {}
    
    stompClient.value.connect({}, () => {
      console.log('WebSocket连接成功')
      
      // 获取当前用户标识
      const username = userStore.userInfo?.username || 'guest'
      
      // 订阅进度通道
      stompClient.value.subscribe(`/topic/upload-progress/${username}`, (message: any) => {
        const progress = JSON.parse(message.body)
        console.log('上传进度更新:', progress)
        
        // 更新文件上传进度
        if (progress.filename && progress.status !== 'FAILED') {
          uploadProgress.value[progress.filename] = {
            percentage: progress.percentage,
            status: progress.status
          }
        } else if (progress.status === 'FAILED') {
          showMessage.error(`文件 ${progress.filename} 上传失败: ${progress.errorMessage || '未知错误'}`)
        }
      })
    }, (error: any) => {
      console.error('WebSocket连接失败:', error)
      showMessage.error('进度监控连接失败，将使用普通上传')
    })
  } catch (error) {
    console.error('WebSocket初始化失败:', error)
  }
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.disconnect()
    console.log('WebSocket连接已断开')
  }
}

// 上传图片方法添加回退机制
const uploadImages = async () => {
  if (uploadForm.value.files.length === 0) return
  
  // 验证文件
  const invalidFiles = uploadForm.value.files.filter(file => !file.type.startsWith('image/'))
  if (invalidFiles.length > 0) {
    showMessage.error(`有 ${invalidFiles.length} 个非图片文件，请移除后重试`)
    return
  }
  
  // 检查文件大小
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const oversizeFiles = uploadForm.value.files.filter(file => file.size > MAX_SIZE)
  if (oversizeFiles.length > 0) {
    showMessage.error(`有 ${oversizeFiles.length} 个文件超过10MB，请压缩后重试`)
    return
  }
  
  isUploading.value = true
  
  // 重置上传进度
  uploadProgress.value = {}
  
  try {
    // 检查WebSocket是否可用
    let useWebSocket = false
    try {
      if (!stompClient.value || !stompClient.value.connected) {
        const connectPromise = new Promise((resolve, reject) => {
          try {
            const socket = new SockJS('http://localhost:8088/ws')
            stompClient.value = Stomp.over(socket)
            
            // 关闭控制台日志
            stompClient.value.debug = () => {}
            
            // 设置5秒超时
            const timeout = setTimeout(() => {
              reject(new Error('WebSocket连接超时'))
            }, 5000)
            
            stompClient.value.connect({}, () => {
              clearTimeout(timeout)
              resolve(true)
            }, (error: any) => {
              clearTimeout(timeout)
              reject(error)
            })
          } catch (e) {
            reject(e)
          }
        })
        
        // 等待连接，最多5秒
        await Promise.race([
          connectPromise,
          new Promise(r => setTimeout(() => r(false), 5000))
        ])
      }
      
      useWebSocket = !!(stompClient.value && stompClient.value.connected)
    } catch (e) {
      console.error('WebSocket连接失败:', e)
      useWebSocket = false
    }
    
    if (useWebSocket) {
      // 使用WebSocket方式上传
      console.log('使用WebSocket进度上传')
      
      const username = userStore.userInfo?.username || 'guest'
      
      // 订阅进度通道
      stompClient.value.subscribe(`/topic/upload-progress/${username}`, (message: any) => {
        const progress = JSON.parse(message.body)
        console.log('上传进度更新:', progress)
        
        // 更新文件上传进度
        if (progress.filename && progress.status !== 'FAILED') {
          uploadProgress.value[progress.filename] = {
            percentage: progress.percentage,
            status: progress.status
          }
        } else if (progress.status === 'FAILED') {
          showMessage.error(`文件 ${progress.filename} 上传失败: ${progress.errorMessage || '未知错误'}`)
        }
      })
      
      // 并行上传所有文件
      const uploadPromises = uploadForm.value.files.map(async (file) => {
        // 为每个文件初始化进度
        uploadProgress.value[file.name] = { 
          percentage: 0,
          status: 'INITIATED'
        }
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', uploadForm.value.type)
        formData.append('username', username)
        
        // 添加自定义文件名
        if (uploadForm.value.fileNames[file.name]) {
          formData.append('customName', uploadForm.value.fileNames[file.name])
        }
        
        return fetch('http://localhost:8088/api/image/upload-with-progress', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Referer': 'https://www.dannysummer.asia'
          },
          body: formData
        }).then(async (response) => {
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.message || '上传失败')
          }
          
          return data
        })
      })
      
      const results = await Promise.allSettled(uploadPromises)
      
      // 统计成功和失败的数量
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failedCount = results.filter(r => r.status === 'rejected').length
      
      if (successCount > 0) {
        showMessage.success(`成功上传 ${successCount} 个图片${failedCount > 0 ? `，${failedCount} 个失败` : ''}`)
        showUploadModal.value = false
        uploadForm.value.files = []
        uploadForm.value.fileNames = {}
        await fetchImages()
      } else if (failedCount > 0) {
        showMessage.error(`所有图片上传失败`)
      }
    } else {
      // 回退到普通上传方式
      console.log('回退到普通上传方式')
      showMessage.info('进度监控不可用，使用普通上传')
      
      const formData = new FormData()
      uploadForm.value.files.forEach(file => {
        formData.append('files', file)
        
        // 添加自定义文件名
        if (uploadForm.value.fileNames[file.name]) {
          formData.append('customNames', uploadForm.value.fileNames[file.name])
        }
      })
      formData.append('type', uploadForm.value.type)
      
      const response = await fetch('http://localhost:8088/api/images/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Referer': 'https://www.dannysummer.asia'
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success || data.code === 200) {
        const uploadedCount = data.data ? data.data.length : 0
        showMessage.success(`上传成功 ${uploadedCount} 个图片`)
        showUploadModal.value = false
        uploadForm.value.files = []
        uploadForm.value.fileNames = {}
        await fetchImages()
      } else {
        throw new Error(data.message || '上传图片失败')
      }
    }
  } catch (error: any) {
    console.error('上传图片失败:', error)
    showMessage.error(error.message || '上传图片失败，请重试')
  } finally {
    isUploading.value = false
  }
}

// 替换简易提示方法为全局提示组件
const showMessage = useMessage()

// 页面挂载时连接WebSocket
onMounted(() => {
  fetchImages()
  connectWebSocket()
})

// 页面卸载前断开WebSocket
onBeforeUnmount(() => {
  disconnectWebSocket()
  
  // 释放所有预览URL
  uploadForm.value.files.forEach(file => {
    URL.revokeObjectURL(getPreviewUrl(file))
  })
})

// 添加选择相关方法
// 进入选择模式
const enterSelectionMode = () => {
  isSelectionMode.value = true
  selectedImages.value = []
}

// 退出选择模式
const exitSelectionMode = () => {
  isSelectionMode.value = false
  selectedImages.value = []
}

// 切换图片选择状态
const toggleImageSelection = (imageId: number) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageId)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedImages.value.length === images.value.length) {
    // 已全选，则取消全选
    selectedImages.value = []
  } else {
    // 未全选，则全选
    selectedImages.value = images.value.map(image => image.id)
  }
}

// 确认批量删除
const confirmBatchDelete = () => {
  if (selectedImages.value.length === 0) return
  showBatchDeleteConfirm.value = true
}

// 批量删除图片
const batchDeleteImages = async () => {
  if (selectedImages.value.length === 0) return
  
  try {
    showMessage.info(`正在删除 ${selectedImages.value.length} 张图片...`)
    
    // 创建所有删除请求的Promise数组
    const deletePromises = selectedImages.value.map(imageId => 
      fetch(`http://localhost:8088/api/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Referer': 'https://www.dannysummer.asia'
        }
      }).then(response => response.json())
    )
    
    // 等待所有删除请求完成
    const results = await Promise.allSettled(deletePromises)
    
    // 计算成功和失败的数量
    const successCount = results.filter(
      r => r.status === 'fulfilled' && (r.value.success || r.value.code === 200)
    ).length
    
    // 显示结果
    if (successCount === selectedImages.value.length) {
      showMessage.success(`成功删除 ${successCount} 张图片`)
    } else {
      showMessage.warning(`已删除 ${successCount} 张图片，${selectedImages.value.length - successCount} 张删除失败`)
    }
    
    // 关闭对话框，退出选择模式并刷新列表
    showBatchDeleteConfirm.value = false
    exitSelectionMode()
    await fetchImages()
  } catch (error: any) {
    console.error('批量删除图片失败:', error)
    showMessage.error(error.message || '批量删除图片失败，请重试')
  }
}

// 显示重命名对话框
const showRenameDialog = (image: Image) => {
  currentImage.value = image
  // 去除文件后缀名
  const nameWithoutExt = image.name.lastIndexOf('.') > 0 
    ? image.name.substring(0, image.name.lastIndexOf('.'))
    : image.name
  renameForm.value.newName = nameWithoutExt
  showRenameModal.value = true
}

// 重命名图片
const renameImage = async () => {
  if (!currentImage.value || !renameForm.value.newName) return
  
  try {
    // 准备请求数据
    const formData = new URLSearchParams()
    formData.append('newName', renameForm.value.newName)
    
    // 发送重命名请求
    const response = await fetch(`http://localhost:8088/api/image/${currentImage.value.id}/rename`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://www.dannysummer.asia'
      },
      body: formData
    })
    
    const data = await response.json()
    if (data.success || data.code === 200) {
      showMessage.success('图片重命名成功')
      showRenameModal.value = false
      
      // 刷新图片列表
      await fetchImages()
    } else {
      throw new Error(data.message || '重命名失败')
    }
  } catch (error: any) {
    console.error('重命名失败:', error)
    showMessage.error(error.message || '重命名失败，请重试')
  }
}

// 获取文件扩展名
const getFileExtension = (filename: string) => {
  return filename.lastIndexOf('.') > 0 
    ? filename.substring(filename.lastIndexOf('.'))
    : '';
}
</script>

<style scoped>
.image-management-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
  color: rgba(0, 162, 255, 0.9);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn, .upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover, .upload-btn:hover {
  background: var(--primary-color-dark);
}

.upload-btn {
  background: rgba(76, 175, 80, 0.9);
}

.upload-btn:hover {
  background: rgba(76, 175, 80, 1);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-group, .search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group select,
.search-group input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-group input {
  flex: 1;
}

.search-group button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
}

.images-container {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  min-height: 300px;
  padding: 20px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.image-preview {
  height: 150px;
  overflow: hidden;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.image-info {
  padding: 10px;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.image-actions {
  display: flex;
  padding: 10px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.copy-btn, .rename-btn, .delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  color: var(--primary-color);
}

.rename-btn:hover {
  color: #FF9800;
}

.delete-btn:hover {
  color: #f44336;
}

.no-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.no-images-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  transition: all 0.3s ease;
}

.upload-area.active {
  border-color: var(--primary-color);
  background: rgba(33, 150, 243, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.select-files {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
}

.selected-files {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  width: 100%;
}

.selected-file {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-file-preview {
  height: 100px;
  overflow: hidden;
}

.selected-file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-file-info {
  padding: 8px;
}

.selected-file-name-input {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  position: relative;
}

.file-name-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.file-extension {
  position: absolute;
  right: 5px;
  font-size: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.selected-file-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.selected-file-size {
  font-size: 10px;
  color: var(--text-secondary);
}

.remove-file-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 10px;
  z-index: 2;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-image-container {
  flex: 1;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.preview-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-info {
  padding: 16px;
  background: var(--bg-primary);
}

.preview-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.preview-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.preview-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.preview-btn, .preview-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-btn {
  background: var(--primary-color);
  color: white;
}

.preview-delete-btn {
  background: #f44336;
  color: white;
}

.modal-content h3 {
  margin: 0 0 20px;
  color: var(--text-primary);
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn, .delete-confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.delete-confirm-btn {
  background: #f44336;
  color: white;
}

.confirm-btn:disabled, .delete-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .preview-modal-content {
    flex-direction: column;
  }
  
  .preview-image-container {
    max-height: 50vh;
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .images-container,
:root[class='dark-theme'] .filter-options {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .image-card {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .loading-container {
  background: rgba(30, 30, 30, 0.8);
}

:root[class='dark-theme'] .modal-content,
:root[class='dark-theme'] .preview-modal-content,
:root[class='dark-theme'] .preview-info {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .form-group select,
:root[class='dark-theme'] .filter-group select,
:root[class='dark-theme'] .search-group input,
:root[class='dark-theme'] .selected-file {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .cancel-btn {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .upload-area.active {
  background: rgba(33, 150, 243, 0.1);
}

:root[class='dark-theme'] .image-actions {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

/* 更新进度条样式 */
.upload-progress {
  margin-top: 4px;
  height: 4px;
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 162, 255, 0.8), rgba(0, 217, 255, 0.9));
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(0, 162, 255, 0.5);
}

/* 波浪效果 */
.wave-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: wave 1.5s linear infinite;
  background-size: 200% 100%;
}

@keyframes wave {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.progress-text {
  position: absolute;
  top: -15px;
  right: 0;
  font-size: 10px;
  line-height: 1;
  color: var(--text-primary);
  font-weight: 500;
}

/* 上传覆盖层 */
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  backdrop-filter: blur(2px);
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 圆形进度条 */
.upload-progress-circle {
  position: relative;
  width: 60px;
  height: 60px;
}

.upload-progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.upload-progress-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2.5;
}

.upload-progress-bar {
  fill: none;
  stroke: rgba(0, 217, 255, 0.9);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(0, 217, 255, 0.8));
}

.upload-progress-text {
  fill: white;
  font-size: 8px;
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: 600;
}

/* 上传完成状态 */
.upload-overlay.completed {
  background: rgba(0, 0, 0, 0.4);
  animation: pulseComplete 1.5s ease infinite;
}

@keyframes pulseComplete {
  0% {
    background: rgba(0, 0, 0, 0.4);
  }
  50% {
    background: rgba(0, 128, 0, 0.4);
  }
  100% {
    background: rgba(0, 0, 0, 0.4);
  }
}

.upload-completed-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #4CAF50;
  font-size: 24px;
  animation: scaleIn 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
}

@keyframes scaleIn {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .upload-progress {
  background-color: rgba(30, 30, 30, 0.6);
}

:root[class='dark-theme'] .progress-bar {
  background: linear-gradient(90deg, rgba(0, 162, 255, 0.8), rgba(0, 217, 255, 0.9));
  box-shadow: 0 0 8px rgba(0, 162, 255, 0.4);
}

:root[class='dark-theme'] .upload-overlay {
  background: rgba(0, 0, 0, 0.7);
}

:root[class='dark-theme'] .upload-overlay.completed {
  background: rgba(0, 0, 0, 0.6);
  animation: darkPulseComplete 1.5s ease infinite;
}

@keyframes darkPulseComplete {
  0% {
    background: rgba(0, 0, 0, 0.6);
  }
  50% {
    background: rgba(0, 100, 0, 0.5);
  }
  100% {
    background: rgba(0, 0, 0, 0.6);
  }
}

/* 新增的样式 */
.select-btn, 
.cancel-select-btn, 
.batch-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn {
  background: rgba(33, 150, 243, 0.9);
  color: white;
}

.select-btn:hover {
  background: rgba(30, 136, 229, 1);
}

.cancel-select-btn {
  background: rgba(158, 158, 158, 0.9);
  color: white;
}

.cancel-select-btn:hover {
  background: rgba(117, 117, 117, 1);
}

.batch-delete-btn {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.batch-delete-btn:hover {
  background: rgba(229, 57, 53, 1);
}

.batch-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 选择模式下的图片卡片样式 */
.image-card.selected {
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.8);
}

.selection-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  z-index: 2;
  color: white;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.5));
}

.selected-icon {
  color: rgba(33, 150, 243, 1);
  font-size: 24px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
}

.unselected-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
}

/* 使选择模式下的图片点击区域可以被点击 */
.image-preview {
  position: relative;
  cursor: pointer;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .select-btn {
  background: rgba(30, 136, 229, 0.8);
}

:root[class='dark-theme'] .cancel-select-btn {
  background: rgba(97, 97, 97, 0.8);
}

:root[class='dark-theme'] .batch-delete-btn {
  background: rgba(211, 47, 47, 0.8);
}

:root[class='dark-theme'] .image-card.selected {
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.6);
}

/* 批量操作工具栏 */
.batch-operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.3s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.select-all input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.checkbox-text {
  color: var(--text-primary);
  font-size: 14px;
}

.selection-count {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 4px 10px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.batch-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #f44336;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-action-btn:hover {
  background: #e53935;
}

.batch-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .batch-operation-bar {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .selection-count {
  background: rgba(33, 150, 243, 0.15);
}

/* 添加输入框样式 */
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

/* 暗色主题适配 */
:root[class='dark-theme'] .form-group input {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

/* 新增的样式 */
.original-name {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-color);
}

.original-name label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 14px;
}

.original-name-display {
  padding: 10px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  word-break: break-all;
}

.name-tips {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.name-tips .iconify {
  margin-top: 2px;
  flex-shrink: 0;
  color: #FF9800;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .original-name-display {
  background-color: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .original-name {
  border-color: var(--border-color-dark);
}
</style> 