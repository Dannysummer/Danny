# 多吉云对象存储Markdown文章上传指南

本文档详细说明如何使用多吉云对象存储上传和管理Markdown文章文件，包括上传接口、参数说明、请求示例和响应格式。

## 功能概述

系统支持将Markdown文章文件上传到多吉云对象存储，并提供以下功能：

- 获取上传策略和临时凭证
- 直接上传文章文件
- 带进度监控的文章上传
- 文章列表查询
- 文章删除

所有接口都支持认证保护，确保只有已登录用户才能上传和管理自己的文章。

## API端点

### 1. 获取上传策略

获取直接上传到多吉云对象存储所需的临时凭证和策略。

- **URL**: `/api/article/policy`
- **方法**: `GET`
- **权限要求**: 需要身份认证
- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功",
    "data": {
      "accessKeyId": "临时访问密钥ID",
      "secretAccessKey": "临时秘密访问密钥",
      "sessionToken": "临时会话令牌",
      "expires": 1742221496,
      "s3Bucket": "存储桶名称",
      "s3Endpoint": "S3终端节点URL",
      "path": "存储路径"
    }
  }
  ```

### 2. 直接上传文章文件

将Markdown文章文件上传到服务器，由服务器上传到多吉云对象存储。

- **URL**: `/api/article/upload`
- **方法**: `POST`
- **权限要求**: 需要身份认证
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `file`: (必填) Markdown文件
  - `title`: (可选) 文章标题，如不提供则使用文件名(不含扩展名)
- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功",
    "data": {
      "id": 1,
      "title": "文章标题",
      "fileUrl": "https://example.com/path/to/file.md",
      "filePath": "articles/filename.md",
      "fileSize": 1024,
      "fileType": "text/markdown",
      "content": null,
      "createdAt": "2023-01-01T12:00:00",
      "updatedAt": "2023-01-01T12:00:00"
    }
  }
  ```

### 3. 带进度监控的文章上传

上传文章文件并通过WebSocket提供实时进度更新。

- **URL**: `/api/article/upload-with-progress`
- **方法**: `POST`
- **权限要求**: 需要身份认证
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `file`: (必填) Markdown文件
  - `title`: (可选) 文章标题，如不提供则使用文件名(不含扩展名)
- **WebSocket订阅主题**: `/topic/upload-progress/{username}`
- **WebSocket进度消息格式**:
  ```json
  {
    "uploadId": "上传任务唯一标识",
    "filename": "文件名",
    "bytesTransferred": 1024,
    "totalBytes": 2048,
    "percentage": 50.0,
    "status": "IN_PROGRESS", // STARTED, IN_PROGRESS, COMPLETED, FAILED
    "errorMessage": null
  }
  ```
- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功",
    "data": {
      "id": 1,
      "title": "文章标题",
      "fileUrl": "https://example.com/path/to/file.md",
      "filePath": "articles/filename.md",
      "fileSize": 1024,
      "fileType": "text/markdown",
      "content": null,
      "createdAt": "2023-01-01T12:00:00",
      "updatedAt": "2023-01-01T12:00:00"
    }
  }
  ```

### 4. 获取用户文章列表

获取当前登录用户的所有文章列表。

- **URL**: `/api/article/list`
- **方法**: `GET`
- **权限要求**: 需要身份认证
- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "title": "文章标题1",
        "fileUrl": "https://example.com/path/to/file1.md",
        "filePath": "articles/filename1.md",
        "fileSize": 1024,
        "fileType": "text/markdown",
        "content": null,
        "createdAt": "2023-01-01T12:00:00",
        "updatedAt": "2023-01-01T12:00:00"
      },
      {
        "id": 2,
        "title": "文章标题2",
        "fileUrl": "https://example.com/path/to/file2.md",
        "filePath": "articles/filename2.md",
        "fileSize": 2048,
        "fileType": "text/markdown",
        "content": null,
        "createdAt": "2023-01-02T12:00:00",
        "updatedAt": "2023-01-02T12:00:00"
      }
    ]
  }
  ```

### 5. 删除文章

删除指定ID的文章记录及其关联的存储文件。

- **URL**: `/api/article/{id}`
- **方法**: `DELETE`
- **权限要求**: 需要身份认证
- **参数**:
  - `id`: (路径参数) 文章ID
- **成功响应**:
  ```json
  {
    "success": true,
    "message": "文章删除成功",
    "data": null
  }
  ```

## 前端集成示例

### 基本文件上传

```javascript
// 使用普通表单上传
async function uploadArticle(file, title) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }
  
  try {
    const response = await fetch('/api/article/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer ' + 您的认证令牌
      }
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('文章上传成功:', result.data);
      return result.data;
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error) {
    console.error('文章上传错误:', error);
    throw error;
  }
}
```

### 带进度监控的上传

