<template>
  <div class="config-demo">
    <div class="container">
      <header class="demo-header">
        <h1 class="text-4xl font-chinese-primary text-primary-500 m-6">
          配置化样式系统演示
        </h1>
        <p class="text-lg font-mixed-secondary text-gray-700 m-4">
          展示基于配置的统一样式管理系统
        </p>
      </header>

      <!-- 字体演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">字体系统</h2>
        <div class="font-grid">
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">中文主字体</h3>
            <p class="font-chinese-primary text-xl">
              这是中文主字体 ZhuZiAWan 的展示
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">中文次要字体</h3>
            <p class="font-chinese-secondary text-xl">
              这是中文次要字体 ZhuZiAWan 的展示
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">中文装饰字体</h3>
            <p class="font-chinese-decorative text-xl">
              这是中文装饰字体 ZhuZiAWan 的展示
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">中文诗歌字体</h3>
            <p class="font-chinese-poetry text-xl">
              这是中文诗歌字体 ZhuZiAWan 的展示
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">英文主字体</h3>
            <p class="font-english-primary text-xl">
              This is Montserrat primary font demo
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">混合字体</h3>
            <p class="font-mixed-primary text-xl">
              Mixed Font 混合字体展示 Demo
            </p>
          </div>
          <div class="font-example">
            <h3 class="text-lg text-gray-600 m-2">代码字体</h3>
            <code class="font-code text-base bg-gray-100 p-2 rounded">
              const example = 'code font demo';
            </code>
          </div>
        </div>
      </section>

      <!-- 颜色演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">颜色系统</h2>
        <div class="color-grid">
          <div class="color-group">
            <h3 class="text-lg text-gray-600 m-2">主色调</h3>
            <div class="color-swatches">
              <div class="color-swatch bg-primary-500" title="Primary 500"></div>
              <div class="color-swatch" :style="{ backgroundColor: getColor('primary', 400) }" title="Primary 400"></div>
              <div class="color-swatch" :style="{ backgroundColor: getColor('primary', 600) }" title="Primary 600"></div>
            </div>
          </div>
          <div class="color-group">
            <h3 class="text-lg text-gray-600 m-2">次要色</h3>
            <div class="color-swatches">
              <div class="color-swatch bg-secondary-500" title="Secondary 500"></div>
              <div class="color-swatch" :style="{ backgroundColor: getColor('secondary', 400) }" title="Secondary 400"></div>
              <div class="color-swatch" :style="{ backgroundColor: getColor('secondary', 600) }" title="Secondary 600"></div>
            </div>
          </div>
          <div class="color-group">
            <h3 class="text-lg text-gray-600 m-2">强调色</h3>
            <div class="color-swatches">
              <div class="color-swatch bg-accent" title="Accent"></div>
              <div class="color-swatch" :style="{ backgroundColor: getAccentColor('hover') }" title="Accent Hover"></div>
              <div class="color-swatch" :style="{ backgroundColor: getAccentColor('active') }" title="Accent Active"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 按钮演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">按钮系统</h2>
        <div class="button-grid">
          <div class="button-group">
            <h3 class="text-lg text-gray-600 m-2">尺寸变化</h3>
            <div class="button-row">
              <button class="btn btn-xs btn-primary m-1">超小按钮</button>
              <button class="btn btn-sm btn-primary m-1">小按钮</button>
              <button class="btn btn-md btn-primary m-1">中等按钮</button>
              <button class="btn btn-lg btn-primary m-1">大按钮</button>
              <button class="btn btn-xl btn-primary m-1">超大按钮</button>
            </div>
          </div>
          <div class="button-group">
            <h3 class="text-lg text-gray-600 m-2">颜色变化</h3>
            <div class="button-row">
              <button class="btn btn-md btn-primary m-2">主要按钮</button>
              <button class="btn btn-md btn-secondary m-2">次要按钮</button>
              <button class="btn btn-md btn-accent m-2">强调按钮</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 输入框演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">输入框系统</h2>
        <div class="input-grid">
          <div class="input-group">
            <label class="text-base text-gray-700 m-2">小尺寸输入框</label>
            <input type="text" class="input input-sm" placeholder="小尺寸输入框" />
          </div>
          <div class="input-group">
            <label class="text-base text-gray-700 m-2">中等尺寸输入框</label>
            <input type="text" class="input input-md" placeholder="中等尺寸输入框" />
          </div>
          <div class="input-group">
            <label class="text-base text-gray-700 m-2">大尺寸输入框</label>
            <input type="text" class="input input-lg" placeholder="大尺寸输入框" />
          </div>
        </div>
      </section>

      <!-- 资源路径演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">资源路径管理</h2>
        <div class="asset-grid">
          <div class="asset-example">
            <h3 class="text-lg text-gray-600 m-2">背景图片</h3>
            <div 
              class="bg-demo rounded-lg"
              :style="getBackgroundStyle(getAssetPath('backgrounds', 'essay', 'bg1'))"
            >
              <p class="text-white text-center p-8">配置化背景图片</p>
            </div>
          </div>
          <div class="asset-example">
            <h3 class="text-lg text-gray-600 m-2">图标路径</h3>
            <div class="icon-list">
              <div class="icon-item">
                <code class="font-code text-sm">{{ getAssetPath('icons', 'logo') }}</code>
              </div>
              <div class="icon-item">
                <code class="font-code text-sm">{{ getAssetPath('icons', 'cc', 'default') }}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 布局工具类演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">布局工具类</h2>
        <div class="layout-grid">
          <div class="layout-example">
            <h3 class="text-lg text-gray-600 m-2">间距系统</h3>
            <div class="spacing-demo">
              <div class="bg-gray-100 p-2 m-1 rounded">p-2</div>
              <div class="bg-gray-100 p-4 m-2 rounded">p-4</div>
              <div class="bg-gray-100 p-6 m-3 rounded">p-6</div>
            </div>
          </div>
          <div class="layout-example">
            <h3 class="text-lg text-gray-600 m-2">圆角系统</h3>
            <div class="radius-demo">
              <div class="bg-accent p-4 m-2 rounded-sm">rounded-sm</div>
              <div class="bg-accent p-4 m-2 rounded-md">rounded-md</div>
              <div class="bg-accent p-4 m-2 rounded-lg">rounded-lg</div>
              <div class="bg-accent p-4 m-2 rounded-xl">rounded-xl</div>
            </div>
          </div>
          <div class="layout-example">
            <h3 class="text-lg text-gray-600 m-2">阴影系统</h3>
            <div class="shadow-demo">
              <div class="bg-white p-4 m-2 shadow-sm">shadow-sm</div>
              <div class="bg-white p-4 m-2 shadow">shadow</div>
              <div class="bg-white p-4 m-2 shadow-md">shadow-md</div>
              <div class="bg-white p-4 m-2 shadow-lg">shadow-lg</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 动画演示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">动画系统</h2>
        <div class="animation-grid">
          <div class="animation-example">
            <h3 class="text-lg text-gray-600 m-2">过渡效果</h3>
            <div class="transition-demo">
              <div class="transition-item bg-primary-500 transition hover:bg-primary-600 rounded p-4 m-2 text-white cursor-pointer">
                标准过渡
              </div>
              <div class="transition-item bg-secondary-500 transition-bounce hover:bg-secondary-600 rounded p-4 m-2 text-white cursor-pointer">
                弹跳过渡
              </div>
              <div class="transition-item bg-accent transition-smooth hover:shadow-lg rounded p-4 m-2 text-white cursor-pointer">
                平滑过渡
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 配置信息展示 -->
      <section class="demo-section card m-6">
        <h2 class="text-2xl font-chinese-decorative text-secondary-500 m-4">配置信息</h2>
        <div class="config-info">
          <div class="info-item">
            <h3 class="text-lg text-gray-600 m-2">应用信息</h3>
            <div class="info-content bg-gray-50 p-4 rounded">
              <p><strong>名称:</strong> {{ config.app.name }}</p>
              <p><strong>版本:</strong> {{ config.app.version }}</p>
              <p><strong>作者:</strong> {{ config.app.author }}</p>
              <p><strong>描述:</strong> {{ config.app.description }}</p>
            </div>
          </div>
          <div class="info-item">
            <h3 class="text-lg text-gray-600 m-2">配置统计</h3>
            <div class="info-content bg-gray-50 p-4 rounded">
              <p><strong>字体配置:</strong> {{ Object.keys(config.fonts).length }} 类别</p>
              <p><strong>颜色配置:</strong> {{ Object.keys(config.colors).length }} 系列</p>
              <p><strong>背景图片:</strong> {{ getBackgroundCount() }} 张</p>
              <p><strong>间距选项:</strong> {{ Object.keys(config.layout.spacing).length }} 种</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from '../config/index'
