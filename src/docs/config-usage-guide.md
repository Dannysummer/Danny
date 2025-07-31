# 全局配置使用指南

## 概述

项目采用统一的配置管理系统，将所有可配置的项目设置集中管理，包括端口、字体、颜色、资源路径、动画、布局等。这样做的好处是：

- 🎯 **统一管理**: 所有配置集中在一个地方，便于维护
- 🎨 **一致性**: 确保整个项目的设计系统一致
- 🔧 **可维护性**: 修改配置时只需要在一个地方更改
- 📱 **响应式**: 支持响应式设计系统
- 🚀 **开发效率**: 提供工具函数和CSS工具类，加快开发速度

## 配置结构

### 🎨 字体设计原则

**中文字体统一策略**: 项目中所有中文字体变体（primary、secondary、decorative、poetry）均使用 **ZhuZiAWan** 字体，这样做的优势：

- 🎯 **视觉一致性**: 确保整个项目的中文字体风格统一
- 📱 **性能优化**: 减少字体文件加载，提升页面性能  
- 🛠️ **维护简化**: 统一字体管理，降低维护复杂度
- 🎨 **设计美观**: ZhuZiAWan字体具有良好的中文显示效果

虽然配置中保留了不同的字体变体名称（primary、secondary、decorative、poetry），但这些都指向同一个字体，为将来可能的字体分化保留了扩展性。

### 📁 文件组织

```
src/
├── config/
│   └── index.ts          # 主配置文件
├── utils/
│   └── config.ts         # 配置工具函数
├── assets/styles/
│   ├── config-based.css  # 基于配置的样式文件
│   ├── fonts.css         # 字体定义
│   └── theme.css         # 主题样式
└── types/
    └── index.d.ts        # 配置类型定义
```

### 🏗️ 配置分类

1. **应用配置** (`app`): 应用名称、版本、作者等基础信息
2. **字体配置** (`fonts`): 中文、英文、代码字体及大小
3. **颜色配置** (`colors`): 主色调、次要色、强调色、灰色系
4. **资源配置** (`assets`): 图片、图标、音频等资源路径
5. **动画配置** (`animations`): 过渡时间、缓动函数、延迟
6. **布局配置** (`layout`): 断点、容器、间距、圆角、阴影
7. **UI配置** (`ui`): 按钮、输入框、卡片等组件样式
8. **功能配置**: 分页、上传、缓存等业务配置
9. **API配置** (`api`): 服务器地址、端口、超时等

## 使用方法

### 1. 在Vue组件中使用配置

```vue
<template>
  <div class="example-component">
    <!-- 使用配置化的样式类 -->
    <h1 class="text-2xl font-chinese-primary text-primary-500">
      {{ config.app.name }}
    </h1>
    
    <!-- 使用配置化的背景图片 -->
    <div 
      class="hero-section"
      :style="getBackgroundStyle(getAssetPath('backgrounds', 'essay', 'bg1'))"
    >
      <p class="font-mixed-primary text-white">欢迎使用配置化系统</p>
    </div>
    
    <!-- 使用配置化的按钮 -->
    <button class="btn btn-md btn-primary">
      确认
    </button>
  </div>
</template>

<script setup lang="ts">
import { config } from '../config/index'
import { getAssetPath, getBackgroundStyle } from '../utils/config'
</script>
```

### 2. 使用配置工具函数

```typescript
import { 
  getFontFamily,
  getMixedFontFamily,
  getColor,
  getAccentColor,
  getAssetPath,
  getBackgroundStyle,
  getTransition,
  getButtonStyle,
  isFileTypeAllowed,
  isFileSizeValid 
} from '../utils/config'

// 获取字体 - 所有中文字体变体都返回ZhuZiAWan
const primaryFont = getFontFamily('chinese', 'primary') // 'ZhuZiAWan'
const secondaryFont = getFontFamily('chinese', 'secondary') // 'ZhuZiAWan'
const decorativeFont = getFontFamily('chinese', 'decorative') // 'ZhuZiAWan'
const poetryFont = getFontFamily('chinese', 'poetry') // 'ZhuZiAWan'
const mixedFont = getMixedFontFamily() // 'ZhuZiAWan, Montserrat, -apple-system...'

// 获取颜色
const primaryColor = getColor('primary', 500) // '#3498db'
const hoverColor = getAccentColor('hover') // '#6ca1ff'

// 获取资源路径
const logoPath = getAssetPath('icons', 'logo') // '/Icon/Logo/Danny's_blog.svg'
const bgPath = getAssetPath('backgrounds', 'essay', 'bg1') // '/background/essay/essay-bg1.png'

// 获取背景样式
const bgStyle = getBackgroundStyle('/path/to/image.jpg', 'cover', 'center')

// 获取过渡样式
const transition = getTransition('all', 'normal', 'smooth') // 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0s'

// 获取按钮样式
const buttonStyle = getButtonStyle('lg') // { padding: '0.75rem 1.5rem', fontSize: '1.125rem', ... }

// 文件验证
const isImageValid = isFileTypeAllowed('photo.jpg', 'image') // true
const isSizeValid = isFileSizeValid(1024 * 1024 * 5, 'image') // true (5MB)
```

