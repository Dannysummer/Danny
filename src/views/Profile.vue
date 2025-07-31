<template>
  <div class="profile-page">
    <ParticlesBackground />
    
    <!-- 激光卡片展示模态框 -->
    <div class="laser-card-modal" v-if="showLaserCard" @click.self="showLaserCard = false">
      <div class="modal-content">
        <!-- <div class="modal-close" @click="showLaserCard = false">
          <Icon icon="mdi:close" />
        </div> -->
        <div class="laser-card-container">
          <!-- <LaserWelcomeCard 
            :title="userStore.userInfo?.username || '用户名'" 
            :subtitle="formatRegistrationDate(userStore.userInfo?.lastLoginTime)" 
            :avatarSrc="userStore.userInfo?.avatar || '/avatars/default-avatar.png'"
          /> -->
          <LaserCard />
        </div>
      </div>
    </div>
    
    <div class="profile-container">
      <!-- 顶部个人信息卡片 -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-container" @click="triggerAvatarUpload">
            <img :src="userStore.userInfo?.avatar || '/avatars/default-avatar.png'" 
                 alt="用户头像"
                 class="user-avatar" />
            <div class="avatar-overlay">
              <Icon icon="material-symbols:edit" />
            </div>
          </div>
          <input 
            type="file" 
            ref="avatarInput"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
        </div>
        
        <div class="user-info">
          <h2 class="username">{{ userStore.userInfo?.username }}</h2>
          <div class="user-meta">
            <span class="user-role">{{ userStore.userInfo?.role || '用户' }}</span>
            <span class="user-id"> {{ getUserId() }}</span>
            <span class="registration-time">注册于: {{ formatRegistrationDate(userStore.userInfo?.createTime) }}</span>
          </div>
          <p class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
          
          <div class="user-actions">
            <button class="view-card-btn" @click="showLaserCard = true">
              <Icon icon="mdi:card-account-details-outline" />
              查看我的激光卡片
            </button>
          </div>
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="profile-content">
        <div class="tabs">
          <div v-for="tab in tabs" 
               :key="tab.key"
               :class="['tab-item', { active: currentTab === tab.key }]"
               @click="currentTab = tab.key">
            <Icon :icon="tab.icon" />
            <span>{{ tab.label }}</span>
          </div>
        </div>

        <!-- 基本信息 -->
        <div v-show="currentTab === 'basic'" class="tab-content">
          <div class="form-group">
            <label>用户名</label>
            <div class="input-with-icon">
              <Icon icon="mdi:account" />
              <input v-model="userInfo.username" placeholder="用户名" />
            </div>
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <div class="input-with-icon">
              <Icon icon="mdi:email" />
              <input v-model="userInfo.email" placeholder="邮箱" />
              <button v-if="!userInfo.emailVerified" 
                      class="verify-btn"
                      @click="verifyEmail">
                验证邮箱
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="userInfo.bio" 
                      placeholder="写点什么来介绍自己吧..."
                      rows="4">
            </textarea>
          </div>
        </div>

        <!-- 安全设置 -->
        <div v-show="currentTab === 'security'" class="tab-content">
          <div class="form-group">
            <label>修改密码</label>
            <div class="input-with-icon">
              <Icon icon="mdi:lock" />
              <input type="password" 
                     v-model="security.oldPassword" 
                     placeholder="当前密码" />
            </div>
            <div class="input-with-icon">
              <Icon icon="mdi:lock-reset" />
              <input type="password" 
                     v-model="security.newPassword" 
                     placeholder="新密码" />
            </div>
            <div class="input-with-icon">
              <Icon icon="mdi:lock-check" />
              <input type="password" 
                     v-model="security.confirmPassword" 
                     placeholder="确认新密码" />
            </div>
          </div>
          
          <div class="form-group">
            <label>两步验证</label>
            <div class="toggle-container">
              <span>{{ security.twoFactorEnabled ? '已启用' : '未启用' }}</span>
              <div class="toggle-switch" 
                   :class="{ active: security.twoFactorEnabled }"
                   @click="toggleTwoFactor">
                <div class="toggle-button"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div v-show="currentTab === 'notifications'" class="tab-content">
          <div v-for="(setting, key) in notificationSettings" 
               :key="key" 
               class="notification-item">
            <div class="notification-info">
              <h3>{{ setting.label }}</h3>
              <p>{{ setting.description }}</p>
            </div>
            <div class="toggle-switch" 
                 :class="{ active: setting.enabled }"
                 @click="toggleNotification(key)">
              <div class="toggle-button"></div>
            </div>
          </div>
        </div>

        <!-- 主题设置 -->
        <div v-show="currentTab === 'appearance'" class="tab-content">
          <div class="theme-options">
            <div v-for="theme in themes" 
                 :key="theme.key"
                 :class="['theme-card', { active: currentTheme === theme.key }]"
                 @click="setTheme(theme.key)">
              <div class="theme-preview" :style="theme.preview">
                <div class="preview-header"></div>
                <div class="preview-content"></div>
              </div>
              <span class="theme-name">{{ theme.label }}</span>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="action-buttons">
          <button class="save-btn" @click="saveChanges">
            <Icon icon="mdi:content-save" />
            保存更改
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义提示框 -->
    <CustomAlert 
      v-model:show="alertConfig.show"
      :message="alertConfig.message"
      :type="alertConfig.type"
      :duration="alertConfig.duration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import CustomAlert from '../components/CustomAlert.vue'
