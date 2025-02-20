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
          <div class="menu-item logout" @click="handleLogout">
            <Icon icon="mdi:logout" />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const isDragging = ref(false)
const showMenu = ref(false)
const position = ref({ right: '20px', top: '80px' })

let startX = 0
let startY = 0
let startRight = 0
let startTop = 0
let dragStartTime = 0
let dragDistance = 0

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

const handleLogout = () => {
  userStore.logout()
  showMenu.value = false
}
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
</style> 