### 3. 使用CSS工具类

```html
<!-- 字体工具类 - 所有中文字体类都使用ZhuZiAWan -->
<h1 class="font-chinese-primary text-2xl">中文主标题 (ZhuZiAWan)</h1>
<h2 class="font-chinese-secondary text-xl">中文副标题 (ZhuZiAWan)</h2>
<h3 class="font-chinese-decorative text-lg">装饰性标题 (ZhuZiAWan)</h3>
<p class="font-chinese-poetry text-base">诗歌段落 (ZhuZiAWan)</p>
<p class="font-mixed-primary text-base">混合字体段落 (ZhuZiAWan + Montserrat)</p>
<code class="font-code text-sm">代码文本</code>

<!-- 颜色工具类 -->
<div class="text-primary-500 bg-gray-50">主色调文本</div>
<button class="bg-secondary-500 text-white">次要色按钮</button>

<!-- 间距工具类 -->
<div class="p-6 m-4">内边距6，外边距4</div>
<section class="p-8 md:p-12 lg:p-16">响应式间距</section>

<!-- 圆角和阴影 -->
<div class="rounded-lg shadow-md">圆角+阴影的卡片</div>
<img class="rounded-full shadow-lg" src="..." alt="圆形头像">

<!-- 动画工具类 -->
<button class="transition hover:bg-primary-600">标准过渡</button>
<div class="transition-bounce hover:shadow-xl">弹跳效果</div>

<!-- 预设组件样式 -->
<button class="btn btn-lg btn-primary">大型主要按钮</button>
<input class="input input-md" placeholder="中等尺寸输入框">
<div class="card">预设卡片样式</div>
```

### 4. 在样式文件中使用CSS变量

```css
.custom-component {
  /* 使用颜色变量 */
  color: var(--color-primary-500);
  background-color: var(--color-gray-50);
  
  /* 使用字体变量 */
  font-family: var(--font-mixed-primary);
  font-size: var(--font-size-lg);
  
  /* 使用间距变量 */
  padding: var(--spacing-6);
  margin: var(--spacing-4);
  
  /* 使用圆角和阴影 */
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  
  /* 使用动画变量 */
  transition: all var(--duration-normal) var(--easing-smooth);
}

.custom-component:hover {
  color: var(--color-primary-600);
  box-shadow: var(--shadow-lg);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .custom-component {
    font-size: var(--font-size-xl);
    padding: var(--spacing-8);
  }
}
```

### 5. 动态修改配置

```typescript
// 修改主题色
const updatePrimaryColor = (newColor: string) => {
  document.documentElement.style.setProperty('--color-primary-500', newColor)
}

// 修改字体大小
const updateFontSize = (size: string) => {
  document.documentElement.style.setProperty('--font-size-base', size)
}

// 批量应用CSS变量
import { generateCSSVariables } from '../utils/config'

const applyCSSVariables = () => {
  const variables = generateCSSVariables()
  const root = document.documentElement
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}
```

## 最佳实践

### 1. 组件开发

✅ **推荐做法**:
```vue
<template>
  <!-- 使用配置化的工具类 -->
  <div class="card p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-chinese-primary text-primary-500">标题</h2>
    <p class="text-base font-mixed-secondary text-gray-700">内容</p>
  </div>
</template>
```

❌ **避免做法**:
```vue
<template>
  <!-- 硬编码样式 -->
  <div style="padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="font-size: 20px; font-family: 'ZhuZiAWan'; color: #3498db;">标题</h2>
  </div>
</template>
```

### 2. 样式定义

✅ **推荐做法**:
```css
.article-card {
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  font-family: var(--font-mixed-primary);
  transition: all var(--duration-normal) var(--easing-smooth);
}
```

❌ **避免做法**:
```css
.article-card {
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-family: 'ZhuZiAWan', 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}
```

### 3. 资源引用

✅ **推荐做法**:
```typescript
// 使用配置化的资源路径
const bgImage = getAssetPath('backgrounds', 'essay', 'bg1')
const logoUrl = getAssetPath('icons', 'logo')
```

