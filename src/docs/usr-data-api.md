# 用户数据管理API文档

## 简介

本文档详细描述了博客系统中的用户信息管理API接口，包括用户信息的查询、创建、更新、删除和头像管理操作。

## 基本信息

- **基础URL**: `/api`
- **认证方式**: JWT Token (通过Cookie或Authorization头)
- **内容类型**: application/json
- **字符编码**: UTF-8

## 认证

大部分API请求需要在HTTP头部包含以下认证信息之一：

```
Cookie: auth-token=<token>
```

或

```
Authorization: Bearer <token>
```

## 数据模型

### 用户(User)对象

| 字段名       | 类型           | 描述                      |
|-------------|----------------|--------------------------|
| id          | Long           | 用户ID                    |
| username    | String         | 用户名(登录名)             |
| email       | String         | 电子邮件地址               |
| role        | String         | 角色(admin, user等)       |
| avatar      | String         | 头像URL                   |
| status      | UserStatus     | 状态(NORMAL, LOCKED等)    |
| phoneNumber | String         | 电话号码                   |
| realName    | String         | 姓名                      |
| createTime  | LocalDateTime  | 创建时间                   |
| updateTime  | LocalDateTime  | 更新时间                   |
| lastLoginTime | LocalDateTime | 最近登录时间              |
| remark      | String         | 备注                      |

## API端点

### 1. 用户登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取认证令牌

#### 请求体

```json
{
  "username": "admin",
  "password": "password123"
}
```

#### 响应

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": 1001,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "https://usr.dannysummer.asia/images/default-avatar.png",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户注册

- **URL**: `/auth/register`
- **方法**: `POST`
- **描述**: 创建新用户账号

#### 请求体

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "secure123Password!"
}
```

#### 响应

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

### 3. 更新用户头像

- **URL**: `/user/update-avatar`
- **方法**: `POST`
- **权限要求**: 已认证用户
- **描述**: 更新当前登录用户的头像

#### 请求体

```json
{
  "avatarUrl": "https://usr.dannysummer.asia/images/5044b9fae07a42fc82f7c7a3469217ae.png"
}
```

#### 响应

```json
{
  "code": 200,
  "message": "头像更新成功",
  "data": null
}
```

### 4. 上传头像图片

- **URL**: `/upload/image`
- **方法**: `POST`
- **权限要求**: 已认证用户
- **描述**: 上传头像图片并获取URL
- **内容类型**: multipart/form-data

#### 请求参数

| 参数名 | 类型   | 位置 | 描述     |
|-------|--------|-----|----------|
| file  | File   | Form | 图片文件  |

#### 响应

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://usr.dannysummer.asia/images/5044b9fae07a42fc82f7c7a3469217ae.png",
    "path": "images/5044b9fae07a42fc82f7c7a3469217ae.png",
    "size": 147479
  }
}
```

### 5. 获取用户列表 (管理员)

- **URL**: `/admin/users`
- **方法**: `GET`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 获取系统中的用户列表，支持分页和筛选

#### 请求参数

| 参数名    | 类型       | 位置  | 描述                 | 默认值 |
|----------|------------|------|---------------------|-------|
| page     | Integer    | Query | 页码                | 0     |
| size     | Integer    | Query | 每页记录数           | 10    |
| username | String     | Query | 按用户名筛选         | -     |
| status   | UserStatus | Query | 按用户状态筛选       | -     |

#### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1001,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "avatar": "https://usr.dannysummer.asia/images/default-avatar.png",
        "status": "NORMAL",
        "phoneNumber": "13800138000",
        "realName": "Admin User",
        "createTime": "2023-08-15T08:30:45Z",
        "updateTime": "2023-10-20T11:15:22Z",
        "lastLoginTime": "2023-11-15T16:42:53Z",
        "remark": "系统管理员"
      },
      // ... 更多用户
    ],
    "totalElements": 25,
    "totalPages": 3,
    "size": 10,
    "number": 0
  }
}
```

### 6. 获取用户详情 (管理员)

- **URL**: `/admin/users/{id}`
- **方法**: `GET`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 获取特定用户的详细信息

#### 路径参数

| 参数名 | 类型  | 描述   |
|--------|------|--------|
| id     | Long | 用户ID |

#### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "https://usr.dannysummer.asia/images/default-avatar.png",
    "status": "NORMAL",
    "phoneNumber": "13800138000",
    "realName": "Admin User",
    "createTime": "2023-08-15T08:30:45Z",
    "updateTime": "2023-10-20T11:15:22Z",
    "lastLoginTime": "2023-11-15T16:42:53Z",
    "remark": "系统管理员"
  }
}
```

