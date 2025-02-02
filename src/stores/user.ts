import { defineStore } from 'pinia'
import { ref } from 'vue'

// 修改接口定义
interface UserInfo {
  username: string
  avatar?: string
  lastLoginTime?: number
  token?: string
  role?: 'user' | 'admin' | 'super_admin'
  permissions?: string[]
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  
  // 添加登录状态提示
  const loginMessage = ref('')
  const loginStatus = ref<'success' | 'error' | ''>('')

  const autoLogin = ref(false)
  const sessionTimeout = 24 * 60 * 60 * 1000 // 24小时会话超时

  // 模拟用户数据库
  const users = ref(new Map())

  const tokenRefreshInterval = 30 * 60 * 1000 // 30分钟刷新一次token
  const maxDevices = 3 // 最大允许登录设备数
  const loginLogs = ref<{
    id: number
    username: string
    time: number
    device: string
    ip: string
    status: 'success' | 'failed'
    reason?: string
    location?: string
  }[]>([])

  const LOGIN_INTERVAL_DAYS = 15 // 登录间隔天数
  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

  // 添加超级管理员账号信息
  const SUPER_ADMIN = {
    username: 'superMe',
    password: '123456aaa',
    role: 'super_admin' as const,
    avatar: '/avatars/default.png',
    permissions: ['all']
  }

