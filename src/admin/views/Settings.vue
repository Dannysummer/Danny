<template>
  <div class="settings-page">
    <h2 class="page-title">系统设置</h2>
    
    <!-- 背景设置 -->
    <div class="settings-section">
      <h3>背景设置</h3>
      <div class="background-options">
        <div class="preset-backgrounds">
          <h4>预设背景</h4>
          <div class="background-grid">
            <div v-for="(bg, index) in presetBackgrounds" 
                 :key="index" 
                 class="bg-item"
                 :class="{ 'active': selectedBackgroundUrl === bg.url }"
                 :style="{ backgroundImage: `url(${bg.url})` }"
                 @click="selectBackground(bg)">
              <div class="bg-item-name">{{ bg.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="custom-background">
          <h4>自定义背景</h4>
          <div class="upload-container">
            <label for="bg-upload" class="upload-btn">
              <i class="upload-icon">+</i>
              <span>选择图片</span>
            </label>
            <input id="bg-upload" 
                   type="file" 
                   @change="handleBackgroundUpload" 
                   accept="image/*" 
                   class="file-input"
                   hidden>
            <div v-if="customBackgroundPreview" class="preview-container">
              <img :src="customBackgroundPreview" alt="预览" class="background-preview">
              <button class="remove-btn" @click="removeCustomBackground">移除</button>
            </div>
          </div>
        </div>

        <div class="background-settings" style="margin-top: 20px;">
          <div class="setting-item">
            <label>背景遮罩亮度</label>
            <div class="slider-container">
              <input type="range" 
                     v-model="settings.backgroundMaskBrightness" 
                     min="0" 
                     max="1" 
                     step="0.1"
                     @input="updateSettings">
              <span class="slider-value">{{ Math.round(settings.backgroundMaskBrightness * 100) }}%</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label>模糊效果</label>
            <div class="slider-container">
              <input type="range" 
                     v-model="settings.blurEffect" 
                     min="0" 
                     max="20" 
                     step="1"
                     @input="updateSettings">
              <span class="slider-value">{{ settings.blurEffect }}px</span>
            </div>
          </div>

          <div class="setting-item">
            <label>应用背景</label>
            <button class="apply-btn" @click="applyBackground">应用至全局</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="settings-section">
      <h3>主题设置</h3>
      <div class="theme-settings">
        <div class="setting-item">
          <label>主题色</label>
          <div class="color-picker-container">
            <input type="color" 
                   v-model="settings.primaryColor"
                   @input="updateSettings"
                   class="color-picker">
            <span class="color-value">{{ settings.primaryColor }}</span>
          </div>
        </div>
        
        <div class="setting-item">
          <label>字体大小</label>
          <div class="select-container">
            <select v-model="settings.fontSize" @change="updateSettings">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <label>主题模式</label>
          <div class="theme-switch">
            <input type="checkbox" id="theme-toggle" v-model="settings.darkMode" @change="updateSettings">
            <label for="theme-toggle" class="theme-slider">
              <div class="theme-icons">
                <span class="light-icon">☀️</span>
                <span class="dark-icon">🌙</span>
              </div>
            </label>
            <span class="theme-label">{{ settings.darkMode ? '深色模式' : '浅色模式' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 布局设置 -->
    <div class="settings-section">
      <h3>布局设置</h3>
      <div class="layout-settings">
        <div class="setting-item">
          <label>侧边栏宽度</label>
          <div class="slider-container">
            <input type="range" 
                   v-model="settings.sidebarWidth" 
                   min="200" 
                   max="300" 
                   step="10"
                   @input="updateSettings">
            <span class="slider-value">{{ settings.sidebarWidth }}px</span>
          </div>
        </div>
        
        <div class="setting-item">
          <label>内容区域边距</label>
          <div class="slider-container">
            <input type="range" 
                   v-model="settings.contentMargin" 
                   min="10" 
                   max="40" 
                   step="5"
                   @input="updateSettings">
            <span class="slider-value">{{ settings.contentMargin }}px</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 动画设置 -->
    <div class="settings-section">
      <h3>动画设置</h3>
      <div class="animation-settings">
        <div class="setting-item">
          <label>启用动画</label>
          <div class="toggle-container">
            <input 
              type="checkbox" 
              id="animation-toggle"
              v-model="settings.enableAnimations"
              @change="updateSettings"
              class="toggle-checkbox">
            <label for="animation-toggle" class="toggle-label"></label>
          </div>
        </div>
        
        <div class="setting-item" v-if="settings.enableAnimations">
          <label>动画速度</label>
          <div class="select-container">
            <select v-model="settings.animationSpeed" @change="updateSettings">
              <option value="slow">慢速</option>
              <option value="normal">正常</option>
              <option value="fast">快速</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户资料设置 -->
    <div class="settings-section">
      <h3>个人资料设置</h3>
      <div class="profile-settings" @submit.prevent>
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="avatarPreview || settings.userAvatar" alt="用户头像" class="current-avatar">
            <div class="avatar-upload">
              <label for="avatar-upload" class="upload-avatar-btn">
                <i class="upload-icon">+</i>
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                @change="handleAvatarUpload" 
                accept="image/*"
                class="file-input"
                hidden
                @click="$event.stopPropagation()"
                formmethod="dialog" 
                formaction="javascript:void(0);">
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <label>用户名</label>
          <input type="text" 
                 v-model="settings.username"
                 @input="updateSettings"
                 placeholder="请输入用户名">
        </div>
        
        <div class="setting-item">
          <label>个性签名</label>
          <textarea 
            v-model="settings.motto" 
            @input="updateSettings"
            rows="3"
            placeholder="请输入个性签名"></textarea>
        </div>
      </div>
    </div>

    <!-- 导出/导入设置 -->
    <div class="settings-section">
      <h3>配置管理</h3>
      <div class="config-management">
        <div class="config-buttons">
          <button class="config-btn export" @click="exportSettings">导出配置</button>
          <label for="import-config" class="config-btn import">
            导入配置
            <input 
              id="import-config" 
              type="file" 
              @change="importSettings" 
              accept=".json"
              hidden>
          </label>
          <button class="config-btn reset" @click="resetSettings">重置配置</button>
        </div>
      </div>
    </div>

    <!-- 保存设置按钮 -->
    <div class="save-settings-bar">
      <button class="save-btn" @click="saveSettingsWithConfirm">保存设置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, createApp, h } from 'vue'

// 添加自定义消息组件
const createMessage = (content, type = 'success', duration = 3000) => {
  // 创建容器
  let messageContainer = document.querySelector('.custom-message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'custom-message-container';
    document.body.appendChild(messageContainer);
  }

  // 创建消息元素
  const messageElement = document.createElement('div');
  messageElement.className = `custom-message custom-message-${type}`;
  
  // 设置消息内容
  const contentEl = document.createElement('div');
  contentEl.className = 'custom-message-content';
  contentEl.textContent = content;
  
  // 添加到消息元素
  messageElement.appendChild(contentEl);
  
  // 设置动画持续时间的CSS变量来控制进度条动画
  messageElement.style.setProperty('--message-duration', `${duration}ms`);
  
  // 添加到容器
  messageContainer.appendChild(messageElement);
  
  // 设置动画
  setTimeout(() => {
    messageElement.classList.add('show');
  }, 10);
  
  // 设置消失动画
  setTimeout(() => {
    messageElement.classList.add('leave');
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 300);
  }, duration);
  
  return messageElement;
};

// 添加不同类型的消息方法
const showMessage = {
  success: (content, duration) => createMessage(content, 'success', duration),
  warning: (content, duration) => createMessage(content, 'warning', duration),
  error: (content, duration) => createMessage(content, 'error', duration),
  info: (content, duration) => createMessage(content, 'info', duration)
};

// 预设背景图片
const presetBackgrounds = [
  { url: '/background/startBg/start-bg1.png', name: '背景 1' },
  { url: '/background/startBg/start-bg2.png', name: '背景 2' },
  { url: '/background/startBg/start-bg3.png', name: '背景 3' },
  { url: '/background/startBg/start-bg4.png', name: '背景 4' },
  { url: '/background/startBg/start-bg5.png', name: '背景 5' },
  { url: '/background/startBg/start-bg6.png', name: '背景 6' },
  { url: '/background/startBg/start-bg7.png', name: '背景 7' },
  { url: '/background/startBg/start-bg8.png', name: '背景 8' },
  { url: '/background/startBg/start-bg9.png', name: '背景 9' }
]

// 默认设置 - 将背景透明度改为背景遮罩亮度
const defaultSettings = {
  backgroundMaskBrightness: 0.8, // 替换backgroundOpacity
  blurEffect: 10,
  primaryColor: '#409EFF',
  fontSize: 'medium',
  sidebarWidth: 250,
  contentMargin: 20,
  enableAnimations: true,
  animationSpeed: 'normal',
  userAvatar: '/default-avatar.png',
  username: '',
  motto: '',
  selectedBackground: presetBackgrounds[0].url,
  customBackground: null,
  darkMode: false
}

// 设置状态
const settings = ref({ ...defaultSettings })

// 自定义背景预览
const customBackgroundPreview = ref(null)

// 头像预览
const avatarPreview = ref(null)

// 计算当前选中的背景URL
const selectedBackgroundUrl = computed(() => {
  return settings.value.customBackground || settings.value.selectedBackground
})

// 防止表单默认提交
const preventFormSubmit = (event) => {
  event.preventDefault()
  event.stopPropagation()
  return false
}

// 初始化设置
onMounted(() => {
  loadSettings()
  applySettings()
  
  // 防止表单默认提交
  const forms = document.querySelectorAll('form')
  forms.forEach(form => {
    form.addEventListener('submit', preventFormSubmit)
  })
  
  // 特别检查avatar上传区域
  const avatarInput = document.getElementById('avatar-upload')
  if (avatarInput) {
    const parentForm = avatarInput.closest('form')
    if (parentForm) {
      console.log('发现avatar输入框在表单内，添加防提交处理')
      parentForm.addEventListener('submit', preventFormSubmit)
    }
  }
})

// 加载保存的设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('adminSettings')
    if (savedSettings) {
      settings.value = { ...defaultSettings, ...JSON.parse(savedSettings) }
      
      // 设置背景预览
      if (settings.value.customBackground) {
        customBackgroundPreview.value = settings.value.customBackground
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    showMessage.error('加载设置失败')
  }
}

// 更新设置
const updateSettings = () => {
  saveSettings()
  applySettings()
}

// 保存设置到本地存储
const saveSettings = () => {
  try {
    localStorage.setItem('adminSettings', JSON.stringify(settings.value))
    
    // 保存后立即应用背景和设置
    applySettings()
  } catch (error) {
    console.error('保存设置失败:', error)
    showMessage.error('保存设置失败')
  }
}

// 应用设置到页面 - 修改背景应用方式
const applySettings = () => {
  const root = document.documentElement
  
  // 应用主题色
  root.style.setProperty('--text-accent', settings.value.primaryColor)
  
  // 应用字体大小
  root.style.setProperty('--font-size', getFontSize())
  
  // 应用侧边栏宽度
  root.style.setProperty('--sidebar-width', `${settings.value.sidebarWidth}px`)
  
  // 应用内容区域边距
  root.style.setProperty('--content-margin', `${settings.value.contentMargin}px`)
  
  // 应用动画持续时间
  root.style.setProperty('--animation-duration', getAnimationDuration())
  
  // 应用背景遮罩亮度
  root.style.setProperty('--bg-mask-brightness', settings.value.backgroundMaskBrightness)
  
  // 应用主题模式
  if (settings.value.darkMode) {
    root.classList.add('dark-theme')
    // 同步主题切换按钮状态
    const themeBtn = document.querySelector('.theme-shift-btn')
    if (themeBtn) themeBtn.classList.add('active')
  } else {
    root.classList.remove('dark-theme')
    // 同步主题切换按钮状态
    const themeBtn = document.querySelector('.theme-shift-btn')
    if (themeBtn) themeBtn.classList.remove('active')
  }
  
  // 应用背景到整个管理系统
  applyBackgroundToSystem()
}

// 新方法：将背景应用到整个管理系统
const applyBackgroundToSystem = () => {
  // 获取当前选中的背景
  const backgroundUrl = selectedBackgroundUrl.value
  
  if (!backgroundUrl) return
  
  // 获取所有相关元素
  const adminLayout = document.querySelector('.admin-layout')
  if (!adminLayout) {
    // 如果找不到管理布局，尝试通过事件通知其他组件
    const event = new CustomEvent('admin-background-change', { 
      detail: { 
        backgroundUrl,
        maskBrightness: settings.value.backgroundMaskBrightness,
        blurEffect: settings.value.blurEffect
      } 
    });
    document.dispatchEvent(event);
    return;
  }
  
  // 直接设置背景图片
  adminLayout.style.backgroundImage = `url(${backgroundUrl})`;
  adminLayout.style.backgroundSize = 'cover';
  adminLayout.style.backgroundPosition = 'center';
  adminLayout.style.backgroundAttachment = 'fixed';
  
  // 添加前景遮罩层控制亮度
  let maskLayer = document.querySelector('.admin-bg-mask');
  if (!maskLayer) {
    maskLayer = document.createElement('div');
    maskLayer.className = 'admin-bg-mask';
    adminLayout.prepend(maskLayer); // 添加到最前面
  }
  
  // 设置遮罩层亮度
  maskLayer.style.opacity = 1 - settings.value.backgroundMaskBrightness;
  
  // 应用模糊效果
  const glassContainers = document.querySelectorAll('.glass-container');
  glassContainers.forEach(container => {
    container.style.backdropFilter = `blur(${settings.value.blurEffect}px)`;
  });
}

// 删除旧的预览背景方法
// 添加新的预览背景的方法
const previewBackground = () => {
  applyBackgroundToSystem()
}

// 应用背景到全局 - 简化为使用系统方法
const applyBackground = () => {
  // 获取当前选中的背景
  const backgroundUrl = selectedBackgroundUrl.value
  
  if (!backgroundUrl) {
    showMessage.warning('请先选择背景')
    return
  }
  
  // 保存当前背景设置
  saveSettings()
  
  // 手动触发事件以确保AdminLayout能立即更新背景
  const event = new CustomEvent('admin-background-change', { 
    detail: { 
      backgroundUrl,
      maskBrightness: settings.value.backgroundMaskBrightness,
      blurEffect: settings.value.blurEffect
    } 
  });
  document.dispatchEvent(event);
  
  // 手动触发storage事件，确保在同一页面上的其他AdminLayout实例能够更新
  try {
    // 由于同一个页面无法监听自己触发的storage事件，我们模拟一个数据变化
    localStorage.setItem('_temp_bg_trigger', Date.now().toString());
    localStorage.removeItem('_temp_bg_trigger');
  } catch (e) {
    console.error('触发背景更新失败:', e);
  }
  
  showMessage.success('背景已应用至全局')
}

// 切换主题模式
const toggleThemeMode = (isDark) => {
  settings.value.darkMode = isDark
  updateSettings()
}

// 选择背景
const selectBackground = (bg) => {
  settings.value.selectedBackground = bg.url
  settings.value.customBackground = null
  customBackgroundPreview.value = null
  
  // 自动预览背景
  previewBackground()
}

// 处理背景图片上传
const handleBackgroundUpload = async (event) => {
  // 预防表单提交
  event.preventDefault()
  event.stopPropagation()
  
  console.log('开始背景图片上传流程')
  
  const file = event.target.files[0]
  if (!file) {
    console.log('未选择文件')
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showMessage.error('请上传图片文件')
    return
  }
  
  // 验证文件大小 (限制为10MB)
  if (file.size > 10 * 1024 * 1024) {
    showMessage.error('图片大小不能超过10MB')
    return
  }
  
  try {
    // 创建本地预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      customBackgroundPreview.value = e.target.result
      settings.value.customBackground = e.target.result
      updateSettings()
    }
    reader.readAsDataURL(file)
    
    // 模拟上传成功
    showMessage.success('背景图片预览已生成')
  } catch (error) {
    console.error('背景图片处理失败:', error)
    showMessage.error('背景图片处理失败')
  }
}

// 移除自定义背景
const removeCustomBackground = () => {
  customBackgroundPreview.value = null
  settings.value.customBackground = null
  updateSettings()
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  // 预防表单提交
  event.preventDefault()
  event.stopPropagation()
  
  console.log('开始头像上传流程')
  
  const file = event.target.files[0]
  if (!file) {
    console.log('未选择文件')
    return
  }
  
  // 创建一个新的方法来处理实际的上传
  await processAvatarUpload(file)
  
  // 重置文件输入
  event.target.value = ''
}

// 实际处理上传的方法
const processAvatarUpload = async (file) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showMessage.error('请上传图片文件')
    return
  }
  
  // 验证文件大小 (限制为2MB)
  if (file.size > 2 * 1024 * 1024) {
    showMessage.error('头像大小不能超过2MB')
    return
  }
  
  try {
    // 创建本地预览URL
    const previewUrl = URL.createObjectURL(file)
    avatarPreview.value = previewUrl
    
    // 显示上传中状态
    showMessage.info('头像上传中...', 6000)
    
    // 根据文件大小选择上传方式
    const isSmallFile = file.size <= 2 * 1024 * 1024 // 小于等于2MB
    let uploadResult
    
    if (isSmallFile) {
      // 小文件使用服务器中转方式
      uploadResult = await uploadViaServer(file)
    } else {
      // 大文件使用前端直传方式
      uploadResult = await uploadViaDirect(file)
    }
    
    console.log('图片上传成功:', uploadResult)
    
    // 更新头像URL
    avatarPreview.value = uploadResult.url
    settings.value.userAvatar = uploadResult.url
    
    // 释放预览URL内存
    URL.revokeObjectURL(previewUrl)
    
    // 保存设置
    updateSettings()
    
    // 显示成功消息
    showMessage.success('头像上传成功')
    
    // 更新用户头像到服务器
    try {
      await updateUserAvatar(uploadResult.url)
    } catch (error) {
      console.error('更新用户头像失败:', error)
      showMessage.warning('头像已上传，但更新用户资料失败: ' + (error.message || '未知错误'))
    }
  } catch (error) {
    console.error('头像处理失败:', error)
    showMessage.error(error.message || '头像上传失败')
  }
}

