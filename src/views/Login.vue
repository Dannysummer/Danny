<template>
  <ParticlesBackground />
  <div class="login-page">
    <div class="login-container">
      <!-- 标题和分割线 -->
      <h2 class="login-title">{{ isLogin ? '登录' : '注册' }}</h2>
      <div class="title-divider">
        <img :src="dividerImage" alt="divider" class="divider-image" />
      </div>

      <!-- 登录/注册表单 -->
      <div class="form-container">
        <div class="input-group">
          <Icon icon="material-symbols:person-outline" />
          <input 
            type="text" 
            v-model="username" 
            placeholder=" "
            @blur="validateUsername"
            :class="{ 'has-error': errors.username }"
          />
          <label>{{ isLogin ? '请输入用户名' : '设置用户名（至少3个字符）' }}</label>
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <Transition name="fade-height">
          <div class="input-group" v-show="!isLogin">
            <Icon icon="material-symbols:mail-outline" />
            <input 
              type="email" 
              v-model="email" 
              placeholder=" "
              @blur="validateEmail"
              :class="{ 'has-error': errors.email }"
            />
            <label>请输入邮箱地址</label>
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>
        </Transition>

        <div class="input-group">
          <Icon icon="material-symbols:lock-outline" />
          <input 
            type="password" 
            v-model="password" 
            placeholder=" "
            @input="checkPasswordStrength"
            @focus="handlePasswordFocus"
            @blur="() => { validatePassword(); handlePasswordBlur(); }"
          />
          <label>{{ isLogin ? '请输入密码' : '设置密码（至少8个字符，包含字母和数字）' }}</label>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          <!-- 密码强度指示器 -->
          <div class="password-strength" v-if="!isLogin && password">
            <div 
              class="strength-bar"
            >
              <div 
                class="strength-level" 
                :style="{ width: `${passwordStrength * 33.33}%` }"
                :class="strengthClass"
              ></div>
            </div>
            <span class="strength-text">{{ strengthText }}</span>
          </div>
        </div>

        <Transition name="fade-height">
          <div class="input-group" v-show="!isLogin">
            <Icon icon="material-symbols:lock-outline" />
            <input 
              type="password" 
              v-model="confirmPassword" 
              placeholder=" "
              @input="checkConfirmPasswordStrength"
              @focus="handlePasswordFocus"
              @blur="handlePasswordBlur"
              :class="{ 'has-error': errors.confirm }"
            />
            <label>确认密码</label>
            <span class="error-message" v-if="errors.confirm">{{ errors.confirm }}</span>
            <!-- 密码强度指示器 -->
            <div class="password-strength" v-if="!isLogin && confirmPassword">
              <div class="strength-bar">
                <div 
                  class="strength-level" 
                  :style="{ width: `${confirmPasswordStrength * 33.33}%` }"
                  :class="confirmStrengthClass"
                ></div>
              </div>
              <span class="strength-text">{{ confirmStrengthText }}</span>
            </div>
          </div>
        </Transition>

        <div class="input-group captcha-group" v-if="showCaptcha">
          <Icon icon="material-symbols:verified-user-outline" />
          <input 
            type="text" 
            v-model="captcha"
            placeholder=" "
            maxlength="4"
          />
          <label>请输入验证码</label>
          <div class="captcha-image" @click="refreshCaptcha">
            <canvas ref="captchaCanvas" width="100" height="40"></canvas>
          </div>
        </div>

        <div class="password-options" v-if="isLogin">
          <div class="remember-me">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              记住密码
            </label>
          </div>
          <div class="forgot-password">
            <span @click="showResetPassword = true">忘记密码？</span>
          </div>
        </div>

        <!-- 邮箱验证码只在注册时显示 -->
        <Transition name="fade-height">
          <div class="input-group" v-if="!isLogin && onEmailVerify">
            <Icon icon="material-symbols:verified-user-outline" />
            <input 
              type="text" 
              v-model="emailVerifyCode"
              placeholder=" "
              maxlength="6"
            />
            <label>请输入邮箱验证码</label>
            <button 
              class="send-code-btn" 
              @click="sendEmailVerifyCode"
              :disabled="emailCountdown > 0"
            >
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
            </button>
          </div>
        </Transition>

        <!-- 用户协议和隐私政策 -->
        <Transition name="fade-height">
          <div class="agreement" v-show="!isLogin">
            <label class="checkbox-container">
              <input type="checkbox" v-model="agreeToTerms">
              <span class="checkmark"></span>
              我已阅读并同意
              <span class="link" @click.stop="showTerms = true">用户协议</span>
              和
              <span class="link" @click.stop="showPrivacy = true">隐私政策</span>
            </label>
          </div>
        </Transition>

        <!-- 登录/注册按钮 -->
        <button class="submit-btn" @click="handleSubmit" :disabled="!isLogin && !agreeToTerms">
          {{ isLogin ? '登录' : '注册' }}
          <!-- 增加线条数量并调整间距 -->
          <template v-for="i in 80" :key="i">
            <span :style="{ top: `${(i - 1)}px`, transitionDelay: `${Math.random() * 0.75}s` }"></span>
          </template>
        </button>

        <!-- 切换登录/注册 -->
        <div class="switch-mode">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <span @click="toggleLoginMode">
            {{ isLogin ? '立即注册' : '去登录' }}
          </span>
        </div>

        <!-- 社交媒体登录 -->
        <div class="social-login" v-if="isLogin">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="social-icons">
            <button class="social-btn" @click="handleSocialLogin('wechat')">
              <Icon icon="mdi:wechat" />
            </button>
            <button class="social-btn" @click="handleSocialLogin('qq')">
              <Icon icon="mdi:qqchat" />
            </button>
            <button class="social-btn" @click="handleSocialLogin('github')">
              <Icon icon="mdi:github" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 找回密码模态框 -->
    <div class="modal" v-if="showResetPassword" @click.self="showResetPassword = false">
      <div class="modal-content">
        <h3>找回密码</h3>
        <div class="input-group">
          <Icon icon="material-symbols:mail-outline" />
          <input 
            type="email" 
            v-model="resetEmail" 
            placeholder=" "
          />
          <label>请输入注册邮箱</label>
        </div>
        
        <!-- 添加验证码输入框 -->
        <div class="input-group" v-if="showResetCode">
          <Icon icon="material-symbols:verified-user-outline" />
          <input 
            type="text" 
            v-model="resetCode"
            placeholder=" "
            maxlength="6"
          />
          <label>请输入验证码</label>
          <button 
            class="send-code-btn" 
            @click="sendResetCode"
            :disabled="resetCountdown > 0 || isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ resetCountdown > 0 ? `${resetCountdown}s` : isLoading ? '发送中...' : '获取验证码' }}
          </button>
        </div>
        
        <div class="modal-buttons">
          <button @click="handleResetPassword" class="submit-btn">
            {{ showResetCode ? '重置密码' : '下一步' }}
          </button>
          <button @click="showResetPassword = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 用户协议模态框 -->
    <div class="modal" v-if="showTerms" @click.self="showTerms = false">
      <div class="modal-content terms-modal">
        <h3>用户协议</h3>
        <div class="terms-content">
          <p>欢迎使用我们的服务！</p>
          <h4>1. 服务条款</h4>
          <p>在使用本服务之前，请仔细阅读以下条款...</p>
          <!-- 添加更多协议内容 -->
        </div>
        <button @click="showTerms = false" class="close-btn">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
    </div>

    <!-- 隐私政策模态框 -->
    <div class="modal" v-if="showPrivacy" @click.self="showPrivacy = false">
      <div class="modal-content terms-modal">
        <h3>隐私政策</h3>
        <div class="terms-content">
          <p>我们重视您的隐私！</p>
          <h4>1. 信息收集</h4>
          <p>我们收集的信息类型包括...</p>
          <!-- 添加更多隐私政策内容 -->
        </div>
        <button @click="showPrivacy = false" class="close-btn">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
    </div>

    <!-- 登录日志模态框 -->
    <div class="modal" v-if="showLoginLogs" @click.self="showLoginLogs = false">
      <div class="modal-content logs-modal">
        <h3>登录日志</h3>
        <div class="logs-content">
          <div v-for="log in userStore.loginLogs" :key="log.id" class="log-item">
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.time) }}</span>
              <span :class="['log-status', log.status]">{{ log.status === 'success' ? '成功' : '失败' }}</span>
            </div>
            <div class="log-details">
              <p><strong>用户名：</strong>{{ log.username }}</p>
              <p><strong>设备：</strong>{{ log.device }}</p>
              <p><strong>IP地址：</strong>{{ log.ip }}</p>
              <p><strong>位置：</strong>{{ log.location || '未知' }}</p>
            </div>
          </div>
        </div>
        <button @click="showLoginLogs = false" class="close-btn">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
    </div>

    <!-- 添加登录成功的问候语 -->
    <Transition name="greeting">
      <div v-if="showLoginGreeting" class="greeting-text">
        {{ loginGreeting }}
      </div>
    </Transition>

    <!-- 自定义提示框 -->
    <CustomAlert 
      v-model:show="alertConfig.show"
      :message="alertConfig.message"
      :type="alertConfig.type"
      :duration="alertConfig.duration"
    />

    <!-- 添加超级管理员选择模态框 -->
    <div class="modal" v-if="showAdminOptions" @click.self="showAdminOptions = false">
      <div class="modal-content">
        <h3>欢迎，超级管理员</h3>
        <p class="admin-welcome-text">您可以选择进入首页或管理后台</p>
        <div class="modal-buttons admin-options">
          <button @click="goToHome" class="home-btn">
            <Icon icon="mdi:home" />
            进入首页
          </button>
          <button @click="showAdminVerify = true; showAdminOptions = false" class="admin-btn">
            <Icon icon="mdi:shield-account" />
            进入管理后台
          </button>
        </div>
      </div>
    </div>

    <!-- 添加管理员邮箱验证模态框 -->
    <div class="modal" v-if="showAdminVerify" @click.self="showAdminVerify = false">
      <div class="modal-content">
        <h3>安全验证</h3>
        <p class="verify-text">为了保障您的账号安全，请进行邮箱验证</p>
        
        <div class="input-group">
          <Icon icon="material-symbols:verified-user-outline" />
          <input 
            type="text" 
            v-model="adminVerifyCode"
            placeholder=" "
            maxlength="6"
          />
          <label>请输入验证码</label>
          <button 
            class="send-code-btn" 
            @click="sendAdminVerifyCode"
            :disabled="adminVerifyCountdown > 0 || adminVerifyLoading"
          >
            <span v-if="adminVerifyLoading" class="loading-spinner"></span>
            {{ adminVerifyCountdown > 0 ? `${adminVerifyCountdown}s` : adminVerifyLoading ? '发送中...' : '获取验证码' }}
          </button>
        </div>
        
        <div class="modal-buttons">
          <button @click="verifyAdminCode" class="submit-btn" :disabled="adminVerifyLoading">
            验证并进入
          </button>
          <button @click="showAdminVerify = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useThemeStore } from '../stores/theme'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import axios from '../utils/axios'
