<template>
  <div class="envelope-wrapper">
    <div class="envelope" :class="{ active: isActive }" @click="toggleEnvelope">
      <!-- 底层信封 -->
      <div class="envelope-layer before">
        <img src="/elements/Envelope/before.png" alt="envelope-before">
      </div>
      
      <!-- 添加裁切器 -->
      <div class="content-clipper">
        <!-- 中间内容和背景的容器 -->
        <div class="content-wrapper">
          <!-- 中间背景层 -->
          <div class="envelope-layer middle">
            <img src="/elements/Envelope/夏目.jpg" alt="envelope-middle">
          </div>
          
          <!-- 内容层 -->
          <div class="content-container">
            <div class="letter">
              <div class="friend-form" @click.stop>
                <div class="form-item">
                  <label>名称：</label>
                  <input 
                    type="text" 
                    v-model="formData.name" 
                    @click.stop 
                    :class="{ 'error': errors.name }"
                  />
                </div>
                <div class="form-item">
                  <label>简介：</label>
                  <input 
                    type="text" 
                    v-model="formData.description" 
                    @click.stop
                    :class="{ 'error': errors.description }"
                  />
                </div>
                <div class="form-item">
                  <label>封面：</label>
                  <input 
                    type="text" 
                    v-model="formData.cover" 
                    @click.stop
                    :class="{ 'error': errors.cover }"
                  />
                </div>
                <div class="form-item">
                  <label>头像：</label>
                  <input 
                    type="text" 
                    v-model="formData.avatar" 
                    @click.stop
                    :class="{ 'error': errors.avatar }"
                  />
                </div>
                <div class="form-item">
                  <label>网址：</label>
                  <input 
                    type="text" 
                    v-model="formData.url" 
                    @click.stop
                    :class="{ 'error': errors.url }"
                  />
                </div>
                <div class="form-item">
                  <label>邮箱：</label>
                  <input 
                    type="email" 
                    v-model="formData.pendingEmail" 
                    @click.stop
                    :class="{ 'error': errors.pendingEmail }"
                    :readonly="userStore.isLoggedIn"
                    :title="userStore.isLoggedIn ? '登录状态下自动填充邮箱' : '请输入您的邮箱地址'"
                  />
                  <small v-if="userStore.isLoggedIn" class="auto-fill-note">已自动填充登录邮箱</small>
                </div>
                <div class="error-message" v-if="submitError">{{ submitError }}</div>
                <button 
                  class="submit-btn" 
                  @click.stop="handleSubmit"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? '提交中...' : '提交' }}
                </button>
              </div>
              <div class="friend-footer">
                <div class="footer-deco"></div>
                <span>欢迎交换友链</span>
                <div class="footer-deco"></div>
              </div>
              <div class="decoration-image">
                <img src="/elements/Envelope/luoxiaohei.png" alt="decoration">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 顶层信封 -->
      <div class="envelope-layer after">
        <img src="/elements/Envelope/after.png" alt="envelope-after">
      </div>
    </div>
    
    <!-- 添加装饰猫咪 -->
    <div class="decoration-cat" :class="{ 'show': isActive }">
      <!-- 添加气泡框 -->
      <div class="chat-bubbles" :class="{ 'show': isActive }">
        <div class="bubble bubble-1">
          <h4>喵~请遵守友链申请格式哦！</h4>
          <p>友链格式：简单来说，封面上传您的图片URL，名称与简介不超过20字符就行啦！</p>
        </div>
        <div class="bubble bubble-2">
          <h4>对于您的申请喵喵会审核啦~</h4>
          <p>通过的友链会在次日24：00更新哦！</p>
          <p>婉拒规则详见《Dannyの友令公约》哦</p>
        </div>
        <div class="bubble bubble-3">
          <p>喵喵~祝您活出您想要的人生哦！</p>
        </div>
      </div>
      <img src="/elements/Envelope/xiamu-cat.png" alt="decoration-cat" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { config } from '../config/index'
import { useUserStore } from '../stores/user'
import { useMessage } from '../stores/message'

interface FormData {
  name: string
  description: string
  url: string
  avatar: string
  cover: string
  pendingEmail: string
  category: string
}

interface FormErrors {
  name: boolean
  description: boolean
  url: boolean
  avatar: boolean
  cover: boolean
  pendingEmail: boolean
}

type FormKey = keyof FormData
type ErrorKey = keyof FormErrors

const isActive = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')

// 用户状态管理
const userStore = useUserStore()

// 消息通知
const message = useMessage()

