<template>
  <div class="user-avatar-container" 
       v-if="userStore.isLoggedIn"
       :style="containerStyle"
       ref="container"
       @mousedown="startDrag"
       :class="{ 'dragging': isDragging }">
    <div class="avatar-button" @click="toggleDropdown" ref="avatarRef">
      <img :src="userStore.userInfo?.avatar || '/avatars/default.png'" 
           :alt="userStore.userInfo?.username" 
           class="avatar-image" />
      <div class="online-status"></div>
    </div>
    
    <transition name="fade">
      <div class="dropdown-menu" 
           v-show="isDropdownOpen" 
           ref="dropdownRef"
           :style="dropdownStyle">
        <div class="user-info">
          <img :src="userStore.userInfo?.avatar || '/avatars/default.png'" 
               :alt="userStore.userInfo?.username" 
               class="large-avatar" />
          <div class="user-details">
            <h3 class="username">{{ userStore.userInfo?.username }}</h3>
            <span class="role">{{ userRoleText }}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="menu-items">
          <button class="menu-item" @click="editProfile" v-if="!isSuperAdmin">
            <i class="fas fa-user-edit"></i>
            编辑个人档案
          </button>
          <button class="menu-item" @click="toAdminPanel" v-if="isSuperAdmin">
            <i class="fas fa-user-shield"></i>
            管理员面板
          </button>
          <button class="menu-item" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            退出登录
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isDropdownOpen = ref(false)
const avatarRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

// 拖动相关状态
const isDragging = ref(false)
const position = ref({ x: 200, y: 200 }) // 初始位置
const container = ref<HTMLElement | null>(null)
const startPos = ref({ x: 0, y: 0 })

// 计算容器样式
const containerStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

// 计算下拉菜单位置
const dropdownStyle = computed(() => {
  const containerWidth = container.value?.offsetWidth || 0
  const windowWidth = window.innerWidth
  const isNearRightEdge = position.value.x + containerWidth + 280 > windowWidth

  return {
    right: isNearRightEdge ? '100%' : 'auto',
    left: isNearRightEdge ? 'auto' : '0'
  }
})

// 开始拖动
const startDrag = (e: MouseEvent) => {
  // 只有点击头像区域才能拖动，点击下拉菜单时不触发
  if (e.target instanceof Element && e.target.closest('.dropdown-menu')) {
    return
  }

  isDragging.value = true
  startPos.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 处理拖动
const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const newX = e.clientX - startPos.value.x
  const newY = e.clientY - startPos.value.y

  // 边界检查
  const maxX = window.innerWidth - (container.value?.offsetWidth || 0)
  const maxY = window.innerHeight - (container.value?.offsetHeight || 0)

  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
}

// 停止拖动
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 保存位置到 localStorage
  localStorage.setItem('avatarPosition', JSON.stringify(position.value))
}

// 计算是否是超级管理员
const isSuperAdmin = computed(() => 
  userStore.userInfo?.role === 'super_admin'
)

// 用户角色显示文本
const userRoleText = computed(() => {
  switch (userStore.userInfo?.role) {
    case 'super_admin':
      return '领主'
    case 'admin':
      return 'Danny管家'
    default:
      return 'Dannyの友人'
  }
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const editProfile = () => {
  router.push('/profile/edit')
  isDropdownOpen.value = false
}

const toAdminPanel = () => {
  router.push('/admin')
  isDropdownOpen.value = false
}

const logout = () => {
  userStore.logout()
  router.push('/login')
  isDropdownOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    isDropdownOpen.value &&
    avatarRef.value &&
    dropdownRef.value &&
    !avatarRef.value.contains(event.target as Node) &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const savedPosition = localStorage.getItem('avatarPosition')
  if (savedPosition) {
    position.value = JSON.parse(savedPosition)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-avatar-container {
  position: fixed;
  z-index: 10002;
  user-select: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 8px;
  border-radius: 16px;
  transition: background-color 0.3s;
}

.user-avatar-container.dragging {
  opacity: 0.8;
}

/* 修改头像按钮样式 */
.avatar-button {
  cursor: pointer;
  margin: 0;
  transition: transform 0.2s;
}

/* 保持头像悬停效果 */
.avatar-button:hover {
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  margin-top: 10px;
  min-width: 280px;
}

/* 暗色主题适配 */
:deep(.dark-theme) .user-avatar-container {
  background: rgba(0, 0, 0, 0.2);
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
  border: 2px solid #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
}

.large-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.email {
  font-size: 0.9rem;
  color: #666;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item i {
  font-size: 1.1rem;
  color: #666;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 暗色主题适配 */
:deep(.dark-theme) .dropdown-menu {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
}

:deep(.dark-theme) .username {
  color: #fff;
}

:deep(.dark-theme) .email {
  color: #aaa;
}

:deep(.dark-theme) .menu-item {
  color: #fff;
}

:deep(.dark-theme) .menu-item:hover {
  background-color: #3d3d3d;
}

:deep(.dark-theme) .divider {
  background: #3d3d3d;
}

/* 原有样式保持不变，添加角色标签样式 */
.role {
  font-size: 0.8rem;
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

/* 暗色主题适配 */
:deep(.dark-theme) .role {
  background: rgba(135, 206, 235, 0.2);
}

/* 超级管理员特殊样式 */
.user-info:has(.role:contains('超级管理员')) .role {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
}
</style> 