import CustomAlert from '../components/CustomAlert.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const router = useRouter()
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const email = ref('')
const errors = ref({
  username: '',
  password: '',
  confirm: '',
  email: ''
})
const showResetPassword = ref(false)
const resetEmail = ref('')
const passwordStrength = ref(0)
const captcha = ref('')
const captchaCanvas = ref<HTMLCanvasElement | null>(null)
const captchaText = ref('')
const loginAttempts = ref(0)
const lastLoginAttempt = ref(0)
const agreeToTerms = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)
const loginBlocked = ref(false)
const blockEndTime = ref(0)
const showLoginLogs = ref(false)
const emailVerifyCode = ref('')
const emailCountdown = ref(0)
const confirmPasswordStrength = ref(0)
const blockCheckInterval = ref<number>()
const sessionCheckInterval = ref<number>()
const onEmailVerify = ref(true)
const showLoginGreeting = ref(false)
const loginGreeting = ref('')
const resetCode = ref('')
const showResetCode = ref(false)
const resetCountdown = ref(0)
const isLoading = ref(false)

// 添加管理员相关的状态
const showAdminOptions = ref(false)
const showAdminVerify = ref(false)
const adminVerifyCode = ref('')
const adminVerifyCountdown = ref(0)
const adminVerifyLoading = ref(false)