// 服务器中转上传方式 - 适合小文件（<2MB）
const uploadViaServer = (file) => {
  console.log('使用服务器中转上传方式')
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8088/api/image/upload', true)
    xhr.withCredentials = true
    // 添加Referer请求头，模拟生产环境
    xhr.setRequestHeader('Referer', 'https://www.dannysummer.asia')
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          console.log('服务器上传响应:', response)
          
          // 同时支持 code === 200 和 success === true 的响应格式
          if ((response.success === true || response.code === 200) && response.data) {
            // 格式化URL为usr.dannysummer.asia域名格式
            let url = response.data.url;
            // 检查是否需要转换URL格式
            if (url && url.includes('cos.ap-chengdu.myqcloud.com')) {
              // 提取路径部分
              const pathMatch = url.match(/\/([^/]+\/[^/]+\/[^/]+\.[^/]+)$/);
              if (pathMatch && pathMatch[1]) {
                url = `https://usr.dannysummer.asia/${pathMatch[1]}`;
              }
            }

            resolve({
              url: url,
              filename: response.data.filename,
              path: response.data.path
            })
          } else {
            reject(new Error(response.message || '上传失败'))
          }
        } catch (e) {
          console.error('解析响应失败', e, xhr.responseText)
          reject(new Error('解析上传响应失败'))
        }
      } else {
        reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`))
      }
    }
    
    xhr.onerror = function() {
      reject(new Error('网络错误，无法上传图片'))
    }
    
    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  })
}

// 前端直传方式 - 适合大文件（>2MB）
const uploadViaDirect = async (file) => {
  console.log('使用前端直传上传方式')
  
  // 获取上传令牌
  const tokenData = await getToken()
  console.log('获取到上传令牌:', tokenData)
  
  // 从令牌响应中获取信息
  const { 
    token, 
    uploadUrl, 
    fileName, 
    bucket, 
    path, 
    allowedTypes, 
    maxFileSize,
    expiresAt 
  } = tokenData
  
  // 验证文件
  if (allowedTypes && maxFileSize) {
    const validationError = validateFile(file, allowedTypes.split(','), maxFileSize)
    if (validationError) {
      throw new Error(validationError)
    }
  }
  
  // 检查令牌是否过期
  if (Date.now() / 1000 >= expiresAt) {
    throw new Error('上传令牌已过期')
  }
  
  // 执行上传
  return await uploadToS3(file, token, uploadUrl, path, bucket)
}

// 获取上传令牌
const getToken = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://localhost:8088/api/image/token', true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/json')
    // 添加Referer请求头，模拟生产环境
    xhr.setRequestHeader('Referer', 'https://www.dannysummer.asia')
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          if ((response.success || response.code === 200) && (response.data)) {
            resolve(response.data)
          } else {
            reject(new Error(response.message || '获取上传令牌失败'))
          }
        } catch (e) {
          console.error('解析令牌响应失败', e, xhr.responseText)
          reject(new Error('解析上传令牌失败'))
        }
      } else {
        reject(new Error(`获取上传令牌失败: ${xhr.status} ${xhr.statusText}`))
      }
    }
    
    xhr.onerror = function() {
      reject(new Error('网络错误，无法获取上传令牌'))
    }
    
    xhr.send()
  })
}

// 验证文件类型和大小是否符合要求
const validateFile = (file, allowedTypes, maxFileSize) => {
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `不支持的文件类型：${file.type}，支持的类型：${allowedTypes}`;
  }
  
  if (maxFileSize && file.size > maxFileSize) {
    const maxSizeMB = maxFileSize / (1024 * 1024);
    return `文件太大，最大允许 ${maxSizeMB} MB`;
  }
  
  return null;
};

// 直接上传到S3兼容存储
const uploadToS3 = (file, token, uploadUrl, path, bucket) => {
  console.log('上传文件到云存储:', {
    uploadUrl,
    path,
    bucket,
    token: token.substring(0, 10) + '...'
  })
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrl, true)
    // 添加Referer请求头，模拟生产环境
    xhr.setRequestHeader('Referer', 'https://www.dannysummer.asia')
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const responseText = xhr.responseText
          console.log('云存储上传原始响应:', responseText)
          
          // 尝试解析为JSON
          let response
          try {
            response = JSON.parse(responseText)
          } catch (e) {
            console.log('响应不是JSON格式，尝试作为URL字符串处理')
            // 如果不是JSON，检查是否是直接返回的URL字符串
            if (responseText.includes('http')) {
              // 格式化URL为usr.dannysummer.asia域名格式
              let url = responseText.trim();
              if (url.includes('cos.ap-chengdu.myqcloud.com')) {
                const pathMatch = url.match(/\/([^/]+\/[^/]+\/[^/]+\.[^/]+)$/);
                if (pathMatch && pathMatch[1]) {
                  url = `https://usr.dannysummer.asia/${pathMatch[1]}`;
                }
              }
              return resolve({ url: url })
            }
          }
          
          console.log('云存储上传解析响应:', response)
          
          // 提取URL - 处理不同格式的响应
          let fileUrl = ''
          
          if (response.code === 200 && response.data && response.data.url) {
            // 标准API响应格式
            fileUrl = response.data.url
          } else if (response.Location) {
            // S3兼容格式
            fileUrl = response.Location
          } else if (response.url) {
            // 简单URL格式
            fileUrl = response.url
          } else if (path && uploadUrl) {
            // 构造可能的URL
            let baseUrl = uploadUrl
            if (baseUrl.endsWith('/')) {
              baseUrl = baseUrl.substring(0, baseUrl.length - 1)
            }
            
            fileUrl = `${baseUrl}/${path}`
          } else {
            reject(new Error('上传失败，未获取到图片URL'))
            return
          }
          
          // 转换为usr.dannysummer.asia域名格式
          if (fileUrl.includes('cos.ap-chengdu.myqcloud.com')) {
            const pathMatch = fileUrl.match(/\/([^/]+\/[^/]+\/[^/]+\.[^/]+)$/);
            if (pathMatch && pathMatch[1]) {
              fileUrl = `https://usr.dannysummer.asia/${pathMatch[1]}`;
            }
          }
          
          resolve({ 
            url: fileUrl,
            filename: path.split('/').pop() || 'avatar.jpg',
            path: path
          })
        } catch (e) {
          console.error('解析上传响应失败', e, xhr.responseText)
          reject(new Error('解析上传响应失败'))
        }
      } else {
        reject(new Error(`图片上传失败: ${xhr.status} ${xhr.statusText}`))
      }
    }
    
    xhr.onerror = function() {
      reject(new Error('网络错误，无法上传图片'))
    }
    
    const formData = new FormData()
    
    // 解析token参数（格式为accessKeyId:secretAccessKey:sessionToken）
    if (token && token.includes(':')) {
      const [accessKeyId, secretAccessKey, sessionToken] = token.split(':')
      
      // 添加S3上传所需参数
      formData.append('key', path) // 指定文件存储路径
      formData.append('bucket', bucket)
      formData.append('AccessKeyId', accessKeyId)
      formData.append('AccessKeySecret', secretAccessKey)
      if (sessionToken) {
        formData.append('SecurityToken', sessionToken)
      }
    } else {
      // 兼容之前的格式
      formData.append('token', token)
      formData.append('path', path)
    }
    
    formData.append('file', file)
    xhr.send(formData)
  })
}

