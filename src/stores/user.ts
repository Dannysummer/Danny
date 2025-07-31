import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '../config/index'

// 修改接口定义
interface UserInfo {
  username: string
  email?: string
  bio?: string
  avatar?: string
  role?: 'user' | 'admin' | 'super_admin'
  lastLoginTime?: number
  registrationTime?: number
  permissions?: string[]
  emailVerified?: boolean
  token?: string
  id?: string | number
  createTime?: string | number // 添加createTime字段
  userRank?: string
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false) // 添加loading状态
  const errorMessage = ref('') // 添加错误信息
  
  // 添加用户排名
  const userRank = ref<string>('0')
  
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
    password: '51738088',
    role: 'super_admin' as const,
    avatar: '/avatars/default.png',
    permissions: ['all']
  }

  // API基础路径
  const baseUrl = config.api.apiUrl

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
      
      // 初始化用户排名信息
      initUserRank()
      
      // 如果用户已登录且没有排名，尝试获取排名信息
      if (userRank.value === '0' || !userInfo.value?.userRank) {
        // 延迟执行，避免应用启动时立即发送请求
        setTimeout(() => {
          fetchUserRank().then(result => {
            console.log('自动获取用户排名结果:', result.success ? '成功' : '失败');
          }).catch(err => {
            console.error('自动获取用户排名出错:', err);
          });
        }, 500); // 500ms延迟
      }
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
  let tokenRefreshTimer: ReturnType<typeof setInterval>
  
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

  // ======= 新增用户资料相关API方法 =======

  // 从API获取用户信息
  const fetchUserProfile = async () => {
    if (!isLoggedIn.value) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const response = await axios.get(`${baseUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      })
      
      if (response.data.success) {
        const userData = response.data.data
        
        // 更新用户信息
        userInfo.value = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          role: userData.role,
          createTime: userData.createTime,
          userRank: userData.rank?.toString() || userRank.value || '0' // 从响应中获取排名或使用现有排名
        }
        
        // 如果API中返回了排名，同步更新userRank
        if (userData.rank) {
          userRank.value = userData.rank.toString()
          localStorage.setItem('userRank', userRank.value)
          console.log('从用户资料获取到排名:', userRank.value)
        } else if (!userRank.value || userRank.value === '0') {
          // 如果没有获取到排名，则尝试专门获取排名
          setTimeout(() => {
            fetchUserRank().catch(err => console.error('获取排名失败:', err))
          }, 100)
        }
        
        // 更新本地存储
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        
        return {
          success: true,
          data: userData
        }
      } else {
        throw new Error(response.data.message || '获取用户信息失败')
      }
    } catch (error: any) {
      errorMessage.value = error.message || '获取用户信息失败'
      console.error('获取用户信息失败:', error)
      
      // 从本地存储恢复用户信息
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          userInfo.value = JSON.parse(storedUserInfo)
          // 确保从本地存储中同步用户排名
          if (userInfo.value && userInfo.value.userRank) {
            userRank.value = userInfo.value.userRank
          }
        } catch (e) {
          console.error('解析本地用户信息失败:', e)
        }
      }
      
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户头像
  const updateAvatar = async (file: File) => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      // 第1步: 上传图片文件 - 使用FormData对象
      const formData = new FormData()
      formData.append('file', file)
      
      // 上传图片获取URL
      const uploadResponse = await axios.post(`${baseUrl}/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })
      
      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || '图片上传失败')
      }
      
      const imageUrl = uploadResponse.data.data.url
      
      // 第2步: 更新用户头像
      const updateResponse = await axios.post(`${baseUrl}/user/update-avatar`, {
        avatarUrl: imageUrl
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      if (!updateResponse.data.success) {
        throw new Error(updateResponse.data.message || '头像更新失败')
      }
      
      // 更新本地用户信息
      if (userInfo.value) {
        userInfo.value.avatar = imageUrl
        // 保存到本地存储
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
      
      return {
        success: true,
        data: imageUrl
      }
    } catch (error: any) {
      errorMessage.value = error.message || '头像更新失败'
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户信息
  const updateUserProfile = async (userData: {email?: string, bio?: string}) => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      if (!userInfo.value?.id) {
        throw new Error('用户ID不存在')
      }
      
      const response = await axios.put(`${baseUrl}/user/${userInfo.value.id}`, {
        email: userData.email,
        remark: userData.bio
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '更新用户信息失败')
      }
      
      // 更新store中的用户信息
      if (userInfo.value) {
        userInfo.value.email = userData.email || userInfo.value.email
        userInfo.value.bio = userData.bio || userInfo.value.bio
        
        // 保存到本地存储
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
      
      return {
        success: true,
        data: userInfo.value
      }
    } catch (error: any) {
      errorMessage.value = error.message || '更新用户信息失败'
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 发送验证邮件
  const sendVerificationEmail = async (email: string) => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const response = await axios.post(`${baseUrl}/auth/send-email-code`, {
        email,
        type: 'verify'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '发送验证邮件失败')
      }
      
      return {
        success: true,
        message: '验证邮件已发送'
      }
    } catch (error: any) {
      errorMessage.value = error.message || '发送验证邮件失败'
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 切换两步验证
  const toggleTwoFactorAuth = async (enable: boolean) => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const action = enable ? 'enable' : 'disable'
      
      const response = await axios.post(`${baseUrl}/user/two-factor/${action}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || `${enable ? '启用' : '禁用'}两步验证失败`)
      }
      
      return {
        success: true,
        message: `两步验证已${enable ? '启用' : '禁用'}`
      }
    } catch (error: any) {
      errorMessage.value = error.message || `${enable ? '启用' : '禁用'}两步验证失败`
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 更新通知设置
  const updateNotificationSettings = async (type: string, enabled: boolean) => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const response = await axios.post(`${baseUrl}/user/notifications/settings`, {
        type,
        enabled
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '更新通知设置失败')
      }
      
      return {
        success: true,
        message: `通知设置已${enabled ? '启用' : '禁用'}`
      }
    } catch (error: any) {
      errorMessage.value = error.message || '更新通知设置失败'
      return {
        success: false,
        message: errorMessage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户排名
  const fetchUserRank = async () => {
    // 如果用户未登录，返回错误
    if (!isLoggedIn.value || !userInfo.value?.id) {
      console.log('无法获取排名：用户未登录或ID无效');
      return {
        success: false,
        message: '用户未登录或用户ID无效'
      }
    }

    isLoading.value = true;
    
    try {
      // 尝试从本地存储中获取用户排名
      const cachedRank = localStorage.getItem('userRank');
      if (cachedRank) {
        userRank.value = cachedRank;
        console.log('使用缓存的排名:', userRank.value);
      }
      
      console.log('正在请求用户排名数据，用户ID:', userInfo.value.id);
      
      // 请求API获取最新排名，确保传递用户ID参数
      const response = await axios.get(`${baseUrl}/user/rank`, {
        params: {
          userId: userInfo.value.id
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('API响应数据:', response.data);
      
      if (response.data.success) {
        // API成功返回排名数据
        userRank.value = response.data.data.rank.toString();
        console.log('获取的用户排名:', userRank.value);
        
        // 更新本地存储
        localStorage.setItem('userRank', userRank.value);
        
        // 更新用户信息中的排名
        if (userInfo.value) {
          userInfo.value.userRank = userRank.value;
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
        }
        
        return {
          success: true,
          data: { rank: userRank.value }
        };
      } else {
        console.error('API返回错误:', response.data.message);
        throw new Error(response.data.message || '获取排名失败');
      }
    } catch (error: any) {
      console.error('获取用户排名失败:', error);
      
      // 模拟API响应，生成一个固定的排名
      const simulatedRank = generateSimulatedRank();
      userRank.value = simulatedRank;
      console.log('使用模拟的排名数据:', simulatedRank);
      
      // 更新本地存储
      localStorage.setItem('userRank', userRank.value);
      
      // 更新用户信息中的排名
      if (userInfo.value) {
        userInfo.value.userRank = userRank.value;
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
      }
      
      return {
        success: true,
        data: { 
          rank: userRank.value,
          simulated: true
        }
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 生成一个模拟的排名，基于用户ID
  const generateSimulatedRank = () => {
    if (!userInfo.value?.id) {
      return Math.floor(Math.random() * 1000 + 1).toString();
    }
    
    // 使用用户ID生成一个固定的排名
    const userId = userInfo.value.id.toString();
    let hash = 0;
    
    // 简单的字符串哈希算法
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // 转换为32位整数
    }
    
    // 确保排名为正数且在合理范围内(1-999)
    const rank = Math.abs(hash % 999) + 1;
    
    return rank.toString();
  };

  // 初始化用户排名
  const initUserRank = () => {
    const savedRank = localStorage.getItem('userRank')
    if (savedRank) {
      userRank.value = savedRank
    }
  }

  return {
    isLoggedIn,
    userInfo,
    autoLogin,
    isLoading,
    errorMessage,
    userRank, // 暴露用户排名
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
    clearLoginMessage,
    // 新增API方法
    fetchUserProfile,
    fetchUserRank, // 暴露获取排名方法
    initUserRank, // 暴露初始化排名方法
    updateAvatar,
    updateUserProfile,
    sendVerificationEmail,
    toggleTwoFactorAuth,
    updateNotificationSettings
  }
}) 