// 修改 alertConfig 的定义
const alertConfig = ref<{
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}>({
  show: false,
  message: '',
  type: 'info',
  duration: 3000
})

// 根据主题切换分割线图片
const dividerImage = computed(() => {
  return themeStore.isDarkTheme ? '/Icon/line-w.png' : '/Icon/line-b.png'
})

// 表单验证
const validateUsername = () => {
  if (!username.value) {
    errors.value.username = '请输入用户名'
  } else if (username.value.length < 3) {
    errors.value.username = '用户名长度不能少于3个字符'
  } else if (!/^[a-zA-Z0-9_-]{3,16}$/.test(username.value)) {
    errors.value.username = '用户名只能包含字母、数字、下划线和连字符'
  } else {
    errors.value.username = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = '请输入密码'
    return false
  }
  
  // 只在注册时验证密码格式
  if (!isLogin.value) {
    if (password.value.length < 8) {
      errors.value.password = '密码长度不能少于8个字符'
      return false
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};:'",.<>/?]+$/.test(password.value)) {
      errors.value.password = '密码必须包含字母和数字'
      return false
    }
  }
  
  errors.value.password = ''
  return true
}

const validateEmail = () => {
  if (!email.value && !isLogin.value) {
    errors.value.email = '请输入邮箱地址'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址'
  } else {
    errors.value.email = ''
  }
}

const validateForm = () => {
  validateUsername()
  validatePassword()
  if (!isLogin.value) {
    validateEmail()
    validateConfirmPassword()
    if (password.value !== confirmPassword.value) {
      errors.value.confirm = '两次输入的密码不一致'
      return false
    }
    // 只在启用邮箱验证时检查验证码
    if (onEmailVerify.value && !emailVerifyCode.value) {
      showAlert('请输入邮箱验证码', 'warning')
      return false
    }
  }
  return !errors.value.username && !errors.value.password && !errors.value.confirm 
    && (isLogin.value || !errors.value.email)
}