// 更新用户头像到服务器
const updateUserAvatar = (avatarUrl) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8088/api/user/update-avatar', true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/json')
    // 添加Referer请求头，模拟生产环境
    xhr.setRequestHeader('Referer', 'https://www.dannysummer.asia')
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.success || response.code === 200) {
            resolve(response)
          } else {
            reject(new Error(response.message || '更新用户头像失败'))
          }
        } catch (e) {
          console.error('解析头像更新响应失败', e, xhr.responseText)
          reject(new Error('解析服务器响应失败'))
        }
      } else {
        reject(new Error(`更新头像失败: ${xhr.status} ${xhr.statusText}`))
      }
    }
    
    xhr.onerror = function() {
      reject(new Error('网络错误，无法更新用户头像'))
    }
    
    xhr.send(JSON.stringify({ avatarUrl }))
  })
}

// 获取字体大小
const getFontSize = () => {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  }
  return sizes[settings.value.fontSize]
}

// 获取动画持续时间
const getAnimationDuration = () => {
  if (!settings.value.enableAnimations) return '0s'
  const durations = {
    slow: '0.5s',
    normal: '0.3s',
    fast: '0.1s'
  }
  return durations[settings.value.animationSpeed]
}

// 导出设置
const exportSettings = () => {
  try {
    // 创建Blob对象
    const settingsJSON = JSON.stringify(settings.value, null, 2)
    const blob = new Blob([settingsJSON], { type: 'application/json' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-settings-${new Date().toISOString().slice(0, 10)}.json`
    
    // 模拟点击下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 释放URL对象
    URL.revokeObjectURL(url)
    
    showMessage.success('配置已导出')
  } catch (error) {
    console.error('导出配置失败:', error)
    showMessage.error('导出配置失败')
  }
}

// 导入设置
const importSettings = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    showMessage.error('请上传JSON配置文件')
    return
  }
  
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result)
        
        // 验证导入的配置
        if (!importedSettings || typeof importedSettings !== 'object') {
          throw new Error('无效的配置文件格式')
        }
        
        // 确认导入
        if (confirm('确定要导入这些设置吗？当前的设置将被覆盖。')) {
          // 合并设置，保留默认值作为备选
          settings.value = { ...defaultSettings, ...importedSettings }
          
          // 更新预览
          if (settings.value.customBackground) {
            customBackgroundPreview.value = settings.value.customBackground
          }
          
          updateSettings()
          showMessage.success('配置已导入')
          
          // 手动触发背景更新事件
          const newBackgroundUrl = settings.value.customBackground || settings.value.selectedBackground;
          if (newBackgroundUrl) {
            const event = new CustomEvent('admin-background-change', { 
              detail: { 
                backgroundUrl: newBackgroundUrl,
                maskBrightness: settings.value.backgroundMaskBrightness,
                blurEffect: settings.value.blurEffect
              } 
            });
            document.dispatchEvent(event);
          }
        }
      } catch (error) {
        console.error('解析配置文件失败:', error)
        showMessage.error('无效的配置文件')
      }
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('导入配置失败:', error)
    showMessage.error('导入配置失败')
  }
}

// 保存确认
const saveSettingsWithConfirm = () => {
  saveSettings()
  showMessage.success('设置已保存成功！')
}

// 监听值变化，实时预览
watch([
  () => settings.value.backgroundMaskBrightness,
  () => settings.value.blurEffect,
  () => selectedBackgroundUrl.value
], () => {
  previewBackground()
})

// 重置设置函数
const resetSettings = () => {
  // 创建确认消息盒子
  const confirmEl = document.createElement('div');
  confirmEl.className = 'confirm-reset-dialog';
  confirmEl.innerHTML = `
    <div class="confirm-content">确定要重置所有配置吗？这将恢复到默认设置。</div>
    <div class="confirm-actions">
      <button class="confirm-btn cancel">取消</button>
      <button class="confirm-btn confirm">确定</button>
    </div>
  `;
  
  document.body.appendChild(confirmEl);
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .confirm-reset-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(30, 36, 50, 0.85);
      width: 380px;
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      z-index: 10000;
      backdrop-filter: blur(10px);
      animation: confirm-in 0.4s cubic-bezier(0.165, 0.84, 0.265, 1) forwards;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .confirm-content {
      margin-bottom: 25px;
      color: white;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
    }
    
    .confirm-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    
    .confirm-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
      border-radius: 8px 8px 0 0;
    }
    
    .confirm-btn.cancel {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      backdrop-filter: blur(4px);
    }
    
    .confirm-btn.confirm {
      background: linear-gradient(to right, #f56c6c, #fc8181);
      color: white;
      box-shadow: 0 3px 8px rgba(245, 108, 108, 0.3);
    }
    
    .confirm-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      filter: brightness(1.05);
    }
    
    .confirm-btn:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(3px);
      z-index: 9999;
      animation: overlay-in 0.3s ease forwards;
    }
  `;
  
  document.head.appendChild(style);
  
  // 添加背景遮罩
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  
  // 按钮事件
  const cancelBtn = confirmEl.querySelector('.cancel');
  const confirmBtn = confirmEl.querySelector('.confirm');
  
  // 取消事件
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(confirmEl);
    document.body.removeChild(overlay);
    document.head.removeChild(style);
  });
  
  // 确认事件
  confirmBtn.addEventListener('click', () => {
    document.body.removeChild(confirmEl);
    document.body.removeChild(overlay);
    document.head.removeChild(style);
    
    // 执行重置
    settings.value = { ...defaultSettings };
    customBackgroundPreview.value = null;
    avatarPreview.value = null;
    saveSettings();
    showMessage.success('配置已重置为默认值', 3000);
  });
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  /* 移除网格布局 */
  display: block;
}

.page-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: var(--text-accent);
}