import LaserCard from '../components/LaserCard.vue'
// import axios from 'axios'


const userStore = useUserStore()
const themeStore = useThemeStore()

// 显示激光卡片标志
const showLaserCard = ref(false)

// 标签页配置
const tabs = [
  { key: 'basic', label: '基本信息', icon: 'mdi:account-details' },
  { key: 'security', label: '安全设置', icon: 'mdi:security' },
  { key: 'notifications', label: '通知设置', icon: 'mdi:bell-outline' },
  { key: 'appearance', label: '主题外观', icon: 'mdi:palette-outline' }
]

const currentTab = ref('basic')

// 在文件顶部添加类型定义
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
  uid?: string | number
  id?: number | string  // 添加id字段
}

// 获取用户数据
const getUserProfile = async () => {
  try {
    const result = await userStore.fetchUserProfile()
    if (!result.success) {
      showAlert(`获取用户资料失败: ${result.message}`, 'error')
    }
  } catch (error: any) {
    showAlert(`获取用户资料失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 生成用户ID，优先使用API返回的实际ID
const getUserId = () => {
  if (userStore.userInfo?.id) return `UID: ${userStore.userInfo.id}`;
  
  if (!userStore.userInfo?.username) return 'N/A';
  
  // 简单的字符串哈希函数
  const username = userStore.userInfo.username;
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转为32位整数
  }
  return `U${Math.abs(hash).toString().padStart(8, '0')}`;
}

// 修改 userInfo 的初始化
const userInfo = reactive<UserInfo>({
  username: userStore.userInfo?.username || '',
  email: userStore.userInfo?.email || '',
  emailVerified: false,
  bio: userStore.userInfo?.bio || '',
  avatar: userStore.userInfo?.avatar || '/avatars/default-avatar.png',
  uid: getUserId(),
  registrationTime: userStore.userInfo?.lastLoginTime || Date.now()
})

// 安全设置
const security = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

// 通知设置
const notificationSettings = reactive({
  email: {
    label: '邮件通知',
    description: '接收重要更新和安全提醒',
    enabled: true
  },
  system: {
    label: '系统通知',
    description: '接收系统公告和功能更新',
    enabled: true
  },
  activity: {
    label: '活动提醒',
    description: '接收互动和关注提醒',
    enabled: true
  }
})

// 主题设置
const themes = [
  { 
    key: 'light', 
    label: '明亮主题',
    preview: { 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }
  },
  { 
    key: 'dark', 
    label: '暗黑主题',
    preview: { 
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' 
    }
  },
  { 
    key: 'auto', 
    label: '跟随系统',
    preview: { 
      background: 'linear-gradient(45deg, #f5f7fa 0%, #2c3e50 100%)' 
    }
  }
]

const currentTheme = ref(themeStore.isDarkTheme ? 'dark' : 'light')

// 提示框配置
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

// 显示提示
const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  alertConfig.value = {
    show: true,
    message,
    type,
    duration: 3000
  }
}

// 格式化注册时间，使用createTime或lastLoginTime
const formatRegistrationDate = (timestamp?: number | string) => {
  if (!timestamp) return '未知时间';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day} 加入`;
}

// 头像上传相关
const avatarInput = ref<HTMLInputElement | null>(null)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  try {
    showAlert('头像上传中...', 'info')
    
    const result = await userStore.updateAvatar(file)
    
    if (result.success) {
      // 更新本地用户信息
      userInfo.avatar = result.data as string
      showAlert('头像上传成功', 'success')
    } else {
      showAlert(`头像上传失败: ${result.message}`, 'error')
    }
  } catch (error: any) {
    showAlert(`头像上传失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 邮箱验证
const verifyEmail = async () => {
  try {
    if (!userInfo.email) {
      showAlert('邮箱地址不能为空', 'error')
      return
    }
    
    const result = await userStore.sendVerificationEmail(userInfo.email)
    
    if (result.success) {
      showAlert('验证邮件已发送', 'success')
    } else {
      showAlert(`发送验证邮件失败: ${result.message}`, 'error')
    }
  } catch (error: any) {
    showAlert(`发送验证邮件失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 切换两步验证
const toggleTwoFactor = async () => {
  try {
    const result = await userStore.toggleTwoFactorAuth(!security.twoFactorEnabled)
    
    if (result.success) {
      security.twoFactorEnabled = !security.twoFactorEnabled
      showAlert(`两步验证已${security.twoFactorEnabled ? '启用' : '禁用'}`, 'success')
    } else {
      showAlert(`两步验证${security.twoFactorEnabled ? '禁用' : '启用'}失败: ${result.message}`, 'error')
    }
  } catch (error: any) {
    showAlert(`两步验证${security.twoFactorEnabled ? '禁用' : '启用'}失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 切换通知设置
const toggleNotification = async (key: string) => {
  try {
    const setting = notificationSettings[key as keyof typeof notificationSettings]
    if (setting) {
      const result = await userStore.updateNotificationSettings(key, !setting.enabled)
      
      if (result.success) {
        setting.enabled = !setting.enabled
        showAlert(`${setting.label}已${setting.enabled ? '启用' : '禁用'}`, 'success')
      } else {
        showAlert(`更新通知设置失败: ${result.message}`, 'error')
      }
    }
  } catch (error: any) {
    showAlert(`更新通知设置失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 设置主题
const setTheme = (theme: string) => {
  currentTheme.value = theme
  themeStore.toggleTheme()
}

// 保存更改
const saveChanges = async () => {
  try {
    const result = await userStore.updateUserProfile({
      email: userInfo.email,
      bio: userInfo.bio
    })
    
    if (result.success) {
      showAlert('保存成功', 'success')
    } else {
      showAlert(`保存失败: ${result.message}`, 'error')
    }
  } catch (error: any) {
    showAlert(`保存失败: ${error.message || '未知错误'}`, 'error')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  getUserProfile();
})
</script>

<style scoped>
.profile-page {
  background-image: url('/public/background/startBg/start-bg1.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
}

.profile-container {
  width: 100%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.profile-container:hover {
  box-shadow: 0 12px 42px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  transform: translateY(-5px);
}

.profile-header {
  padding: 40px;
  display: flex;
  gap: 30px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-section {
  position: relative;
}

.avatar-container {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 4px solid rgba(135, 206, 235, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  border-color: rgba(135, 206, 235, 0.8);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(135, 206, 235, 0.3);
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.avatar-container:hover .user-avatar {
  transform: scale(1.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-overlay .icon {
  color: white;
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.user-info {
  flex: 1;
}

.username {
  font-size: 32px;
  color: #fff;
  margin: 0 0 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.user-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.user-role {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.3), rgba(135, 206, 235, 0.1));
  border-radius: 20px;
  color: #87CEEB;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.2);
}

.user-id, .registration-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
}

.user-bio {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  border-left: 3px solid rgba(135, 206, 235, 0.6);
}

.user-actions {
  display: flex;
  gap: 15px;
}

.view-card-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4a90e2, #5a5de8);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.view-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #5a9ff2, #6a6df8);
}

.profile-content {
  padding: 40px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(135, 206, 235, 0.5) transparent;
}

.tabs::-webkit-scrollbar {
  height: 5px;
}

.tabs::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.tabs::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0.3);
  border-radius: 10px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  white-space: nowrap;
  font-weight: 500;
}

.tab-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.3), rgba(135, 206, 235, 0.1));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tab-content {
  animation: fadeIn 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 15px;
}

.input-with-icon {
  position: relative;
  margin-bottom: 15px;
}

.input-with-icon .icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

.input-with-icon input,
textarea {
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

textarea {
  padding: 15px;
  resize: vertical;
  line-height: 1.6;
}

.input-with-icon input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(135, 206, 235, 0.7);
  box-shadow: 0 0 20px rgba(135, 206, 235, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.verify-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  background: linear-gradient(135deg, #4a90e2, #5a5de8);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-btn:hover {
  background: linear-gradient(135deg, #5a9ff2, #6a6df8);
  transform: translateY(-50%) translateX(-2px);
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.toggle-switch {
  width: 52px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #4a90e2, #5a5de8);
}

.toggle-button {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-button {
  left: 26px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.notification-info h3 {
  color: #fff;
  margin: 0 0 5px;
  font-size: 17px;
}

.notification-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
}

.theme-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.theme-card.active {
  border: 2px solid #87CEEB;
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
}

.theme-preview {
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1) inset;
}

.preview-header {
  height: 30%;
  background: rgba(255, 255, 255, 0.15);
}

.preview-content {
  height: 70%;
  background: rgba(255, 255, 255, 0.08);
}

.theme-name {
  display: block;
  text-align: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px;
}

.action-buttons {
  margin-top: 35px;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background: linear-gradient(135deg, #4a90e2, #5a5de8);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.save-btn:hover {
  background: linear-gradient(135deg, #5a9ff2, #6a6df8);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

/* 激光卡片模态框 */
.laser-card-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: auto; /* 改为auto，允许滚动 */
  padding: 40px 20px;
}

.modal-content {
  position: relative;
  width: 100%;
  height: auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.laser-card-container {
  width: 100%;
  padding: 30px;
  margin-bottom: 60px; /* 为底部提供足够空间 */
  position: relative;
  overflow: visible;
}

.laser-card-container::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  height: 60px; /* 创建足够的底部空间 */
  background: transparent;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 30px 20px;
  }

  .user-meta {
    justify-content: center;
  }

  .tabs {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .profile-content {
    padding: 30px 20px;
  }
  
  .save-btn {
    width: 100%;
    justify-content: center;
  }
  
  .tab-item {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .view-card-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 