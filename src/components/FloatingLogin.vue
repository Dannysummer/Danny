<template>
  <div class="floating-login" 
       :class="{ 'dragging': isDragging, 'expanded': showMenu }"
       :style="position"
       @mousedown.stop="startDrag"
       @touchstart.stop="startDrag">
    <div class="login-container" @click="handleContainerClick">
      <!-- 未展开状态 -->
      <div v-if="!showMenu" class="user-header">
        <div class="avatar-container">
          <img v-if="userStore.isLoggedIn" 
               :src="userStore.userInfo?.avatar || '/avatars/default-avatar.png'" 
               alt="用户头像"
               class="user-avatar" />
          <Icon v-else icon="mdi:login" class="login-icon" />
        </div>
        <span class="login-text">
          {{ userStore.isLoggedIn ? userStore.userInfo?.username : '登录' }}
        </span>
      </div>

      <!-- 展开状态 -->
      <div v-else class="expanded-content">
        <div class="user-header-expanded">
          <div class="avatar-container large">
            <img :src="userStore.userInfo?.avatar || '/avatars/default-avatar.png'" 
                 alt="用户头像"
                 class="user-avatar" />
          </div>
          <div class="user-info">
            <span class="username">{{ userStore.userInfo?.username }}</span>
            <span class="user-role">{{ userStore.userInfo?.role || '访客' }}</span>
          </div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-options" @click.stop>
          <router-link to="/profile" class="menu-item">
            <Icon icon="mdi:account-circle" />
            <span>个人中心</span>
          </router-link>
          <router-link to="/notifications" class="menu-item">
            <Icon icon="mdi:bell" />
            <span>消息通知</span>
          </router-link>
          <router-link to="/settings" class="menu-item">
            <Icon icon="mdi:cog" />
            <span>设置</span>
          </router-link>
          <div class="menu-item logout" @click="() => handleLogout()">
            <Icon icon="mdi:logout" />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
    <CustomAlert 
      :message="alertMessage" 
      :type="alertType" 
      :show="showAlert"
      @update:show="showAlert = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch} from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import CustomAlert from './CustomAlert.vue'

// 为自定义事件创建类型定义
interface LoginStateEventDetail {
  isLoggedIn: boolean;
  source: string;
  timestamp: number;
}

// 初始化 store 和 router
const userStore = useUserStore()
const router = useRouter()

// 组件响应式状态
const isDragging = ref(false)
const showMenu = ref(false)
const position = ref({ right: '20px', top: '80px' })
const showTokenExpiredTip = ref(false)
const initialized = ref(false)

// 自定义提示框的状态
const alertMessage = ref('')
const alertType = ref<'success' | 'error' | 'warning' | 'info'>('warning')
const showAlert = ref(false)

// 拖拽相关变量
let startX = 0
let startY = 0
let startRight = 0
let startTop = 0
let dragStartTime = 0
let dragDistance = 0

// 保存位置到 localStorage
// const savePosition = () => {
//   localStorage.setItem('floatingLoginPosition', JSON.stringify(position.value))
// }

// 从 localStorage 恢复位置
const restorePosition = () => {
  const savedPosition = localStorage.getItem('floatingLoginPosition')
  if (savedPosition) {
    try {
      position.value = JSON.parse(savedPosition)
    } catch (error) {
      console.error('恢复位置失败:', error)
    }
  }
}

// 在组件挂载前恢复登录状态
onBeforeMount(() => {
  console.log('FloatingLogin: 组件挂载前开始恢复登录状态')
  // 立即恢复登录状态，不要等待挂载后
  restoreLoginState() 
  // 恢复组件位置
  restorePosition()
})