import { 
  getColor, 
  getAccentColor, 
  getAssetPath, 
  getBackgroundStyle 
} from '../utils/config'

// 计算背景图片数量
const getBackgroundCount = () => {
  let count = 0
  const backgrounds = config.assets.backgrounds
  Object.values(backgrounds).forEach(value => {
    if (typeof value === 'string') {
      count++
    } else if (typeof value === 'object') {
      count += Object.keys(value).length
    }
  })
  return count
}
</script>

<style scoped>
.config-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-section {
  margin-bottom: 3rem;
}

.font-grid, .color-grid, .button-grid, .input-grid, .asset-grid, .layout-grid, .animation-grid {
  display: grid;
  gap: 2rem;
  margin-top: 1rem;
}

.font-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.font-example {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
}

.color-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.color-swatches {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.color-swatch {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.button-grid {
  grid-template-columns: 1fr;
  gap: 2rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.input-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-grid {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.bg-demo {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.icon-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.icon-item {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
}

.layout-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.spacing-demo, .radius-demo, .shadow-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.animation-grid {
  grid-template-columns: 1fr;
}

.transition-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.config-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.info-content p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .font-grid, .color-grid, .asset-grid, .layout-grid {
    grid-template-columns: 1fr;
  }
  
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .transition-demo {
    flex-direction: column;
  }
}
</style> 