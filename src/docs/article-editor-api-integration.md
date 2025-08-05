# 文章编辑器 API 集成方案

## 📋 API 调用规范

### 🔧 认证要求
- **必须已登录**: 所有请求需要用户已登录状态
- **Credentials**: 请求必须包含 `credentials: 'include'`
- **Content-Type**: PUT/POST 请求必须设置 `Content-Type: application/json`

### 🎯 文章状态管理
- `DRAFT` = 草稿状态
- `PUBLISHED` = 已发布状态

## 🚀 API 端点和调用方式

### 1. 保存草稿
```javascript
// POST /api/article
const articleData = {
  title: "文章标题",
  content: "文章内容",
  excerpt: "文章摘要",
  categoryId: 1,
  tags: ["标签1", "标签2"],
  coverImage: "封面图URL",
  slug: "url-alias",
  allowComments: true,
  sticky: false,
  status: "DRAFT",
  publishDate: "2025-01-02T10:00"
};

const response = await fetch('/api/article', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(articleData)
});
```

### 2. 发布文章 (更新状态)
```javascript
// PUT /api/article/{id}
const updateData = {
  status: 'PUBLISHED'
};

const response = await fetch(`/api/article/${articleId}`, {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});
```

### 3. 更新已发布文章
```javascript
// PUT /api/article/{id}
const articleData = {
  id: articleId,
  title: "更新的标题",
  content: "更新的内容",
  // ... 其他字段
  status: 'PUBLISHED'
};

const response = await fetch(`/api/article/${articleId}`, {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(articleData)
});
```

### 4. 加载文章数据
```javascript
// GET /api/article/{id}
const response = await fetch(`/api/article/${articleId}`, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🔄 推荐的文章发布流程

1. **创建新文章**
   ```
   用户点击"创建文章" → 进入编辑器 → 编写内容 → 保存草稿(POST)
   ```

2. **发布文章**
   ```
   草稿状态 → 点击"发布" → 更新状态为PUBLISHED(PUT)
   ```

3. **编辑已发布文章**
   ```
   已发布文章 → 修改内容 → 保存更新(PUT)
   ```

## 📦 ArticleEditor.vue 的主要修改

### ✅ 已修复的API调用

#### 1. 保存草稿函数 (`saveDraft`)
- **请求方式**: `POST /api/article`
- **数据格式**: JSON
- **状态**: 设置为 `DRAFT`
- **认证**: `credentials: 'include'`

#### 2. 发布文章函数 (`publish`)
- **请求方式**: `PUT /api/article/{id}`
- **数据格式**: JSON (`{status: 'PUBLISHED'}`)
- **逻辑**: 先保存草稿(如果是新文章)，再更新状态

#### 3. 通用保存函数 (`saveArticle`)
- **新文章**: `POST /api/article`
- **更新文章**: `PUT /api/article/{id}`
- **数据格式**: JSON
- **状态管理**: 支持 `DRAFT` 和 `PUBLISHED`

#### 4. 加载文章函数 (`loadArticle`)
- **请求方式**: `GET /api/article/{id}`
- **数据处理**: 完整的字段映射和状态转换
- **容错处理**: 友好的错误提示

### 🎨 用户体验改进

#### 1. 按钮状态管理
- 保存/发布时显示loading状态
- 禁用按钮防止重复提交
- 添加快捷键提示

#### 2. 键盘快捷键
- `Ctrl+S`: 保存草稿
- `Ctrl+Shift+P`: 发布文章  
- `Ctrl+B`: 加粗(编辑器内)
- `Ctrl+I`: 斜体(编辑器内)

#### 3. 错误处理
- 统一的错误提示格式
- 详细的错误信息
- API调用失败时的友好提示

#### 4. 状态同步
- 本地状态与API返回数据同步
- 文章ID自动更新(新建文章)
- 路由参数同步

## 🔧 技术要点

### 数据结构映射
```javascript
// 前端状态 → API状态
'draft' → 'DRAFT'
'published' → 'PUBLISHED'

// API状态 → 前端状态
'DRAFT' → 'draft'
'PUBLISHED' → 'published'
```

### 时间格式处理
```javascript
// 发布时间格式化
publishDate: new Date(dateString).toISOString().slice(0, 16)
// 输出: "2025-01-02T10:00"
```

### 权限控制
- 只能编辑自己的文章
- 需要登录状态
- 使用Cookie认证

## 🐛 故障排除

### 常见错误及解决方案

#### 405 Method Not Allowed
- **原因**: 请求方法不正确
- **解决**: 确保使用正确的HTTP方法(POST/PUT/GET)

#### 400 Bad Request
- **原因**: 请求格式错误
- **解决**: 检查Content-Type和JSON格式

#### 401 Unauthorized
- **原因**: 用户未登录
- **解决**: 确保用户已登录且cookies正确传递

#### 403 Forbidden
- **原因**: 权限不足
- **解决**: 确保用户有编辑权限

#### 500 Internal Server Error
- **原因**: 服务器错误
- **解决**: 检查服务器日志，确保API端点正确实现

## 📝 待实现的后端API

确保以下API端点已正确实现：

- `POST /api/article` - 创建/保存草稿
- `PUT /api/article/{id}` - 更新文章
- `GET /api/article/{id}` - 获取文章详情  
- `POST /api/image/upload-with-progress` - 图片上传(带进度)
- `POST /api/images/upload` - 批量图片上传

---

*最后更新: 2025-01-02*
*修改人员: AI Assistant* 