// 在组件挂载后设置事件监听
onMounted(() => {
  console.log('FloatingLogin: 组件已挂载')
  
  // 监听存储事件，检测其他标签页中可能发生的登录状态变化
  window.addEventListener('storage', handleStorageChange)
  
  // 在 window 对象上设置监听器，以便能在任何组件中监听登录状态变化
  window.addEventListener('login-state-changed', ((event: Event) => {
    // 类型转换，因为我们知道这是我们自定义的事件
    const customEvent = event as CustomEvent<LoginStateEventDetail>;
    handleLoginStateChange(customEvent);
  }) as EventListener);
  
  // 定期检查 token 有效性 (5分钟一次)
  const tokenCheckInterval = setInterval(checkTokenValidity, 5 * 60 * 1000)
  
  // 监听用户状态变化
  watch(() => userStore.isLoggedIn, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log('FloatingLogin: 用户登录状态变化:', newVal)
      
      // 如果用户登录状态变为登录，保存到 localStorage
      if (newVal === true && userStore.userInfo) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
        
        // 尝试获取 token，若没有则可能需要从服务器刷新
        if (!getTokenFromCookie() && !localStorage.getItem('token')) {
          console.log('FloatingLogin: 检测到登录状态但没有 token，尝试刷新 token')
          refreshToken()
        }
      }
      
      // 通知其他组件登录状态变化
      dispatchLoginStateEvent(newVal)
    }
  }, { immediate: true })
  
  // 组件销毁时清理
  return () => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('login-state-changed', ((event: Event) => {
      const customEvent = event as CustomEvent<LoginStateEventDetail>;
      handleLoginStateChange(customEvent);
    }) as EventListener)
    clearInterval(tokenCheckInterval)
  }
})

// 修改处理登录状态变化事件的函数类型
const handleLoginStateChange = (event: CustomEvent<LoginStateEventDetail>) => {
  console.log('FloatingLogin: 收到登录状态变化事件:', event.detail)
  
  // 如果不是自己发出的事件，则同步状态
  if (event.detail.source !== 'floatingLogin') {
    restoreLoginState()
  }
}

// 修改发送登录状态变化事件的函数
const dispatchLoginStateEvent = (isLoggedIn: boolean) => {
  const event = new CustomEvent<LoginStateEventDetail>('login-state-changed', {
    detail: {
      isLoggedIn,
      source: 'floatingLogin',
      timestamp: Date.now()
    }
  })
  window.dispatchEvent(event)
}

// 添加回被删除的函数：处理存储事件
const handleStorageChange = (event: StorageEvent) => {
  // 检测登录相关的存储变化
  if (event.key === 'isLoggedIn' || event.key === 'userInfo' || event.key === 'token') {
    console.log('FloatingLogin: 检测到存储变化:', event.key)
    
    // 避免重复处理自己触发的存储事件
    if (document.hasFocus()) return
    
    // 重新同步登录状态
    restoreLoginState()
  }
}

// 添加新函数：刷新 token
const refreshToken = async () => {
  try {
    console.log('FloatingLogin: 正在刷新 token')
    const response = await fetch('http://localhost:8088/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.token) {
        console.log('FloatingLogin: token 刷新成功')
        // 保存新 token
        localStorage.setItem('token', data.token)
        
        // 设置 cookie
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 7) // 7天有效期
        document.cookie = `token=${data.token}; expires=${expirationDate.toUTCString()}; path=/`
      }
    }
  } catch (error) {
    console.error('FloatingLogin: 刷新 token 失败:', error)
  }
}