.settings-section {
  background: var(--bg-content);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px var(--shadow-color);
  backdrop-filter: blur(10px);
  gap: 20px;
  height: fit-content;
}

.settings-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.settings-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--text-secondary);
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.setting-item label {
  min-width: 120px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 背景网格 */
.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.bg-item {
  height: 100px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
  overflow: hidden;
}

.bg-item:hover {
  transform: scale(1.05);
}

.bg-item.active {
  border-color: var(--text-accent);
  transform: scale(1.05);
}

.bg-item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  font-size: 12px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.bg-item:hover .bg-item-name,
.bg-item.active .bg-item-name {
  opacity: 1;
}

/* 上传功能模块 */
.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

.upload-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--text-accent);
  color: var(--text-accent);
}

.upload-icon {
  font-size: 20px;
  font-weight: bold;
}

.preview-container {
  position: relative;
  margin-top: 10px;
}

.background-preview {
  max-width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.7);
}

/* 头像上传 */
.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.current-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
}

.upload-avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px var(--shadow-color);
}

/* 滑块容器 */
.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  max-width: 300px;
  height: 6px;
  background: linear-gradient(to right, var(--text-accent), #a5d8ff);
  border-radius: 10px;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--text-accent);
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--text-accent);
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.slider-value {
  min-width: 50px;
  text-align: center;
  background: var(--bg-secondary);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 颜色选择器 - 优化版 */
.color-picker-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-picker {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.color-picker::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent);
  pointer-events: none;
}

