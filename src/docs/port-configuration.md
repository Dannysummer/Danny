# 端口配置管理

## 概述

项目已统一管理所有端口配置，避免硬编码端口号，提高代码的可维护性。

## 配置位置

端口配置统一在 `src/config/index.ts` 文件中管理：

```typescript
// API服务器配置
const API_HOST = 'localhost'
const API_PORT = 8088
const DEV_PORT = 5173

export const config = {
  // API服务器配置
  api: {
    host: API_HOST,
    port: API_PORT,
    baseUrl: `http://${API_HOST}:${API_PORT}`,
    apiUrl: `http://${API_HOST}:${API_PORT}/api`,
    wsUrl: `http://${API_HOST}:${API_PORT}/ws`
  },
  
  // 前端开发服务器配置
  dev: {
    port: DEV_PORT,
    origin: `http://${API_HOST}:${DEV_PORT}`
  }
}
```

## 使用方法

### 在Vue组件中使用

```typescript
import { config } from '../config/index'

// 使用API URL
const response = await fetch(`${config.api.apiUrl}/your-endpoint`, {
  // 请求配置
})

// 使用WebSocket URL
const socket = new SockJS(config.api.wsUrl)
```

### 在工具类中使用

```typescript
import { config } from '../config/index'

const instance = axios.create({
  baseURL: config.api.baseUrl,
  // 其他配置
})
```

## 端口说明

- **API_PORT (8088)**: 后端API服务器端口
- **DEV_PORT (5173)**: 前端开发服务器端口

## 修改端口

如需修改端口，只需在 `src/config/index.ts` 文件中修改相应的常量：

```typescript
const API_PORT = 8089  // 修改API端口
const DEV_PORT = 3000  // 修改开发端口
```

同时需要在 `vite.config.ts` 中同步修改开发服务器端口：

```typescript
const DEV_PORT = 3000  // 与config中保持一致
```

## 生产环境配置

在生产环境中，可以通过环境变量覆盖这些配置，或直接修改配置文件中的值。

## 注意事项

1. 修改端口后需要重启开发服务器
2. 确保后端服务器使用相同的端口配置
3. 避免在代码中硬编码任何端口号
4. 所有API调用都应使用配置文件中的URL 