```javascript
// 使用进度监控上传
async function uploadArticleWithProgress(file, title, onProgress) {
  // 1. 连接WebSocket
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);
  const username = '当前用户名';
  
  stompClient.connect({}, frame => {
    console.log('已连接到WebSocket');
    
    // 2. 订阅进度更新主题
    stompClient.subscribe('/topic/upload-progress/' + username, message => {
      const progress = JSON.parse(message.body);
      
      // 处理进度更新
      if (onProgress) {
        onProgress(progress);
      }
      
      // 如果上传完成或失败，关闭连接
      if (progress.status === 'COMPLETED' || progress.status === 'FAILED') {
        stompClient.disconnect();
      }
    });
    
    // 3. 开始上传
    uploadArticle();
  });
  
  // 4. 执行上传
  async function uploadArticle() {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    
    try {
      const response = await fetch('/api/article/upload-with-progress', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + 您的认证令牌
        }
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('文章上传错误:', error);
      stompClient.disconnect();
      throw error;
    }
  }
}

// 使用带进度监控的上传
uploadArticleWithProgress(
  file, 
  '文章标题',
  progress => {
    console.log(`上传进度: ${progress.percentage.toFixed(2)}%`);
    // 更新UI进度条
    updateProgressBar(progress.percentage);
  }
);
```

### 获取用户文章列表

```javascript
async function getUserArticles() {
  try {
    const response = await fetch('/api/article/list', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + 您的认证令牌
      }
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || '获取文章列表失败');
    }
  } catch (error) {
    console.error('获取文章列表错误:', error);
    throw error;
  }
}
```

### 删除文章