// 生成验证码
const generateCaptcha = () => {
  const canvas = captchaCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 设置背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 生成4位验证码
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  
  for (let i = 0; i < 4; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)]
    code += char
    
    // 随机颜色
    const hue = Math.random() * 360
    ctx.fillStyle = `hsl(${hue}, 70%, 70%)`
    
    // 随机字体大小和旋转
    const fontSize = 24 + Math.random() * 8
    const rotation = (Math.random() - 0.5) * 0.3
    
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textBaseline = 'middle'
    
    // 绘制文字
    ctx.save()
    ctx.translate(20 * i + 15, 20)
    ctx.rotate(rotation)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }
  
  // 保存验证码文本
  captchaText.value = code
}

// 刷新验证码
const refreshCaptcha = () => {
  captcha.value = '' // 清空输入框
  generateCaptcha()
}

// 处理社交媒体登录
const handleSocialLogin = (platform: string) => {
  // TODO: 实现社交媒体登录
  console.log(`使用 ${platform} 登录`)
}

// 密码强度检测
const checkPasswordStrength = () => {
  let strength = 0
  const pwd = password.value
  
  if (pwd.length >= 8) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>/?]/.test(pwd)) strength++ // 添加标点符号检测
  
  passwordStrength.value = Math.min(3, strength)
}

// 密码强度相关的计算属性
const strengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return 'weak'
  if (strength === 1) return 'medium'
  if (strength === 2) return 'strong'
  return 'very-strong'
})

const strengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return '弱'
  if (strength === 1) return '中'
  if (strength === 2) return '强'
  return '非常强'
})

// 定义接口类型
interface LoginData {
  username: string
  password: string
  rememberMe: boolean
  captcha?: string // 可选的验证码
}

// interface RegisterData {
//   username: string
//   password: string
//   email: string
//   emailVerifyCode: string
// }

// 修改 handleSubmit 方法
const handleSubmit = async () => {
  if (!validateForm()) {
    showAlert('请完善所有必填信息并确保输入正确', 'warning')
    return
  }

  // 检查是否同意协议
  if (!isLogin.value && !agreeToTerms.value) {
    showAlert('请阅读并同意用户协议和隐私政策', 'warning')
    return
  }

  // 只在登录时检查图片验证码
  if (isLogin.value && showCaptcha.value) {
    if (!captcha.value) {
      showAlert('请输入图片验证码', 'warning')
      return
    }
    if (captcha.value.toLowerCase() !== captchaText.value.toLowerCase()) {
      showAlert('图片验证码错误', 'error')
      refreshCaptcha()
      return
    }
  }

  // 检查登录频率限制
  if (isLogin.value) {
    const now = Date.now()
    if (loginBlocked.value && now < blockEndTime.value) {
      const remainingMinutes = Math.ceil((blockEndTime.value - now) / 60000)
      showAlert(`账号已被临时封禁，请在 ${remainingMinutes} 分钟后重试`, 'error')
      return
    }

    if (loginAttempts.value >= 5 && now - lastLoginAttempt.value < 15 * 60 * 1000) {
      loginBlocked.value = true
      blockEndTime.value = now + 15 * 60 * 1000
      showAlert('登录尝试次数过多，账号已被临时封禁15分钟', 'error')
      return
    }
  }
  
  try {
    if (isLogin.value) {
      // 登录请求数据
      const loginData: LoginData = {
        username: username.value,
        password: password.value,
        rememberMe: rememberMe.value
      }
      
      // 如果需要验证码，添加到请求数据中
      if (showCaptcha.value) {
        loginData.captcha = captcha.value
      }

      // 发送登录请求
      const response = await axios.post('/api/auth/login', loginData)
      
      if (response.data.success) {
        // 设置问候语
        loginGreeting.value = '登录成功！欢迎回来~'
        
        // 获取用户角色 - 修正从正确的位置获取
        const userRole = response.data.data?.role || 'user'
        
        // 更新用户信息到 store
        userStore.userInfo = {
          username: username.value,
          avatar: response.data.data?.avatar || '/avatars/default-avatar.png',
          role: userRole,
          email: response.data.data?.email || ''  // 保存邮箱以便后续验证
        }
        
        // 设置登录状态
        userStore.isLoggedIn = true
        
        if (rememberMe.value) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            username: username.value,
            savedTime: Date.now()
          }))
        }
        
        loginAttempts.value = 0
        showAlert('登录成功，欢迎回来！', 'success')
        
        // 检查是否为超级管理员
        if (userRole === 'superAdmin') {
          // 显示选项模态框
          showAdminOptions.value = true
        } else {
          // 普通用户登录成功后的处理
          // 显示问候语
          setTimeout(() => {
            showLoginGreeting.value = true
            
            // 2秒后隐藏问候语并跳转
            setTimeout(() => {
              showLoginGreeting.value = false
              router.push('/')
            }, 2000)
          }, 100)
        }
      } else {
        if (response.data.status === 401) {
          // 密码错误时显示密码规则提示
          showAlert('密码错误！密码应包含：\n1. 至少8个字符\n2. 包含字母和数字\n3. 可以包含特殊字符', 'error')
        } else {
          throw new Error(response.data.message || '登录失败')
        }
      }
      
    } else {
      // 注册逻辑
      const response = await fetch('http://localhost:8088/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
          email: email.value,
          emailVerifyCode: emailVerifyCode.value
        })
      })

      const data = await response.json()
      if (data.success) {
        showAlert('注册成功！正在为您自动登录...', 'success')
        
        // 保存注册的用户名和密码
        const registeredUsername = username.value
        const registeredPassword = password.value
        
        // 清空表单
        email.value = ''
        emailVerifyCode.value = ''
        
        // 切换到登录模式
        isLogin.value = true
        
        // 自动填充用户名和密码
        nextTick(() => {
          username.value = registeredUsername
          password.value = registeredPassword
          // 生成新的验证码
          generateCaptcha()
        })
      } else {
        throw new Error(data.message || '注册失败')
      }
    }
  } catch (error: any) {
    console.error('操作失败:', error)
    if (error.message === 'Failed to fetch') {
      showAlert('连接服务器失败，请检查网络连接', 'error')
    } else {
      showAlert(error.message || '操作失败，请重试', 'error')
    }
  }
}