  // 获取设备信息
  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    const device = {
      browser: ua.match(/(?:Chrome|Firefox|Safari|Edge|IE)\/?\s*(\d+)/)?.[0] || 'Unknown Browser',
      os: ua.match(/(?:Windows|Mac|Linux|Android|iOS)/)?.[0] || 'Unknown OS',
      deviceType: /Mobile|Tablet|Android|iOS/.test(ua) ? 'Mobile' : 'Desktop'
    }
    return `${device.deviceType} - ${device.os} - ${device.browser}`
  }

  // 获取IP地址（模拟）
  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'Unknown IP'
    }
  }

  // 登录方法
  const login = async (username: string, password: string, remember: boolean = false) => {
    try {
      // 首先检查是否是超级管理员登录
      if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
        // 设置用户信息
        userInfo.value = {
          username: SUPER_ADMIN.username,
          avatar: SUPER_ADMIN.avatar,
          role: SUPER_ADMIN.role,
          permissions: SUPER_ADMIN.permissions,
          lastLoginTime: Date.now(),
          token: generateToken()
        }
        isLoggedIn.value = true
        
        // 存储登录状态
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        localStorage.setItem('isLoggedIn', 'true')
        
        // 设置成功提示
        loginStatus.value = 'success'
        loginMessage.value = '欢迎大领主回家！'
        
        // 启动token刷新
        startTokenRefresh()
        
        return {
          success: true,
          message: '欢迎大领主回家！'
        }
      }

      // 普通用户登录逻辑
      const user = users.value.get(username)
      if (!user) {
        loginStatus.value = 'error'
        loginMessage.value = '用户不存在'
        await logLogin(username, 'failed', '用户不存在')
        throw new Error('用户不存在')
      }

      if (user.password !== password) {
        loginStatus.value = 'error'
        loginMessage.value = '密码错误'
        await logLogin(username, 'failed', '密码错误')
        throw new Error('密码错误')
      }
      
      // 检查设备数量限制（普通用户）
      const userDevices = loginLogs.value
        .filter(log => log.username === username && log.status === 'success')
        .slice(-maxDevices)
      if (userDevices.length >= maxDevices) {
        loginStatus.value = 'error'
        loginMessage.value = `已达到最大设备登录数量限制(${maxDevices})`
        throw new Error(`已达到最大设备登录数量限制(${maxDevices})`)
      }
      
      isLoggedIn.value = true
      const token = generateToken()
      userInfo.value = {
        username,
        avatar: user.avatar || '/avatars/default.jpg',
        lastLoginTime: Date.now(),
        token
      }
      
      // 记录登录日志
      await logLogin(username, 'success')
      
      // 启动token刷新定时器
      startTokenRefresh()
      
      // 保存登录状态和自动登录设置
      if (remember) {
        autoLogin.value = true
        localStorage.setItem('autoLogin', 'true')
        localStorage.setItem('rememberedUser', JSON.stringify({
          username,
          password,
          savedTime: Date.now()
        }))
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      localStorage.setItem('token', token)
      loginStatus.value = 'success'
      loginMessage.value = '登录成功！'
      return {
        success: true,
        message: '登录成功！'
      }
    } catch (error) {
      return {
        success: false,
        message: loginMessage.value || '登录失败，请检查用户名和密码'
      }
    }
  }

  // 生成随机token
  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // 检查会话是否过期
  const checkSession = () => {
    if (!userInfo.value?.lastLoginTime) return false
    const now = Date.now()
    const lastLogin = userInfo.value.lastLoginTime
    return now - lastLogin < sessionTimeout
  }

  // 刷新会话
  const refreshSession = () => {
    if (userInfo.value) {
      userInfo.value.lastLoginTime = Date.now()
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  // 注册方法
  const register = (username: string, password: string, email: string) => {
    if (users.value.has(username)) {
      throw new Error('该用户名已被注册，请更换其他用户名')
    }
    
    users.value.set(username, {
      password,
      email,
      avatar: '/avatars/default.jpg'
    })
    return true
  }

  // 登出方法
  const logout = () => {
    isLoggedIn.value = false
    userInfo.value = null
    autoLogin.value = false
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    localStorage.removeItem('autoLogin')
    clearInterval(tokenRefreshTimer)
  }

  // 初始化用户状态
  const initUserState = () => {
    const savedUser = localStorage.getItem('userInfo')
    const savedToken = localStorage.getItem('token')
    const savedAutoLogin = localStorage.getItem('autoLogin')

    if (savedUser && savedToken) {
      userInfo.value = JSON.parse(savedUser)
      // 检查会话是否过期
      if (!checkSession()) {
        logout()
        return
      }
      // 如果设置了自动登录，刷新会话
      if (savedAutoLogin === 'true') {
        autoLogin.value = true
        refreshSession()
      }
      isLoggedIn.value = true
    }
    
    const savedLogs = localStorage.getItem('loginLogs')
    if (savedLogs) {
      loginLogs.value = JSON.parse(savedLogs)
    }
    
    if (isLoggedIn.value) {
      startTokenRefresh()
    }
  }

  // 记录登录日志
  const logLogin = async (username: string, status: 'success' | 'failed', reason?: string) => {
    const ip = await getIpAddress()
    const device = getDeviceInfo()
    loginLogs.value.push({
      id: Date.now(),
      username,
      time: Date.now(),
      device,
      ip,
      status,
      reason,
      location: await getLocation(ip)
    })
    
    // 保存日志到本地存储
    localStorage.setItem('loginLogs', JSON.stringify(loginLogs.value))
  }

  // 获取地理位置（模拟）
  const getLocation = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()
      return `${data.city}, ${data.country_name}`
    } catch {
      return 'Unknown Location'
    }
  }

  // Token刷新机制
  let tokenRefreshTimer: number
  
  const startTokenRefresh = () => {
    clearInterval(tokenRefreshTimer)
    tokenRefreshTimer = setInterval(() => {
      if (isLoggedIn.value && userInfo.value) {
        const newToken = generateToken()
        userInfo.value.token = newToken
        localStorage.setItem('token', newToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    }, tokenRefreshInterval)
  }

  // 检查是否需要验证码
  const needCaptcha = (username: string) => {
    if (username === SUPER_ADMIN.username) return false
    
    const userLogins = loginLogs.value
      .filter(log => log.username === username && log.status === 'success')
    // 如果没有登录记录，说明是首次登录，需要验证码
    if (userLogins.length === 0) return true
    
    const lastSuccessLogin = userLogins.sort((a, b) => b.time - a.time)[0]
    const daysSinceLastLogin = (Date.now() - lastSuccessLogin.time) / MILLISECONDS_PER_DAY
    // 如果超过15天，清除记住的密码信息
    if (daysSinceLastLogin >= LOGIN_INTERVAL_DAYS) {
      localStorage.removeItem('rememberedUser')
      return true
    }
    
    return false
  }

  // 添加清除登录消息的方法
  const clearLoginMessage = () => {
    loginMessage.value = ''
    loginStatus.value = ''
  }

  return {
    isLoggedIn,
    userInfo,
    autoLogin,
    login,
    register,
    logout,
    initUserState,
    checkSession,
    refreshSession,
    loginLogs,
    maxDevices,
    needCaptcha,
    loginMessage,
    loginStatus,
    clearLoginMessage
  }
}) 