// 修改函数：从 localStorage 和 cookie 恢复登录状态
const restoreLoginState = async () => {
  console.log('FloatingLogin: 正在恢复登录状态')
  
  // 首先检查是否已经登录，避免重复操作
  if (userStore.isLoggedIn && userStore.userInfo) {
    console.log('FloatingLogin: 已经处于登录状态，无需恢复')
    return
  }
  
  // 检查登录标记 (多种来源)
  const isLoggedInLS = localStorage.getItem('isLoggedIn') === 'true'
  const userInfoLS = localStorage.getItem('userInfo')
  const tokenLS = localStorage.getItem('token')
  const tokenCookie = getTokenFromCookie()
  
  console.log('FloatingLogin: 登录检查 -', 
              'localStorage登录标记:', isLoggedInLS, 
              'localStorage用户信息:', !!userInfoLS,
              'localStorage Token:', !!tokenLS,
              'Cookie Token:', !!tokenCookie)
  
  // 如果有任何登录标记，尝试恢复
  if (isLoggedInLS || (userInfoLS && (tokenLS || tokenCookie))) {
    try {
      // 1. 恢复用户信息
      if (userInfoLS) {
        const userInfo = JSON.parse(userInfoLS)
        userStore.userInfo = userInfo
        userStore.isLoggedIn = true
        console.log('FloatingLogin: 从localStorage恢复了用户信息:', userInfo.username)
      }
      
      // 2. 确保 token 存在于 cookie (API请求需要)
      if (!tokenCookie && tokenLS) {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 7) // 7天有效期
        document.cookie = `token=${tokenLS}; expires=${expirationDate.toUTCString()}; path=/`
        console.log('FloatingLogin: 从localStorage恢复token到cookie')
      }
      
      // 3. 如果有 token 但没有用户信息，尝试获取
      if ((tokenCookie || tokenLS) && !userInfoLS) {
        console.log('FloatingLogin: 有token但无用户信息，尝试获取用户信息')
        await fetchUserInfo()
      }
      
      // 标记初始化完成
      initialized.value = true
      
      // 延迟验证 token
      setTimeout(() => {
        checkTokenValidity()
      }, 2000)
      
    } catch (error) {
      console.error('FloatingLogin: 恢复登录状态时出错:', error)
      clearLoginState()
    }
  } else {
    console.log('FloatingLogin: 没有找到登录标记，保持登出状态')
    clearLoginState()
  }
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const event = e instanceof MouseEvent ? e : e.touches[0]
  startX = event.clientX
  startY = event.clientY
  startRight = parseInt(position.value.right)
  startTop = parseInt(position.value.top)
  dragStartTime = Date.now()
  dragDistance = 0

  document.addEventListener('mousemove', drag)
  document.addEventListener('touchmove', drag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

const drag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  const event = e instanceof MouseEvent ? e : e.touches[0]
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  position.value = {
    right: `${startRight - deltaX}px`,
    top: `${startTop + deltaY}px`
  }
}

const stopDrag = () => {
  isDragging.value = false
  
  setTimeout(() => {
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('touchmove', drag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchend', stopDrag)
    isDragging.value = false
    dragDistance = 0
  }, 0)
}

const handleContainerClick = () => {
  if (dragDistance < 5) {
    handleClick()
  }
}

const handleClick = () => {
  if (userStore.isLoggedIn) {
    showMenu.value = !showMenu.value
  } else {
    router.push('/login')
  }
}

const checkTokenValidity = async () => {
  try {
    // 如果没有登录信息，不需要检查
    if (!userStore.isLoggedIn || !getTokenFromCookie()) {
      return;
    }
    
    const response = await fetch('http://localhost:8088/api/auth/check-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!data.success) {
      console.log('Token 已失效');
      showTokenExpiredMessage();
      clearLoginState(true);
    } else {
      console.log('Token 有效');
    }
  } catch (error) {
    console.error('检查token有效性失败:', error);
  }
};

const showTokenExpiredMessage = () => {
  alertMessage.value = '大人，您的登录状态已经失效啦，请重新登录';
  alertType.value = 'warning';
  showAlert.value = true;
  
  // 添加一个重新登录的按钮
  setTimeout(() => {
    if (showAlert.value) {
      showAlert.value = false;
      router.push('/login');
    }
  }, 5000); // 5秒后自动跳转到登录页面
};

const handleLogout = async (silent: boolean = false) => {
  try {
    // 直接调用fetch而不保存未使用的响应
    await fetch('http://localhost:8088/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 不管后端响应如何，前端都清除登录状态
    clearLoginState(!silent);
    
    if (!silent) {
      router.push('/');
    }
  } catch (error) {
    console.error('退出登录出错:', error);
    clearLoginState(!silent);
  }
};

// 新增函数：从 cookie 中获取 token
const getTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
};

// 新增函数：清理登录状态
const clearLoginState = (silent: boolean = true) => {
  // 清除 cookie
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // 清除 localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('isLoggedIn');
  
  // 重置 store
  userStore.isLoggedIn = false;
  userStore.userInfo = null;
  
  // 关闭菜单
  showMenu.value = false;
  
  console.log('已清除所有登录状态');
  
  if (!silent) {
    router.push('/login');
  }
};

// 新增函数：从服务器获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await fetch('http://localhost:8088/api/user/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // 设置用户信息
        userStore.userInfo = data.data;
        userStore.isLoggedIn = true;
        
        // 存储到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('成功获取并设置用户信息:', data.data.username);
      } else {
        clearLoginState();
      }
    } else {
      clearLoginState();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    clearLoginState();
  }
};
</script>