### 7. 创建用户 (管理员)

- **URL**: `/admin/users`
- **方法**: `POST`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 管理员创建新用户

#### 请求体

```json
{
  "username": "newstaff",
  "email": "staff@example.com",
  "password": "initialPassword123",
  "role": "user",
  "phoneNumber": "13900139000",
  "realName": "Staff User",
  "status": "NORMAL",
  "remark": "内容管理员"
}
```

#### 响应

```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": 1005,
    "username": "newstaff",
    "email": "staff@example.com",
    "role": "user",
    "avatar": null,
    "status": "NORMAL",
    "phoneNumber": "13900139000",
    "realName": "Staff User",
    "createTime": "2023-11-15T09:45:30Z",
    "updateTime": "2023-11-15T09:45:30Z",
    "lastLoginTime": null,
    "remark": "内容管理员"
  }
}
```

### 8. 更新用户 (管理员)

- **URL**: `/admin/users/{id}`
- **方法**: `PUT`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 管理员更新用户信息

#### 路径参数

| 参数名 | 类型  | 描述   |
|--------|------|--------|
| id     | Long | 用户ID |

#### 请求体

```json
{
  "email": "staff.new@example.com",
  "phoneNumber": "13900139999",
  "realName": "Staff Member",
  "status": "NORMAL",
  "remark": "高级内容管理员"
}
```

#### 响应

```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 1005,
    "username": "newstaff",
    "email": "staff.new@example.com",
    "role": "user",
    "avatar": "https://usr.dannysummer.asia/images/default-avatar.png",
    "status": "NORMAL",
    "phoneNumber": "13900139999",
    "realName": "Staff Member",
    "createTime": "2023-11-15T09:45:30Z",
    "updateTime": "2023-11-16T14:22:05Z",
    "lastLoginTime": "2023-11-16T10:15:33Z",
    "remark": "高级内容管理员"
  }
}
```

### 9. 删除用户 (管理员)

- **URL**: `/admin/users/{id}`
- **方法**: `DELETE`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 管理员删除用户

#### 路径参数

| 参数名 | 类型  | 描述   |
|--------|------|--------|
| id     | Long | 用户ID |

#### 响应

```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

### 10. 修改用户状态 (管理员)

- **URL**: `/admin/users/{id}/status`
- **方法**: `PUT`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 管理员修改用户状态

#### 路径参数

| 参数名 | 类型  | 描述   |
|--------|------|--------|
| id     | Long | 用户ID |

#### 请求参数

| 参数名   | 类型       | 位置  | 描述           |
|----------|------------|------|---------------|
| status   | UserStatus | Query | 新状态(NORMAL, LOCKED) |

#### 响应

```json
{
  "code": 200,
  "message": "用户状态已更新",
  "data": null
}
```

### 11. 重置用户密码 (管理员)

- **URL**: `/admin/users/{id}/reset-password`
- **方法**: `POST`
- **权限要求**: 管理员(ROLE_ADMIN)
- **描述**: 管理员重置用户密码

#### 路径参数

| 参数名 | 类型  | 描述   |
|--------|------|--------|
| id     | Long | 用户ID |

#### 响应

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": "新随机密码"
}
```

## 头像上传流程

用户头像上传是一个两步流程：

1. **上传图片文件**：
   - 通过 `/upload/image` 端点将图片文件上传到服务器
   - 服务器将图片保存到云存储并返回URL

2. **设置头像URL**：
   - 使用 `/user/update-avatar` 端点发送上一步获取的URL
   - 服务器更新用户头像字段

### 上传流程示例代码

```javascript
// 前端示例代码 (使用axios)
async function updateUserAvatar(file) {
  try {
    // 第1步: 上传图片文件
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await axios.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    });
    
    const imageUrl = uploadResponse.data.data.url;
    
    // 第2步: 更新用户头像
    const updateResponse = await axios.post('/api/user/update-avatar', {
      avatarUrl: imageUrl
    }, {
      withCredentials: true
    });
    
    return updateResponse.data;
  } catch (error) {
    console.error('上传头像失败:', error);
    throw error;
  }
}
```

## 错误码

| 错误码 | 描述                 |
|--------|---------------------|
| 400    | 请求参数错误         |
| 401    | 未认证或认证失败     |
| 403    | 权限不足            |
| 404    | 资源不存在          |
| 409    | 资源冲突(如用户名已存在) |
| 500    | 服务器内部错误      |

## 错误响应示例

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

```json
{
  "code": 403,
  "message": "权限不足",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": {
    "username": "用户名已存在",
    "email": "邮箱格式不正确"
  }
}
```