```javascript
async function deleteArticle(articleId) {
  try {
    const response = await fetch(`/api/article/${articleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + 您的认证令牌
      }
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('文章删除成功');
      return true;
    } else {
      throw new Error(result.message || '删除失败');
    }
  } catch (error) {
    console.error('文章删除错误:', error);
    throw error;
  }
}
```

## Vue 3组件示例

下面是一个完整的Vue 3组件示例，演示如何集成文章上传和管理功能：

```vue
<template>
  <div class="article-manager">
    <h2>文章管理</h2>
    
    <!-- 上传表单 -->
    <div class="upload-form">
      <h3>上传新文章</h3>
      <div class="form-group">
        <label for="title">标题</label>
        <input type="text" id="title" v-model="title" placeholder="文章标题">
      </div>
      <div class="form-group">
        <label for="file">Markdown文件</label>
        <input type="file" id="file" @change="handleFileChange" accept=".md,.txt">
      </div>
      <div class="form-actions">
        <button @click="uploadArticle" :disabled="!file || uploading">{{ uploading ? '上传中...' : '上传文章' }}</button>
      </div>
      
      <!-- 上传进度条 -->
      <div class="progress-container" v-if="progress.show">
        <div class="progress-label">
          {{ progress.status === 'COMPLETED' ? '上传完成' : 
             progress.status === 'FAILED' ? '上传失败' : 
             `上传中: ${progress.percentage.toFixed(2)}%` }}
        </div>
        <div class="progress-bar">
          <div class="progress-inner" :style="{width: `${progress.percentage}%`}" 
               :class="{'completed': progress.status === 'COMPLETED', 
                        'failed': progress.status === 'FAILED'}"></div>
        </div>
        <div class="progress-error" v-if="progress.errorMessage">
          错误: {{ progress.errorMessage }}
        </div>
      </div>
    </div>
    
    <!-- 文章列表 -->
    <div class="article-list">
      <h3>我的文章</h3>
      <div v-if="loading">加载中...</div>
      <div v-else-if="articles.length === 0" class="no-articles">
        没有文章，请上传一篇新文章。
      </div>
      <ul v-else>
        <li v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-info">
            <h4>{{ article.title }}</h4>
            <div class="article-meta">
              <span>大小: {{ formatFileSize(article.fileSize) }}</span>
              <span>上传时间: {{ formatDate(article.createdAt) }}</span>
            </div>
          </div>
          <div class="article-actions">
            <a :href="article.fileUrl" target="_blank" class="btn-view">查看</a>
            <button @click="deleteArticle(article.id)" class="btn-delete">删除</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
  name: 'ArticleManager',
  setup() {
    const title = ref('');
    const file = ref(null);
    const articles = ref([]);
    const loading = ref(true);
    const uploading = ref(false);
    const progress = ref({
      show: false,
      percentage: 0,
      status: '',
      errorMessage: null
    });
    
    // 获取文章列表
    const fetchArticles = async () => {
      try {
        loading.value = true;
        const response = await fetch('/api/article/list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          articles.value = result.data;
        } else {
          console.error('获取文章失败:', result.message);
        }
      } catch (error) {
        console.error('获取文章错误:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 处理文件选择
    const handleFileChange = (event) => {
      file.value = event.target.files[0];
      // 如果没有设置标题，则使用文件名（不含扩展名）作为标题
      if (!title.value && file.value) {
        const fileName = file.value.name;
        if (fileName.includes('.')) {
          title.value = fileName.substring(0, fileName.lastIndexOf('.'));
        } else {
          title.value = fileName;
        }
      }
    };
    
    // 上传文章（带进度监控）
    const uploadArticle = async () => {
      if (!file.value) return;
      
      // 重置进度
      progress.value = {
        show: true,
        percentage: 0,
        status: 'STARTED',
        errorMessage: null
      };
      
      uploading.value = true;
      
      // 获取当前用户名
      const username = localStorage.getItem('username');
      
      // 连接WebSocket
      const socket = new SockJS('/ws');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, () => {
        // 订阅进度更新主题
        stompClient.subscribe(`/topic/upload-progress/${username}`, message => {
          const progressData = JSON.parse(message.body);
          
          // 更新进度
          progress.value.percentage = progressData.percentage;
          progress.value.status = progressData.status;
          progress.value.errorMessage = progressData.errorMessage;
          
          // 如果上传完成或失败，关闭连接
          if (progressData.status === 'COMPLETED' || progressData.status === 'FAILED') {
            stompClient.disconnect();
            uploading.value = false;
            
            // 上传完成后刷新文章列表
            if (progressData.status === 'COMPLETED') {
              fetchArticles();
            }
          }
        });
        
        // 开始上传
        sendUploadRequest();
      });
      
      // 发送上传请求
      const sendUploadRequest = async () => {
        try {
          const formData = new FormData();
          formData.append('file', file.value);
          if (title.value) {
            formData.append('title', title.value);
          }
          
          const response = await fetch('/api/article/upload-with-progress', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const result = await response.json();
          if (!result.success) {
            progress.value.status = 'FAILED';
            progress.value.errorMessage = result.message || '上传失败';
            stompClient.disconnect();
            uploading.value = false;
          }
        } catch (error) {
          console.error('上传错误:', error);
          progress.value.status = 'FAILED';
          progress.value.errorMessage = error.message || '上传过程中发生错误';
          stompClient.disconnect();
          uploading.value = false;
        }
      };
    };
    
    // 删除文章
    const deleteArticle = async (id) => {
      if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/article/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const result = await response.json();
        if (result.success) {
          // 从列表中移除删除的文章
          articles.value = articles.value.filter(article => article.id !== id);
        } else {
          alert(`删除失败: ${result.message}`);
        }
      } catch (error) {
        console.error('删除文章错误:', error);
        alert(`删除出错: ${error.message}`);
      }
    };
    
    // 格式化文件大小
    const formatFileSize = (size) => {
      if (size === 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };
    
    // 页面加载时获取文章列表
    onMounted(() => {
      fetchArticles();
    });
    
    return {
      title,
      file,
      articles,
      loading,
      uploading,
      progress,
      handleFileChange,
      uploadArticle,
      deleteArticle,
      formatFileSize,
      formatDate
    };
  }
};
</script>

<style scoped>
.article-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.btn-delete {
  background: #f44336;
}

.btn-view {
  background: #2196F3;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  text-decoration: none;
  margin-right: 10px;
}

.progress-container {
  margin-top: 20px;
}

.progress-label {
  margin-bottom: 5px;
}

.progress-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s;
}

.progress-inner.completed {
  background: #4CAF50;
}

.progress-inner.failed {
  background: #f44336;
}

.progress-error {
  color: #f44336;
  margin-top: 5px;
}

.article-list {
  margin-top: 30px;
}

.no-articles {
  color: #666;
  font-style: italic;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.article-info h4 {
  margin: 0 0 10px 0;
}

.article-meta {
  color: #666;
  font-size: 0.9em;
}

.article-meta span {
  margin-right: 15px;
}

.article-actions {
  display: flex;
}
</style>
```

## 注意事项

1. **文件类型验证**: 服务器端设置了允许的文件类型，默认为`text/markdown`、`text/plain`和`application/octet-stream`。如果需要支持其他类型，请修改服务器配置。

2. **文件大小限制**: 默认最大文件大小为10MB。如果需要上传更大的文件，请修改服务器配置。

3. **安全性考虑**: 所有接口都需要身份认证，确保只有已登录用户才能上传和管理文章。

4. **WebSocket连接**: 使用进度监控功能时，请确保正确处理WebSocket连接的生命周期，避免资源泄漏。

5. **错误处理**: 在前端实现中，务必添加适当的错误处理逻辑，捕获并显示上传过程中可能出现的错误。

6. **文件命名**: 上传的文件会使用UUID作为文件名，避免文件名冲突。如果需要保留原始文件名，可以在前端显示时使用`title`字段。

7. **自定义域名**: 如果配置了自定义域名，返回的文件URL将使用自定义域名。否则将使用多吉云对象存储的默认域名。

8. **跨域设置**: 如果前端和后端部署在不同的域名下，请确保正确配置CORS设置，允许跨域请求。

## 故障排除

1. **文件上传失败**: 检查文件类型和大小是否符合服务器限制，确保用户已正确登录。

2. **WebSocket连接失败**: 检查WebSocket配置和防火墙设置，确保WebSocket端点可访问。

3. **无法获取文章列表**: 检查用户认证状态，确保认证令牌有效且未过期。

4. **删除文件失败**: 检查多吉云对象存储的访问权限，确保服务器有删除文件的权限。 