.color-picker:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.color-picker:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.25);
  outline: none;
}

.color-value {
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

/* 主题切换开关 - 优化版 */
.theme-switch {
  display: flex;
  align-items: center;
  gap: 15px;
}

.theme-switch input {
  display: none;
}

.theme-slider {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 32px;
  background-color: #f0f0f0;
  border-radius: 32px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-slider:before {
  position: absolute;
  content: "";
  height: 28px;
  width: 28px;
  left: 2px;
  bottom: 1px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.theme-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  box-sizing: border-box;
  pointer-events: none;
  opacity: 0.8;
}

.light-icon, .dark-icon {
  font-size: 16px;
  line-height: 1;
  transition: all 0.3s ease;
}

.light-icon {
  margin-left: -4.5px;
}

.dark-icon {
  margin-right: -4.5px;
}

input:checked + .theme-slider {
  background-color: #2c3e50;
}

input:checked + .theme-slider:before {
  transform: translateX(86px);
}

.theme-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 输入框样式 - 优化版 */
input[type="text"],
textarea,
select {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  max-width: 400px;
  font-family: inherit;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.05);
  outline: none;
}

input[type="text"]::placeholder,
textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.select-container {
  position: relative;
  max-width: 400px;
  flex: 1;
}

select {
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 36px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.select-container::after {
  display: none;
}

/* 配置管理按钮 - 优化版 */
.config-management {
  margin-top: 20px;
}

.config-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.config-btn {
  padding: 12px 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.2px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.config-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  z-index: 1;
}

.config-btn.export {
  background: var(--text-accent);
  color: white;
}

.config-btn.import {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.config-btn.reset {
  background: linear-gradient(to right, #f56c6c, #fc8181);
  color: white;
}

.config-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  filter: brightness(1.05);
}

.config-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

/* 暗色主题适配 - 更新 */
:root.dark-theme input[type="text"],
:root.dark-theme textarea,
:root.dark-theme select {
  background: rgba(40, 40, 50, 0.6);
  border-color: rgba(70, 70, 80, 0.3);
  color: #e1e7ef;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

:root.dark-theme input[type="text"]:focus,
:root.dark-theme textarea:focus,
:root.dark-theme select:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(93, 146, 255, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

:root.dark-theme input[type="text"]::placeholder,
:root.dark-theme textarea::placeholder {
  color: rgba(225, 231, 239, 0.5);
}

:root.dark-theme .config-btn.import {
  background: rgba(40, 40, 50, 0.6);
  color: #e1e7ef;
  border-color: rgba(70, 70, 80, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .settings-page {
    grid-template-columns: 1fr;
    padding: 15px;
  }
}

/* 保存设置按钮 */
.save-settings-bar {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 15px 0;
  z-index: 100;
}

.save-btn {
  background:#36b6ff;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 38px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35), 
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 2px 2px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  /* background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent); */
  border-radius: 50px 50px 0 0;
}

.save-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(64, 158, 255, 0.45),
              0 3px 6px rgba(0, 0, 0, 0.15),
              inset 0 2px 2px rgba(255, 255, 255, 0.3);
  filter: brightness(1.05);
}

.save-btn:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(64, 158, 255, 0.35),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 2px 2px rgba(255, 255, 255, 0.3);
}

/* 全宽节 */
.settings-section.full-width {
  grid-column: 1 / -1;
}

/* 背景遮罩样式 */
:global(.admin-bg-mask) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 1; /* 确保在内容之下 */
  pointer-events: none; /* 允许点击穿透 */
}

:global(.glass-container) {
  position: relative;
  z-index: 2; /* 确保在遮罩之上 */
}

/* 应用按钮 - 优化版 */
.apply-btn {
  /* background: linear-gradient(to right, var(--text-accent), rgba(96, 165, 250, 0.9)); */
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.25);
  position: relative;
  overflow: hidden;
}

.apply-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 8px 8px 0 0;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.35);
  filter: brightness(1.05);
}