// 修改发送邮箱验证码方法
const sendEmailVerifyCode = async () => {
  if (!email.value || errors.value.email) {
    showAlert('请输入有效的邮箱地址', 'warning')
    return
  }
  
  try {
    const response = await fetch('http://localhost:8088/api/auth/send-email-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.value 
      })
    })
    
    const data = await response.json()
    if (data.success) {
      emailCountdown.value = 60
      const timer = setInterval(() => {
        emailCountdown.value--
        if (emailCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      showAlert('验证码已发送到您的邮箱')
    } else {
      throw new Error(data.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    showAlert(error.message || '发送验证码失败，请重试', 'error')
  }
}

// 修改发送重置密码验证码方法
const sendResetCode = async () => {
  if (!resetEmail.value) {
    showAlert('请输入邮箱地址', 'warning')
    return
  }

  if (isLoading.value) return // 防止重复点击

  isLoading.value = true
  showResetCode.value = true
  resetCountdown.value = 60
  
  // 启动倒计时
  const timer = setInterval(() => {
    resetCountdown.value--
    if (resetCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  try {
    // 异步发送请求
    const response = await fetch('http://localhost:8088/api/auth/send-email-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: resetEmail.value
      })
    })

    const data = await response.json()
    if (data.success) {
      showAlert('验证码已发送到您的邮箱')
    } else {
      throw new Error(data.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    showAlert(error.message || '发送验证码失败，请重试', 'error')
    // 发送失败时重置倒计时
    resetCountdown.value = 0
    clearInterval(timer)
  } finally {
    isLoading.value = false
  }
}

// 修改重置密码方法
const handleResetPassword = async () => {
  if (!resetEmail.value) {
    showAlert('请输入邮箱地址', 'warning')
    return
  }

  if (!showResetCode.value) {
    // 第一步：发送验证码
    await sendResetCode()
    return
  }

  if (!resetCode.value) {
    showAlert('请输入验证码', 'warning')
    return
  }

  try {
    const response = await fetch('http://localhost:8088/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: resetEmail.value,
        code: resetCode.value
      })
    })

    const data = await response.json()
    if (data.success) {
      showAlert('密码重置成功，新密码已发送到您的邮箱')
      showResetPassword.value = false
      // 清空表单
      resetEmail.value = ''
      resetCode.value = ''
      showResetCode.value = false
    } else {
      throw new Error(data.message || '重置密码失败')
    }
  } catch (error: any) {
    showAlert(error.message || '重置密码失败，请重试', 'error')
  }
}

// 关闭模态框时重置状态
watch(showResetPassword, (newVal) => {
  if (!newVal) {
    resetEmail.value = ''
    resetCode.value = ''
    showResetCode.value = false
    resetCountdown.value = 0
  }
})

// 计算是否显示验证码
const showCaptcha = computed(() => {
  // 只在登录时且需要验证码时显示
  return isLogin.value && userStore.needCaptcha(username.value)
})

// 定时检查并解除封禁
const checkBlockStatus = () => {
  if (loginBlocked.value && Date.now() >= blockEndTime.value) {
    loginBlocked.value = false
    blockEndTime.value = 0
    loginAttempts.value = 0
  }
}

// 定期检查会话状态
const checkSessionStatus = () => {
  if (userStore.isLoggedIn && !userStore.checkSession()) {
    userStore.logout()
    showAlert('会话已过期，请重新登录', 'error')
    router.push('/login')
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 监听用户名变化，决定是否显示验证码
watch(username, (newValue) => {
  // 只在手动输入用户名且需要验证码时刷新
  if (isLogin.value && userStore.needCaptcha(newValue) && !rememberMe.value) {
    refreshCaptcha()
  }
})

// 初始化记住的用户信息
onMounted(() => {
  // 立即生成验证码
  generateCaptcha()
  
  // 检查是否有记住的用户信息
  const rememberedUserStr = localStorage.getItem('rememberedUser')
  if (rememberedUserStr) {
    try {
      const rememberedUser = JSON.parse(rememberedUserStr)
      username.value = rememberedUser.username
      password.value = rememberedUser.password
      rememberMe.value = true
    } catch (e) {
      console.error('解析记住的用户信息失败:', e)
    }
  }

  blockCheckInterval.value = window.setInterval(checkBlockStatus, 60000)
  sessionCheckInterval.value = window.setInterval(checkSessionStatus, 60000)

  // 添加活动检测
  document.addEventListener('mousemove', userStore.refreshSession)
  document.addEventListener('keypress', userStore.refreshSession)

  onUnmounted(() => {
    if (blockCheckInterval.value) clearInterval(blockCheckInterval.value)
    if (sessionCheckInterval.value) clearInterval(sessionCheckInterval.value)
    document.removeEventListener('mousemove', userStore.refreshSession)
    document.removeEventListener('keypress', userStore.refreshSession)
  })
})

// 切换登录/注册时重置验证码
const toggleLoginMode = () => {
  isLogin.value = !isLogin.value
  // 切换到登录模式时重新生成验证码
  if (isLogin.value) {
    generateCaptcha()
  }
}

// 在现有的 checkPasswordStrength 函数后添加新函数
const checkConfirmPasswordStrength = () => {
  let strength = 0
  const pwd = confirmPassword.value
  
  if (pwd.length >= 8) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>/?]/.test(pwd)) strength++
  
  confirmPasswordStrength.value = Math.min(3, strength)
  
  // 添加实时验证
  validateConfirmPassword()
}

// 添加新的计算属性
const confirmStrengthClass = computed(() => {
  const strength = confirmPasswordStrength.value
  if (strength === 0) return 'weak'
  if (strength === 1) return 'medium'
  if (strength === 2) return 'strong'
  return 'very-strong'
})

const confirmStrengthText = computed(() => {
  const strength = confirmPasswordStrength.value
  if (strength === 0) return '弱'
  if (strength === 1) return '中'
  if (strength === 2) return '强'
  return '非常强'
})

// 添加确认密码验证函数
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirm = '请确认密码'
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirm = '两次输入的密码不一致'
  } else {
    errors.value.confirm = ''
  }
}

