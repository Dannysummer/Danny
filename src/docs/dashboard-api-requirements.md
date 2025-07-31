# Dashboard API 接口需求

## 基础配置
- 基础URL: 通过 `config.api.apiUrl` 获取（默认: `http://localhost:8088/api`）
- 端口配置: 在 `src/config/index.ts` 中统一管理

请确保在代码中使用配置文件中的 API 地址，而不是硬编码的 URL。

## 基本信息

- 认证方式: Bearer Token (通过 Authorization 头部传递)
- 所有请求需支持 credentials 模式以传递 cookie
- 所有响应格式统一为 JSON

## API 端点详情

### 1. 系统状态 API

**请求**
- 端点: `/system/stats`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
{
  "cpu": 45,     // CPU使用率百分比
  "memory": 60,  // 内存使用率百分比
  "disk": 75     // 磁盘使用率百分比
}
```

### 2. 统计数据 API

**请求**
- 端点: `/statistics`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
{
  "articles": 120,    // 文章总数
  "categories": 8,    // 分类总数
  "tags": 24          // 标签总数
}
```

### 3. 文章热图 API

**请求**
- 端点: `/articles/heatmap`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
[
  {
    "date": "2023-06-01",  // 日期（ISO格式）
    "count": 2              // 该日期的文章数量
  },
  {
    "date": "2023-06-02",
    "count": 0
  }
  // ... 返回全年（365天）的数据
]
```

### 4. 最新文章 API

**请求**
- 端点: `/articles/latest`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
[
  {
    "id": 1,
    "title": "文章标题",
    "createdAt": "2023-06-01T08:30:00Z",  // ISO格式创建时间
    "summary": "文章摘要内容...",
    "tags": "标签1,标签2,标签3"  // 逗号分隔的标签
  }
  // ... 更多文章
]
```

### 5. 标签管理 API

#### 5.1 获取所有标签

**请求**
- 端点: `/tags`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
[
  {
    "id": 1,
    "name": "JavaScript",
    "size": 18,             // 字体大小（像素）
    "color": "#4f86f7"      // 标签颜色（HEX或HSL格式）
  }
  // ... 更多标签
]
```

#### 5.2 创建标签

**请求**
- 端点: `/tags`
- 方法: POST
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```
- 请求体:
  ```json
  {
    "name": "新标签",
    "size": 16,
    "color": "#4f86f7"
  }
  ```

**响应**
```json
{
  "id": 25,             // 新创建的标签ID
  "name": "新标签",
  "size": 16,
  "color": "#4f86f7"
}
```

#### 5.3 更新标签

**请求**
- 端点: `/tags/{id}`
- 方法: PUT
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```
- 请求体:
  ```json
  {
    "name": "更新后的标签",
    "size": 20,
    "color": "#ff5500"
  }
  ```

**响应**
```json
{
  "id": 25,
  "name": "更新后的标签",
  "size": 20,
  "color": "#ff5500"
}
```

#### 5.4 删除标签

**请求**
- 端点: `/tags/{id}`
- 方法: DELETE
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
{
  "success": true,
  "message": "标签删除成功"
}
```

### 6. 开发进度 API

#### 6.1 获取所有进度项

**请求**
- 端点: `/progress`
- 方法: GET
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
[
  {
    "id": 1,
    "text": "登录逻辑和后台页面UI",
    "completed": true
  },
  {
    "id": 2,
    "text": "文章管理功能",
    "completed": false
  }
  // ... 更多进度项
]
```

#### 6.2 创建进度项

**请求**
- 端点: `/progress`
- 方法: POST
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```
- 请求体:
  ```json
  {
    "text": "新的开发任务",
    "completed": false
  }
  ```

**响应**
```json
{
  "id": 3,
  "text": "新的开发任务",
  "completed": false
}
```

#### 6.3 更新进度项状态

**请求**
- 端点: `/progress/{id}`
- 方法: PUT
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```
- 请求体:
  ```json
  {
    "text": "开发任务",
    "completed": true
  }
  ```

**响应**
```json
{
  "id": 3,
  "text": "开发任务",
  "completed": true
}
```

#### 6.4 删除进度项

**请求**
- 端点: `/progress/{id}`
- 方法: DELETE
- 头部:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**响应**
```json
{
  "success": true,
  "message": "进度项删除成功"
}
```

## 注意事项

1. 所有请求必须设置 `credentials: 'include'` 以确保 cookie 正确传递
2. 所有请求需要在 Authorization 头部携带 token (`Bearer {token}`)  
3. 后端需要正确配置 CORS，允许前端域名访问并接受凭证
4. API 响应状态码应符合 RESTful 规范：
   - 200: 成功
   - 201: 创建成功
   - 400: 请求参数错误
   - 401: 未授权
   - 404: 资源不存在
   - 500: 服务器错误

## 错误响应格式

当发生错误时，API 应返回如下格式的响应：

```json
{
  "success": false,
  "message": "错误描述信息"
}
``` 