.apply-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(64, 158, 255, 0.25);
}

/* 恢复原始的动画切换按钮样式 */
.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-checkbox {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background-color: #ccc;
  border-radius: 26px;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: var(--text-accent);
}

.toggle-checkbox:checked + .toggle-label:before {
  transform: translateX(94px);
}

/* 自定义消息框样式 */
:global(.custom-message-container) {
  position: fixed;
  bottom: 100px;
  right: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  min-width: 250px;
}

:global(.custom-message) {
  background: rgba(40, 45, 60, 0.85);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  backdrop-filter: blur(8px);
  border-left: 4px solid transparent;
  overflow: hidden;
}

:global(.custom-message.show) {
  transform: translateX(0);
  opacity: 1;
}

:global(.custom-message.leave) {
  transform: translateX(120%);
  opacity: 0;
}

:global(.custom-message-content) {
  font-size: 14px;
  line-height: 1.5;
}

:global(.custom-message-success) {
  border-left-color: rgb(0, 217, 255);
}

:global(.custom-message-warning) {
  border-left-color: #e6a23c;
}

:global(.custom-message-error) {
  border-left-color: #f56c6c;
}

:global(.custom-message-info) {
  border-left-color: #909399;
}

/* 进度条使用 ::after 伪类 */
:global(.custom-message::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: var(--text-accent);
  animation: message-progress linear;
  animation-duration: var(--message-duration, 3000ms);
}

:global(.custom-message-success::after) {
  background-color: rgb(0, 217, 255);
}

:global(.custom-message-warning::after) {
  background-color: rgba(230, 162, 60, 0.6);
}

:global(.custom-message-error::after) {
  background-color: rgba(245, 108, 108, 0.6);
}

:global(.custom-message-info::after) {
  background-color: rgba(144, 147, 153, 0.6);
}

@keyframes message-progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}

/* 旧的进度条元素隐藏 */
:global(.custom-message-progress) {
  display: none !important;
}
</style> 