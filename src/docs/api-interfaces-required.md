# 📡 后端API接口需求文档

## 概述
前端已完全移除硬编码数据，所有功能都依赖以下API接口。请按照此文档实现后端API。

## 🔗 基础配置
- **API Base URL**: `http://localhost:8088/api`
- **响应格式**: JSON
- **认证方式**: Cookie (credentials: 'include')

## 📋 必需的API接口

### 1. 文章详情接口
```http
GET /api/article/{id}
```
**功能**: 获取指定ID的已发布文章详情
**参数**: 
- `id` (path): 文章ID (number)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容...",
    "status": "PUBLISHED",
    "createTime": "2025-01-01T00:00:00Z",
    "updateTime": "2025-01-01T00:00:00Z",
    "views": 100,
    "coverImage": "/images/cover.jpg",
    "category": "技术分享",
    "tags": ["Vue3", "TypeScript"],
    "author": "作者名",
    "license": "CC BY-NC-SA 4.0",
    "allowComments": true,
    "sticky": false,
    "comments": 5
  }
}
```

### 2. 文章内容接口
```http
GET /api/article/content/{id}
```
**功能**: 获取文章的Markdown内容
**参数**: 
- `id` (path): 文章ID (number)
**响应**: 纯文本内容 (Content-Type: text/plain; charset=utf-8)

### 3. 最新文章接口
```http
GET /api/articles/recent?limit={limit}
```
**功能**: 获取最新发布的文章列表
**参数**: 
- `limit` (query): 返回数量，默认5 (number)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "最新文章",
        "createTime": "2025-01-01T00:00:00Z",
        "views": 100,
        "cover": "/images/cover.jpg"
      }
    ]
  }
}
```

### 4. 相关文章接口
```http
GET /api/articles/{articleId}/related?limit={limit}
```
**功能**: 获取与指定文章相关的文章列表
**参数**: 
- `articleId` (path): 当前文章ID (number)
- `limit` (query): 返回数量，默认4 (number)

**响应格式**: 同最新文章接口

### 5. 文章导航接口
```http
GET /api/articles/{articleId}/navigation
```
**功能**: 获取上一篇和下一篇文章信息
**参数**: 
- `articleId` (path): 当前文章ID (number)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "prevArticle": {
      "id": 2,
      "title": "上一篇文章",
      "cover": "/images/prev.jpg",
      "description": "上一篇文章描述"
    },
    "nextArticle": {
      "id": 3,
      "title": "下一篇文章", 
      "cover": "/images/next.jpg",
      "description": "下一篇文章描述"
    }
  }
}
```

### 6. 文章归档接口
```http
GET /api/articles/archive
```
**功能**: 获取按年份分组的文章归档数据
**响应示例**:
```json
{
  "success": true,
  "data": {
    "archive": [
      {
        "year": "2025",
        "articles": [
          {
            "id": 1,
            "title": "文章标题",
            "createTime": "2025-01-01",
            "cover": "/images/cover.jpg"
          }
        ]
      },
      {
        "year": "2024", 
        "articles": [...]
      }
    ]
  }
}
```

### 7. 已发布文章列表接口
```http
GET /api/articles/published?page={page}&limit={limit}
```
**功能**: 分页获取已发布文章列表
**参数**: 
- `page` (query): 页码，默认1 (number)
- `limit` (query): 每页数量，默认10 (number)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## 🔧 管理接口 (可选)

### 创建文章
```http
POST /api/article
Content-Type: application/json
```

### 更新文章
```http
PUT /api/article/{id}
Content-Type: application/json
```

### 保存草稿
```http
POST /api/article/articleDraftSave
Content-Type: multipart/form-data
```

### 设置文章状态
```http
POST /api/article/{id}/status?status={status}
```

## 🚨 重要说明

1. **状态过滤**: 所有公开接口只应返回 `status: "PUBLISHED"` 的文章
2. **错误处理**: 当文章不存在或未发布时，返回适当的HTTP状态码
3. **CORS配置**: 确保后端支持前端域名的跨域请求
4. **认证**: 支持Cookie认证方式

## 📊 优先级

**高优先级** (前端页面正常显示必需):
- GET /api/article/{id}
- GET /api/article/content/{id}
- GET /api/articles/archive

**中优先级** (增强用户体验):
- GET /api/articles/recent
- GET /api/articles/{articleId}/related
- GET /api/articles/{articleId}/navigation

**低优先级** (管理功能):
- 其他管理接口

## 🔍 测试方法
```bash
# 测试文章详情接口
curl -X GET "http://localhost:8088/api/article/1" \
  -H "Accept: application/json"

# 测试归档接口  
curl -X GET "http://localhost:8088/api/articles/archive" \
  -H "Accept: application/json"
``` 