❌ **避免做法**:
```typescript
// 硬编码资源路径
const bgImage = '/background/essay/essay-bg1.png'
const logoUrl = '/Icon/Logo/Danny\'s_blog.svg'
```

### 4. 响应式设计

✅ **推荐做法**:
```html
<div class="text-base md:text-lg lg:text-xl p-4 md:p-6 lg:p-8">
  响应式文本和间距
</div>
```

### 5. 主题切换

```typescript
// 主题切换实现
const toggleTheme = () => {
  const isDark = document.documentElement.classList.contains('dark')
  
  if (isDark) {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }
}
```

## 扩展配置

### 添加新的颜色

1. 在 `src/config/index.ts` 中添加颜色定义：
```typescript
const COLOR_CONFIG = {
  // 现有颜色...
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    // ... 完整的色阶
    500: '#f59e0b',  // 主色
    // ...
    900: '#78350f'
  }
}
```

2. 在 `src/assets/styles/config-based.css` 中添加CSS变量和工具类：
```css
:root {
  /* 添加warning颜色变量 */
  --color-warning-500: #f59e0b;
  /* ... 其他色阶 */
}

/* 添加工具类 */
.text-warning-500 { color: var(--color-warning-500); }
.bg-warning-500 { background-color: var(--color-warning-500); }
.btn-warning {
  background-color: var(--color-warning-500);
  color: white;
}
```

3. 更新类型定义 `src/types/index.d.ts`：
```typescript
export interface ColorConfig {
  primary: ColorScale
  secondary: ColorScale
  warning: ColorScale  // 新增
  accent: {
    default: string
    hover: string
    active: string
  }
  gray: ColorScale
}
```

### 添加新的字体

1. 在配置中定义新字体：
```typescript
const FONT_CONFIG = {
  chinese: {
    primary: 'ZhuZiAWan',
    secondary: 'ZhuZiAWan',
          decorative: 'ZhuZiAWan',
      poetry: 'ZhuZiAWan',
    modern: 'PingFang SC'  // 新增现代字体
  },
  // ...
}
```

2. 添加字体文件和CSS定义：
```css
@font-face {
  font-family: 'PingFang SC';
  src: url('/fonts/chinese/pingfang/PingFang-SC-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-chinese-modern: 'PingFang SC';
}

.font-chinese-modern { 
  font-family: var(--font-chinese-modern), serif; 
}
```

## 调试和验证

### 1. 配置验证

在开发环境中验证配置的完整性：

```typescript
// src/utils/config-validator.ts
export const validateConfig = () => {
  const errors: string[] = []
  
  // 验证必要的配置项
  if (!config.app.name) {
    errors.push('应用名称未配置')
  }
  
  if (!config.api.baseUrl) {
    errors.push('API基础URL未配置')
  }
  
  // 验证颜色配置
  Object.entries(config.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object' && !('500' in colorValue)) {
      errors.push(`颜色 ${colorName} 缺少主色调 500`)
    }
  })
  
  if (errors.length > 0) {
    console.error('配置验证失败:', errors)
  } else {
    console.log('✅ 配置验证通过')
  }
  
  return errors.length === 0
}
```

### 2. 开发工具

创建开发时的配置面板：

```vue
<!-- src/components/ConfigPanel.vue -->
<template>
  <div class="config-panel" v-if="isDev">
    <h3>配置调试面板</h3>
    
    <!-- 颜色测试 -->
    <div class="color-tester">
      <input 
        type="color" 
        v-model="primaryColor" 
        @change="updatePrimaryColor"
      >
      <label>主色调</label>
    </div>
    
    <!-- 字体大小测试 -->
    <div class="font-size-tester">
      <input 
        type="range" 
        min="12" 
        max="24" 
        v-model="baseFontSize"
        @input="updateFontSize"
      >
      <label>基础字体大小: {{ baseFontSize }}px</label>
    </div>
  </div>
</template>
```

## 总结

通过统一的配置管理系统，我们实现了：

1. **🎯 集中管理**: 所有配置项都在 `src/config/index.ts` 中统一管理
2. **🛠️ 工具函数**: 提供了丰富的工具函数来便捷使用配置
3. **🎨 工具类**: CSS工具类让样式应用更加快速
4. **📱 响应式**: 完整的响应式设计系统
5. **🔧 可扩展**: 易于添加新的配置项和样式

这个配置系统不仅提高了开发效率，还确保了整个项目的一致性和可维护性。通过CSS变量和工具类，我们可以快速构建具有统一设计语言的界面，同时保持了足够的灵活性来满足各种定制需求。 