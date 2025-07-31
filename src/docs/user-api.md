# 用户API文档

本文档描述了Dansela博客系统中与用户相关的API接口。这些API用于用户注册、登录、个人信息管理等功能。

## 目录

- [1. 用户认证](#1-用户认证)
  - [1.1 用户登录](#11-用户登录)
  - [1.2 用户注册](#12-用户注册)
  - [1.3 发送邮箱验证码](#13-发送邮箱验证码)
  - [1.4 密码重置](#14-密码重置)
- [2. 个人信息管理](#2-个人信息管理)
  - [2.1 获取个人信息](#21-获取个人信息)
  - [2.2.1 根据ID获取用户信息](#221-根据id获取用户信息)
  - [2.2.2 更新个人信息](#222-更新个人信息)
  - [2.3 更新头像](#23-更新头像)

## 1. 用户认证

### 1.1 用户登录

**接口说明**：用户登录接口，验证用户名和密码，成功后返回JWT令牌

**请求方法**：POST

**接口URL**：`/api/auth/login`

**请求参数**：

```json
{
  "username": "用户名",
  "password": "密码",
  "rememberMe": true,
  "verifyCode": "验证码（如需）"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "data": {
    "id": 7526092048982736896,
    "username": "用户名",
    "email": "user@example.com",
    "role": "USER",
    "avatar": "头像URL",
    "token": "JWT令牌",
    "status": "NORMAL"
  }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 1.2 用户注册

**接口说明**：新用户注册接口，需要提供邮箱验证码

**请求方法**：POST

**接口URL**：`/api/auth/register`

**请求参数**：

```json
{
  "username": "用户名",
  "password": "密码",
  "email": "邮箱地址",
  "emailVerifyCode": "邮箱验证码"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "token": "JWT令牌",
  "data": {
    "id": 7526092048982736896,
    "username": "用户名",
    "email": "user@example.com"
  }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 1.3 发送邮箱验证码

**接口说明**：发送验证码到指定邮箱，用于注册或重置密码

**请求方法**：POST

**接口URL**：`/api/auth/send-email-code`

**请求参数**：

```json
{
  "email": "邮箱地址",
  "type": "注册类型，可选"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "data": "验证码发送成功"
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 1.4 密码重置

**接口说明**：通过邮箱验证码重置密码

**请求方法**：POST

**接口URL**：`/api/auth/reset-password`

**请求参数**：

```json
{
  "email": "邮箱地址",
  "code": "验证码"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "data": "新密码已发送到您的邮箱"
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 2. 个人信息管理

### 2.1 获取个人信息

**接口说明**：获取当前登录用户的个人信息

**请求方法**：GET

**接口URL**：`/api/user/profile`

**请求头**：
```
Authorization: Bearer {JWT令牌}
```

**请求参数**：无

**响应结果**：

成功：
```json
{
  "success": true,
  "data": {
    "id": 7526092048982736896,
    "username": "用户名",
    "email": "user@example.com",
    "role": "USER",
    "avatar": "头像URL",
    "status": "NORMAL",
    "phoneNumber": "电话号码",
    "realName": "真实姓名",
    "remark": "备注",
    "createTime": "2023-01-01T00:00:00",
    "updateTime": "2023-01-01T00:00:00",
    "lastLoginTime": "2023-01-01T00:00:00"
  }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 2.2.1 根据ID获取用户信息

**接口说明**：根据用户ID获取用户信息（用户只能查询自己的信息，管理员可查询所有用户）

**请求方法**：GET

**接口URL**：`/api/user/{id}`

**请求头**：
```
Authorization: Bearer {JWT令牌}
```

**路径参数**：
- id: 用户ID

**请求参数**：无

**响应结果**：

成功：
```json
{
  "success": true,
  "data": {
    "id": 7526092048982736896,
    "username": "用户名",
    "email": "user@example.com",
    "role": "USER",
    "avatar": "头像URL",
    "status": "NORMAL",
    "phoneNumber": "电话号码",
    "realName": "真实姓名",
    "remark": "备注",
    "createTime": "2023-01-01T00:00:00",
    "updateTime": "2023-01-01T00:00:00",
    "lastLoginTime": "2023-01-01T00:00:00"
  }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 2.2.2 更新个人信息

**接口说明**：更新用户个人信息（用户只能更新自己的信息）

**请求方法**：PUT

**接口URL**：`/api/user/{id}`

**请求头**：
```
Authorization: Bearer {JWT令牌}
```

**路径参数**：
- id: 用户ID

**请求参数**：
```json
{
  "email": "新邮箱地址",
  "phoneNumber": "新电话号码",
  "realName": "新真实姓名",
  "remark": "新备注"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "data": {
    "id": 7526092048982736896,
    "username": "用户名",
    "email": "新邮箱地址",
    "role": "USER",
    "avatar": "头像URL",
    "status": "NORMAL",
    "phoneNumber": "新电话号码",
    "realName": "新真实姓名",
    "remark": "新备注",
    "createTime": "2023-01-01T00:00:00",
    "updateTime": "2023-01-01T00:00:00",
    "lastLoginTime": "2023-01-01T00:00:00"
  }
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 2.3 更新头像

**接口说明**：更新当前登录用户的头像

**请求方法**：POST

**接口URL**：`/api/user/update-avatar`

**请求头**：
```
Authorization: Bearer {JWT令牌}
```

**请求参数**：

```json
{
  "avatarUrl": "头像URL"
}
```

**响应结果**：

成功：
```json
{
  "success": true,
  "data": "头像更新成功"
}
```

失败：
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 安全说明

1. **用户ID生成**：系统使用雪花算法（Snowflake）生成唯一的用户ID，确保ID全局唯一且有序递增，同时避免了自增ID可能带来的安全问题。

2. **用户访问权限控制**：
   - 普通用户只能查询和修改自己的信息
   - 系统会同时验证用户名和用户ID，确保用户无法通过修改请求访问他人数据
   - 管理员可以查询所有用户信息

3. **身份验证**：所有个人信息相关API都需要JWT令牌验证，确保用户已登录

## 错误码说明

| 状态码 | 说明 |
| ------ | ---- |
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 | 