// 表单数据
const formData = reactive<FormData>({
  name: '',
  description: '',
  url: '',
  avatar: '',
  cover: '',
  pendingEmail: '',
  category: 'friend'
})

// 表单错误
const errors = reactive<FormErrors>({
  name: false,
  description: false,
  url: false,
  avatar: false,
  cover: false,
  pendingEmail: false
})

const toggleEnvelope = () => {
  isActive.value = !isActive.value
}

// 监听信封状态变化
watch(isActive, (newValue) => {
  if (newValue) {
    // 当信封打开时，延迟一小段时间后显示猫咪
    setTimeout(() => {
      const cat = document.querySelector('.decoration-cat')
      cat?.classList.add('show')
    }, 600) // 延迟600ms，等信封完全打开
  } else {
    // 当信封关闭时，立即隐藏猫咪
    const cat = document.querySelector('.decoration-cat')
    cat?.classList.remove('show')
  }
})

// 验证表单
const validateForm = () => {
  let isValid = true
  let errorMessages: string[] = []
  
  // 重置错误状态
  const errorKeys = Object.keys(errors) as ErrorKey[]
  errorKeys.forEach(key => {
    errors[key] = false
  })
  
  // 验证名称
  if (!formData.name.trim()) {
    errors.name = true
    errorMessages.push('请填写友链名称')
    isValid = false
  } else if (formData.name.length > 20) {
    errors.name = true
    errorMessages.push('友链名称不能超过20个字符')
    isValid = false
  }
  
  // 验证简介
  if (!formData.description.trim()) {
    errors.description = true
    errorMessages.push('请填写友链简介')
    isValid = false
  } else if (formData.description.length > 20) {
    errors.description = true
    errorMessages.push('友链简介不能超过20个字符')
    isValid = false
  }
  
  // 验证URL
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  if (!formData.url.trim()) {
    errors.url = true
    errorMessages.push('请填写网站地址')
    isValid = false
  } else if (!urlPattern.test(formData.url)) {
    errors.url = true
    errorMessages.push('请填写正确的网站地址格式')
    isValid = false
  }
  
  // 验证头像URL
  if (!formData.avatar.trim()) {
    errors.avatar = true
    errorMessages.push('请填写头像地址')
    isValid = false
  } else if (!formData.avatar.startsWith('http')) {
    errors.avatar = true
    errorMessages.push('头像地址必须以http开头')
    isValid = false
  }
  
  // 验证封面URL
  if (!formData.cover.trim()) {
    errors.cover = true
    errorMessages.push('请填写封面地址')
    isValid = false
  } else if (!formData.cover.startsWith('http')) {
    errors.cover = true
    errorMessages.push('封面地址必须以http开头')
    isValid = false
  }
  
  // 验证邮箱
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.pendingEmail.trim()) {
    errors.pendingEmail = true
    errorMessages.push('请填写邮箱地址')
    isValid = false
  } else if (!emailPattern.test(formData.pendingEmail)) {
    errors.pendingEmail = true
    errorMessages.push('请填写正确的邮箱格式')
    isValid = false
  }
  
  // 如果有错误，显示第一个错误信息
  if (!isValid && errorMessages.length > 0) {
    message.error(errorMessages[0])
  }
  
  return isValid
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 重置错误信息
    submitError.value = ''
    
    // 表单验证（内部会显示具体错误信息）
    if (!validateForm()) {
      return
    }
    
    isSubmitting.value = true
    
    // 设置请求超时时间为5秒
    const timeoutId = setTimeout(() => {
      console.log('API请求超时，切换到离线模式')
    }, 5000)
    
    try {
      const response = await Promise.race([
        fetch(`${config.api.apiUrl}/friend-links-pending/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        }),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 5000)
        )
      ]) as Response

      clearTimeout(timeoutId)
      
      if (response) {
        const data = await response.json()
        
        if (response.ok && data.success) {
          // 提交成功，重置表单
          const formKeys = Object.keys(formData) as FormKey[]
          formKeys.forEach(key => {
            if (key !== 'category' && key !== 'pendingEmail') {
              formData[key] = ''
            }
          })
          // 邮箱字段根据登录状态处理：登录时保持，未登录时清空
          if (!userStore.isLoggedIn) {
            formData.pendingEmail = ''
          }
          // 关闭信封
          isActive.value = false
          // 显示成功提示
          console.log('准备显示成功消息')
          message.success('友链申请提交成功，请等待审核！')
          console.log('成功消息已调用')
        } else {
          // 提交失败，保留表单数据，显示具体的错误信息
          const errorMessage = data.message || data.error || `服务器错误 (${response.status})`
          message.error(errorMessage)
          submitError.value = errorMessage
        }
      } else {
        throw new Error('网络请求失败')
      }
    } catch (apiError) {
      clearTimeout(timeoutId)
      console.warn('API服务不可用，使用离线模式:', apiError)
      
      // 在没有后端服务的情况下，提供友好的用户体验
      // 保存申请信息到本地存储，供后续处理
      const applicationData = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: `temp_${Date.now()}`
      }
      
      // 保存到本地存储
      const savedApplications = JSON.parse(localStorage.getItem('pendingFriendLinkApplications') || '[]')
      savedApplications.push(applicationData)
      localStorage.setItem('pendingFriendLinkApplications', JSON.stringify(savedApplications))
      
      // 离线模式下也重置表单
      const formKeys = Object.keys(formData) as FormKey[]
      formKeys.forEach(key => {
        if (key !== 'category' && key !== 'pendingEmail') {
          formData[key] = ''
        }
      })
      // 邮箱字段根据登录状态处理：登录时保持，未登录时清空
      if (!userStore.isLoggedIn) {
        formData.pendingEmail = ''
      }
      
      // 关闭信封
      isActive.value = false
      
      // 显示离线模式成功提示
      message.success('申请已暂存成功！后端服务暂时不可用，请联系站长处理。', { duration: 5000 })
      message.info(`申请信息：${applicationData.name} - ${applicationData.description}`, { duration: 8000 })
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    // 失败时不清空表单，保留用户输入的数据
    const errorMessage = error.message || '提交失败，请稍后重试'
    message.error(errorMessage)
    submitError.value = errorMessage
  } finally {
    isSubmitting.value = false
  }
}

// 组件挂载时自动填充邮箱
onMounted(() => {
  // 如果用户已登录且有邮箱信息，自动填充
  if (userStore.isLoggedIn && userStore.userInfo?.email) {
    formData.pendingEmail = userStore.userInfo.email
  }
})

// 监听登录状态变化，自动填充或清空邮箱
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue && userStore.userInfo?.email) {
    // 用户登录时，自动填充邮箱
    formData.pendingEmail = userStore.userInfo.email
  } else if (!newValue) {
    // 用户登出时，清空邮箱
    formData.pendingEmail = ''
  }
})
</script>

<style scoped>
.envelope-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: none;
  z-index: 9999;
  width: 80vw;
  max-width: 530px;
}

.envelope {
  position: absolute;
  width: 100%;
  padding-bottom: 59.62%;
  cursor: pointer;
  left: -50%;
  top: -50%;
}

.envelope-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.envelope-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.envelope-layer.before { 
    z-index: 1; 
    transform: translateY(-144px); 
}
.envelope-layer.middle { 
    height: 80%;
    width: 100%;
    left: 0;
    top: 0%;
    z-index: 1;
    transform: translateY(20%);
}
.envelope-layer.after { z-index: 3; }

.content-clipper {
  position: absolute;
  bottom: 20px;
  left: 5%;
  width: 90%;
  height: 400%;
  overflow: hidden;
  overflow-clip-margin: 100vh 0 0 0;  /* 上方不裁切 */
  z-index: 2;
}

.content-wrapper {
  position: relative;
  top: 72%;
  width: 100%;
  height: 31%;
  transform: translateY(10%);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: all;
  /* overflow: visible; */
}

.envelope.active .content-wrapper {
  transform: translateY(-200%);
}

.content-container {
  position: absolute;
  top: 80%;  /* 紧贴背景层下方 */
  left: 0;
  width: 100%;
  height: 150%;
}

.letter {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  height: 130%;
  margin-top: -30%;
  border-radius: 10px;
}

.letter-title {
  font-size: min(3.5vw, 1.8em);
  text-align: center;
}

.letter-content {
  font-size: min(2.5vw, 1.35em);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .envelope-wrapper {
    width: 95vw;
  }
}

.friend-card {
  background: #fff;
  border-radius: 10px;
  text-align: center;
  height: 100%;
}

.friend-avatar {
  width: 100%;
  height: 100%;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-title {
  font-size: 1.5em;
  color: #333;
  margin: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  backdrop-filter: blur(5px);
}

.friend-form {
  padding: 20px;
  transform: translateY(50%);
  position: relative;
  z-index: 2;  /* 确保表单在最上层 */
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  position: relative;  /* 添加相对定位 */
  z-index: 3;  /* 确保表单项在最上层 */
}

.form-item label {
  width: 60px;
  text-align: right;
  margin-right: 10px;
  color: #666;
}

.form-item input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
}

.form-item input[readonly] {
  background: #e8f4f8;
  color: #0066cc;
  border-color: #0066cc;
  cursor: not-allowed;
}

.auto-fill-note {
  color: #0066cc;
  font-size: 11px;
  margin-top: 2px;
  display: block;
  font-style: italic;
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
}

.form-item input.error {
  border-color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
}

.error-message {
  color: #ff4444;
  font-size: 0.9em;
  margin-top: 10px;
  text-align: center;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: #7e57c2;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.friend-footer {
  text-align: center;
  margin-top: 210px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.footer-deco {
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #666, transparent);
}

.friend-footer span {
  color: #666;
  font-size: 0.9em;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .friend-card,
:root[class='dark-theme'] .letter {
  background: rgba(40, 40, 40, 0.9);
  color: #fff;
}

:root[class='dark-theme'] .form-item label {
  color: #ccc;
}

:root[class='dark-theme'] .form-item input {
  background: #333;
  border-color: #444;
  color: #fff;
}

:root[class='dark-theme'] .footer-deco {
  background: linear-gradient(90deg, transparent, #999, transparent);
}

:root[class='dark-theme'] .friend-title {
  background: rgba(255, 255, 255, 0.05);
}

.envelope-layer.after,
.envelope-layer.before {
  pointer-events: none;
}

.decoration-image {
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: auto;
  z-index: 1;
  pointer-events: none;
  margin-bottom: 20px;
}

.decoration-image img {
  width: 80%;
  height: auto;
  object-fit: contain;
  transform: scaleX(-1);  /* 水平翻转图片 */
}

/* 修改装饰猫咪的样式 */
.decoration-cat {
  position: absolute;  /* 改为absolute，相对于envelope-wrapper定位 */
  right: -50px;      /* 移到信封右侧 */
  bottom: -300px;          /* 底部对齐 */
  width: 250px;
  height: 250px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.decoration-cat.show {
  opacity: 1;
  transform: translateY(0);
}

/* 适配移动端 */
@media (max-width: 1024px) {
  .decoration-cat {
    display: none;  /* 在小屏幕上隐藏猫咪装饰 */
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .decoration-cat {
  filter: brightness(0.9);
}

/* 气泡框容器 */
.chat-bubbles {
  position: absolute;
  width: 350px;  /* 增加宽度 */
  height: auto;  /* 自适应高度 */
  left: -20px;   /* 微调位置 */
  bottom: 550px;
  display: flex;
  flex-direction: column;
  gap: 30px;     /* 减小间距 */
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.3s;
}

.chat-bubbles.show {
  opacity: 1;
  transform: translateX(0);
}

/* 气泡框基础样式 */
.bubble {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 15px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;  /* 增加最大宽度 */
  margin-right: 15px;
}

.bubble h4 {
  margin: 0 0 8px;
  color: #3498db;  /* 标题使用蓝色 */
  font-size: 15px;
}

.bubble p {
  margin: 5px 0;
  line-height: 1.4;
  font-size: 13px;
}

/* 气泡尾巴 */
.bubble::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.9);
  right: -7px;
  transform: rotate(45deg);
  box-shadow: 2px -2px 5px rgba(0, 0, 0, 0.1);
}

/* 每个气泡的位置调整 */
.bubble-1::after {
  bottom: 0;
}

.bubble-2::after {
  bottom: 50%;
  transform: translateY(50%) rotate(45deg);
}

.bubble-3::after {
  top: 0;
}

/* 气泡出现动画 */
.bubble {
  animation: bubbleFadeIn 0.4s ease-out backwards;
}

.bubble-1 { animation-delay: 0.7s; }
.bubble-2 { animation-delay: 0.9s; }
.bubble-3 { animation-delay: 1.1s; }

@keyframes bubbleFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .bubble {
  background: rgba(40, 40, 40, 0.9);
  color: #fff;
}

:root[class='dark-theme'] .bubble::after {
  background: rgba(40, 40, 40, 0.9);
}

:root[class='dark-theme'] .bubble h4 {
  color: #87CEEB;  /* 暗色主题下的标题颜色 */
}

:root[class='dark-theme'] .bubble p {
  color: rgba(255, 255, 255, 0.9);  /* 暗色主题下的文字颜色 */
}

/* 适配移动端 */
@media (max-width: 1024px) {
  .chat-bubbles {
    display: none;
  }
}
</style> 