# 用户管理API接口文档

## 概述

本文档描述了博客系统用户管理模块的API接口。所有接口都需要管理员权限，并且需要在请求头中包含JWT令牌进行身份验证。

## 接口基础信息

- **基础URL**: `/api/admin`
- **认证方式**: Bearer Token (JWT)
- **请求头**:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```

## 用户状态枚举

用户状态(`UserStatus`)枚举包含以下可能值：

| 值 | 显示名称 | 描述 |
|---|---|---|
| NORMAL | 正常 | 用户状态正常，可以正常登录和使用系统 |
| PENDING | 待审核 | 用户注册后等待管理员审核 |
| LOCKED | 锁定 | 用户因密码错误次数过多被临时锁定 |
| BANNED | 封禁 | 用户因违规行为被管理员封禁 |
| DELETED | 注销 | 用户已注销账号 |

## 接口列表

### 1. 获取用户列表

- **URL**: `/api/admin/users`
- **方法**: GET
- **权限**: `ROLE_ADMIN`

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|---|---|---|---|---|
| page | int | 否 | 0 | 页码（从0开始） |
| size | int | 否 | 10 | 每页记录数 |
| username | String | 否 | - | 用户名过滤（支持模糊查询） |
| status | UserStatus | 否 | - | 用户状态过滤 |

#### 响应结构

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "ROLE_ADMIN",
        "avatar": "https://example.com/avatar.jpg",
        "status": "NORMAL",
        "phoneNumber": "13800138000",
        "realName": "管理员",
        "remark": "系统管理员",
        "createTime": "2023-01-01T12:00:00",
        "updateTime": "2023-01-01T12:00:00",
        "lastLoginTime": "2023-01-01T12:00:00",
        "updatedBy": "system"
      }
    ],
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 0
  }
}
```

### 2. 获取用户详情

- **URL**: `/api/admin/users/{id}`
- **方法**: GET
- **权限**: `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 描述 |
|---|---|---|
| id | Long | 用户ID |

#### 响应结构

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ROLE_ADMIN",
    "avatar": "https://example.com/avatar.jpg",
    "status": "NORMAL",
    "phoneNumber": "13800138000",
    "realName": "管理员",
    "remark": "系统管理员",
    "createTime": "2023-01-01T12:00:00",
    "updateTime": "2023-01-01T12:00:00",
    "lastLoginTime": "2023-01-01T12:00:00",
    "updatedBy": "system"
  }
}
```

### 3. 创建用户

- **URL**: `/api/admin/users`
- **方法**: POST
- **权限**: `ROLE_ADMIN`

#### 请求体

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Password123",  // 可选，不提供则生成随机密码
  "role": "ROLE_USER",
  "status": "NORMAL",  // 可选，默认为NORMAL
  "phoneNumber": "13900139000",  // 可选
  "realName": "新用户",  // 可选
  "remark": "测试用户"  // 可选
}
```

#### 响应结构

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Ab3$Xy7Z",  // 仅当自动生成密码时返回
    "role": "ROLE_USER",
    "status": "NORMAL",
    "phoneNumber": "13900139000",
    "realName": "新用户",
    "remark": "测试用户",
    "createTime": "2023-03-15T14:30:00",
    "updateTime": "2023-03-15T14:30:00",
    "updatedBy": "admin"
  }
}
```

### 4. 更新用户

- **URL**: `/api/admin/users/{id}`
- **方法**: PUT
- **权限**: `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 描述 |
|---|---|---|
| id | Long | 用户ID |

#### 请求体

```json
{
  "email": "updated@example.com",  // 可选
  "password": "NewPassword456",  // 可选，提供则修改密码
  "role": "ROLE_EDITOR",  // 可选
  "status": "NORMAL",  // 可选
  "phoneNumber": "13800138001",  // 可选
  "realName": "更新用户",  // 可选
  "remark": "已更新的用户信息",  // 可选
  "avatar": "https://example.com/new-avatar.jpg"  // 可选
}
```

#### 响应结构

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "updated@example.com",
    "role": "ROLE_EDITOR",
    "avatar": "https://example.com/new-avatar.jpg",
    "status": "NORMAL",
    "phoneNumber": "13800138001",
    "realName": "更新用户",
    "remark": "已更新的用户信息",
    "createTime": "2023-03-15T14:30:00",
    "updateTime": "2023-03-15T15:45:00",
    "lastLoginTime": "2023-03-15T14:35:00",
    "updatedBy": "admin"
  }
}
```

### 5. 删除用户

- **URL**: `/api/admin/users/{id}`
- **方法**: DELETE
- **权限**: `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 描述 |
|---|---|---|
| id | Long | 用户ID |

#### 响应结构

```json
{
  "success": true,
  "message": "用户删除成功",
  "data": null
}
```

### 6. 修改用户状态

- **URL**: `/api/admin/users/{id}/status`
- **方法**: PUT
- **权限**: `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 描述 |
|---|---|---|
| id | Long | 用户ID |

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|---|---|---|---|
| status | UserStatus | 是 | 新的用户状态 |

#### 响应结构

```json
{
  "success": true,
  "message": "用户状态修改成功",
  "data": null
}
```

### 7. 重置用户密码

- **URL**: `/api/admin/users/{id}/reset-password`
- **方法**: POST
- **权限**: `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 描述 |
|---|---|---|
| id | Long | 用户ID |

#### 响应结构

```json
{
  "success": true,
  "message": "操作成功",
  "data": "Xp7$kL9!"  // 新生成的随机密码
}
```

## 状态码说明

| 状态码 | 说明 |
|---|---|
| 200 | 请求成功 |
| 400 | 请求参数错误或业务逻辑错误 |
| 401 | 未认证或认证失败 |
| 403 | 没有权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 错误响应示例

```json
{
  "success": false,
  "message": "用户名已存在：newuser",
  "data": null
}
```

## 注意事项

1. 所有接口都需要JWT认证，请在请求头中添加`Authorization: Bearer {token}`
2. 删除用户为逻辑删除，只是将用户状态修改为`DELETED`
3. 重置密码会自动生成一个随机密码并返回
4. 用户创建时如不提供密码，系统会自动生成一个随机密码并返回 