<style scoped>
.floating-login {
  position: fixed;
  z-index: 1000;
  cursor: move;
  user-select: none;
  margin: 10px;
}

.login-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.897);
  backdrop-filter: blur(10px);
  border: 2px solid #3498db;
  border-radius: 40px;
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 160px;
  height: 48px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1),
              height 1s cubic-bezier(0.4, 0, 0.2, 1),
              border-radius 1s cubic-bezier(0.4, 0, 0.2, 1),
              padding 1s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 1s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded .login-container {
  width: 240px;
  height: 300px;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container.large {
  width: 50px;
  height: 50px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-icon {
  margin-top: 7px;
  margin-left: 13px;
  font-size: 1.2rem;
  color: #3498db;
}

.login-text {
  font-size: 1rem;
  font-weight: 500;
}

.user-header {
  width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.expanded-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.6s ease;
  transition-delay: 0.6s;
  position: absolute;
  pointer-events: none;
}

.expanded .expanded-content {
  opacity: 1;
  position: relative;
  pointer-events: auto;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 1.1rem;
  font-weight: 500;
}

.user-role {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.menu-divider {
  width: 200px;
  height: 1px;
  background: rgba(0, 0, 0, 0.849);
  margin: 0px 0;
}

.menu-options {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 0px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(52, 152, 219, 0.1);
}

.logout {
  color: #e74c3c;
}

.logout:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* 暗色主题适配 - 使用更高的优先级 */
html.dark-theme .floating-login .login-container {
  background: rgba(30, 30, 30, 0.616);
  border-color: #87CEEB;
  box-shadow: 0 0 15px rgba(0, 204, 255, 0.849);
  backdrop-filter: blur(12px);
}

html.dark-theme .floating-login .login-text,
html.dark-theme .floating-login .username,
html.dark-theme .floating-login .menu-item {
  color: rgba(255, 255, 255, 0.9);
}

html.dark-theme .floating-login .user-role {
  color: rgba(255, 255, 255, 0.6);
}

html.dark-theme .floating-login .menu-divider {
  background: rgb(255, 255, 255);
}

/* 添加暗色主题下的hover效果 */
html.dark-theme .floating-login .menu-item:hover {
  background: rgb(135, 207, 235);
}

html.dark-theme .floating-login .logout:hover {
  background: rgb(231, 77, 60);
}

/* 拖动时的样式 */
.dragging .login-container {
  cursor: grabbing;
}

/* 动画过渡 */
.avatar-container {
  transition-property: width, height, margin;
}

/* 确保内容在过渡期间不会溢出 */
.user-header,
.user-header-expanded,
.menu-options {
  transition: opacity 0.6s ease;
  transition-delay: 0.6s;
}

.expanded .user-header {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.user-header-expanded,
.menu-options {
  opacity: 0;
}

.expanded .user-header-expanded,
.expanded .menu-options {
  opacity: 1;
}

.user-header-expanded {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 200px;
}

.avatar-container.large {
  margin-bottom: 0;
}

.user-info {
  text-align: left;
}

.menu-divider {
  margin-top: 5px;
}

/* Token失效提示样式已经不再需要，使用CustomAlert组件代替 */
</style> 