// 在 password 的 watch 中添加确认密码验证
watch(password, () => {
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
})

// 添加密码框焦点处理函数
const handlePasswordFocus = () => {
  // 触发一个自定义事件，确保 live2d 模型能捕获到
  const event = new Event('focusin', { bubbles: true });
  document.activeElement?.dispatchEvent(event);
}

// 修改密码框焦点处理函数
const handlePasswordBlur = () => {
  const event = new Event('focusout', { bubbles: true });
  document.activeElement?.dispatchEvent(event);
}

// 在 script setup 中添加显示提示的方法
const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  alertConfig.value = {
    show: true,
    message,
    type,
    duration: 3000
  }
}

// 进入首页
const goToHome = () => {
  showAdminOptions.value = false
  
  // 显示问候语
  setTimeout(() => {
    showLoginGreeting.value = true
    
    // 2秒后隐藏问候语并跳转
    setTimeout(() => {
      showLoginGreeting.value = false
      router.push('/')
    }, 2000)
  }, 100)
}

// 发送管理员验证码
const sendAdminVerifyCode = async () => {
  try {
    adminVerifyLoading.value = true
    
    // 获取用户的邮箱
    const userEmail = userStore.userInfo?.email
    
    if (!userEmail) {
      // 如果没有邮箱，从后端获取
      const response = await fetch('http://localhost:8088/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      })
      
      const data = await response.json()
      if (!data.success || !data.data.email) {
        throw new Error('无法获取您的邮箱信息')
      }
    }
    
    // 发送验证码 - 使用正确的邮件验证码接口
    const response = await fetch('http://localhost:8088/api/auth/send-email-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userStore.userInfo?.email,
        type: 'admin_verify'  // 指定验证类型为管理员验证
      })
    })
    
    const data = await response.json()
    if (data.success) {
      showAlert('验证码已发送到您的邮箱', 'info')
      
      // 开始倒计时
      adminVerifyCountdown.value = 60
      const timer = setInterval(() => {
        adminVerifyCountdown.value--
        if (adminVerifyCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      throw new Error(data.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    showAlert(error.message || '发送验证码失败，请重试', 'error')
  } finally {
    adminVerifyLoading.value = false
  }
}

// 验证管理员验证码
const verifyAdminCode = async () => {
  if (!adminVerifyCode.value) {
    showAlert('请输入验证码', 'warning')
    return
  }
  
  try {
    adminVerifyLoading.value = true
    
    const response = await fetch('http://localhost:8088/api/auth/verify-email-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userStore.userInfo?.email,
        code: adminVerifyCode.value,
        type: 'admin_verify'  // 指定验证类型为管理员验证
      })
    })
    
    const data = await response.json()
    if (data.success) {
      showAlert('验证成功，正在进入管理后台...', 'success')
      
      // 关闭模态框
      showAdminVerify.value = false
      
      // 延迟跳转
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } else {
      throw new Error(data.message || '验证失败')
    }
  } catch (error: any) {
    console.error('验证失败:', error)
    showAlert(error.message || '验证失败，请重试', 'error')
  } finally {
    adminVerifyLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/background/login-bg1.jpg') no-repeat center center;
  background-size: cover;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.login-container {
  position: relative;
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.5s ease;
}

.login-title {
  font-size: 2rem;
  color: #fff;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

.title-divider {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0 20px;
}

.divider-image {
  width: 90%;
  height: 20px;
  object-fit: contain;
  opacity: 0.8;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.5s ease;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.input-group input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.5s ease;
}

.input-group .iconify {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  z-index: 1;
}

.submit-btn {
  position: relative;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
  color: #87CEEB;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  overflow: hidden;
  transition: 0.5s;
  transition-delay: 0.5s;
}

.submit-btn:hover:not(:disabled) {
  color: #363a3b;
  filter: drop-shadow(0 0 10px #87CEEB) drop-shadow(0 0 30px #87CEEB);
  transform: translateY(-2px);
}

.submit-btn span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px; /* 减小线条高度使其更细腻 */
  background-color: #87CEEB;
  z-index: -1;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s ease-in-out;
}

.submit-btn:hover:not(:disabled) span {
  transform: scaleX(1);
  transform-origin: left;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.2);
}

/* 适配暗色主题 */
.dark-theme .submit-btn {
  background: rgba(0, 0, 0, 0.2);
}

.dark-theme .submit-btn:hover:not(:disabled) {
  color: #1a1a1a;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .submit-btn {
    height: 45px;
    font-size: 1rem;
  }
}

.switch-mode {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-top: 15px;
}

.switch-mode span {
  color: #87CEEB;
  cursor: pointer;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.switch-mode span:hover {
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}

/* 暗色主题适配 */
.dark-theme .login-container {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(135, 206, 235, 0.15);
}

.dark-theme .input-group input {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(135, 206, 235, 0.2);
}

.dark-theme .input-group input:focus {
  border-color: rgba(135, 206, 235, 0.4);
  box-shadow: 0 0 20px rgba(135, 206, 235, 0.15);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-container {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 1.8rem;
  }

  .title-divider {
    height: 15px;
    margin: 15px 0 25px;
  }

  .divider-image {
    height: 15px;
  }

  .input-group input {
    padding: 10px 10px 10px 35px;
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 10px;
    font-size: 1rem;
  }
}

.error-message {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #87d9ff;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 2;
}

.remember-me {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: relative;
  height: 18px;
  width: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-right: 8px;
}

.checkbox-container input:checked ~ .checkmark:after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #87CEEB;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 密码强度指示器样式 */
.password-strength {
  position: absolute;
  bottom: -38px;
  left: 0;
  width: 100%;
  margin: 15px 0;
}

.strength-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-level {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-level.weak { background: #ff4d4f; }
.strength-level.medium { background: #faad14; }
.strength-level.strong { background: #52c41a; }
.strength-level.very-strong { background: #13c2c2; }

.strength-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  display: block;
}

/* 密码选项容器样式 */
.password-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 10px 0;
}

.forgot-password {
  text-align: right;
}

.forgot-password span {
  color: #87CEEB;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.forgot-password span:hover {
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 验证码样式 */
.captcha-group {
  position: relative;
}

.captcha-image {
  position: absolute;
  right: 10px;
  top: 55%;
  transform: translateY(-50%);
  cursor: pointer;
}

.captcha-image canvas {
  border-radius: 5px;
}

/* 社交媒体登录样式 */
.social-login {
  margin-top: 15px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin: 15px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.divider span {
  padding: 0 10px;
  font-size: 0.9rem;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 暗色主题适配 */
.dark-theme .social-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .social-btn:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* 用户协议样式 */
.agreement {
  margin: 10px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
 
.agreement .link {
  color: #87CEEB;
  cursor: pointer;
  transition: all 0.3s ease;
}
 
.agreement .link:hover {
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
}
 
/* 协议模态框样式 */
.terms-modal {
  max-height: 80vh;
  overflow-y: auto;
}
 
.terms-content {
  color: #fff;
  line-height: 1.6;
  margin: 20px 0;
}
 
.terms-content h4 {
  margin: 15px 0 10px;
  color: #87CEEB;
}
 
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}
 
.close-btn:hover {
  transform: rotate(90deg);
}
 
/* 禁用按钮样式 */
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 日志模态框样式 */
.logs-modal {
  width: 90%;
  max-width: 600px;
}

.logs-content {
  max-height: 60vh;
  overflow-y: auto;
}

.log-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.log-time {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.log-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.log-status.success {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.log-status.failed {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.log-details {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.log-details p {
  margin: 5px 0;
}

/* 统一所有输入框样式 */
.input-group input,
.modal-content input,
.captcha-group input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input::placeholder,
.modal-content input::placeholder,
.captcha-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* 只在获得焦点时改变样式,而不是在有值时改变 */
.input-group input:focus,
.modal-content input:focus,
.captcha-group input:focus {
  outline: none;
  border-color: rgba(135, 206, 235, 0.5);
  box-shadow: 0 0 15px rgba(135, 206, 235, 0.2);
}

/* 暗色主题适配 */
.dark-theme .input-group input,
.dark-theme .modal-content input,
.dark-theme .captcha-group input {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(135, 206, 235, 0.2);
}

/* 暗色主题下也只在获得焦点时改变样式 */
.dark-theme .input-group input:focus,
.dark-theme .modal-content input:focus,
.dark-theme .captcha-group input:focus {
  border-color: rgba(135, 206, 235, 0.4);
  box-shadow: 0 0 20px rgba(135, 206, 235, 0.15);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .input-group input,
  .modal-content input,
  .captcha-group input {
    padding: 10px 10px 10px 35px;
    font-size: 0.9rem;
  }
}

/* 在 style 中添加邮箱验证码相关样式 */
.email-verify {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.send-code-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background: rgba(135, 206, 235, 0.8);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-code-btn:not(:disabled):hover {
  background: rgba(135, 206, 235, 0.9);
}

/* 覆盖浏览器自动填充样式 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-text-fill-color: #fff !important;
  -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.dark-theme input:-webkit-autofill,
.dark-theme input:-webkit-autofill:hover,
.dark-theme input:-webkit-autofill:focus,
.dark-theme input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgba(0, 0, 0, 0.3) inset !important;
}

/* 添加浮动标签样式 */
.input-group {
  position: relative;
}

.input-group label {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  transition: all 0.3s ease;
  pointer-events: none;
  padding: 0 4px;
}

.input-group input:focus ~ label,
.input-group input:not(:placeholder-shown) ~ label {
  top: 0;
  font-size: 0.8rem;
  transform: translateY(-10px);
  color: #87CEEB;
  background: transparent;
  left: 10px;
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.8);
  text-align: left;
  padding: 0;
}

/* 确保输入框文本不会与图标重叠 */
.input-group input {
  padding-left: 40px;
}

/* 移除原有的 placeholder */
.input-group input::placeholder {
  color: transparent;
}

/* 为所有可能显示/隐藏的元素添加过渡效果 */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

/* 元素进入时的动画 */
.input-group-enter-active,
.input-group-leave-active {
  transition: all 0.5s ease;
}

.input-group-enter-from,
.input-group-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 修改登录标题的过渡效果 */
.login-title {
  font-size: 2rem;
  color: #fff;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

/* 使用 v-show 替代 v-if 来实现平滑过渡 */
.fade-height-enter-active,
.fade-height-leave-active {
  transition: all 0.5s ease;
  max-height: 500px;
  opacity: 1;
}

.fade-height-enter-from,
.fade-height-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 当有错误提示时，调整输入框右侧内边距 */
.input-group input.has-error {
  padding-right: 120px;
}

/* 添加问候语样式 */
.greeting-text {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  padding: 12px 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* 问候语动画 */
.greeting-enter-active {
  animation: greetingIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.greeting-leave-active {
  animation: greetingOut 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes greetingIn {
  from {
    transform: translate(-50%, -150%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes greetingOut {
  from {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -150%);
    opacity: 0;
  }
}

/* 添加加载动画样式 */
.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 修改发送验证码按钮样式 */
.send-code-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background: rgba(135, 206, 235, 0.8);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px; /* 防止按钮宽度变化 */
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-code-btn:not(:disabled):hover {
  background: rgba(135, 206, 235, 0.9);
}

/* 添加管理员选项模态框样式 */
.admin-welcome-text {
  color: #fff;
  text-align: center;
  margin: 15px 0;
}

.admin-options {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.home-btn,
.admin-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-btn {
  background: #4caf50;
}

.home-btn:hover {
  background: #388e3c;
  transform: translateY(-2px);
}

.admin-btn {
  background: #ff9800;
}

.admin-btn:hover {
  background: #f57c00;
  transform: translateY(-2px);
}

.verify-text {
  color: #fff;
  text-align: center;
  margin: 15px 0 20px;
}

/* 调整模态框样式 */
.modal-content {
  max-width: 450px;
}
</style> 