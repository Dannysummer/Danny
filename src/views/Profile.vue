<template>
  <div class="profile-page">
    <ParticlesBackground />
    
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
          <span class="user-role">{{ userStore.userInfo?.role || '用户' }}</span>
          <p class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
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
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import CustomAlert from '../components/CustomAlert.vue'
import axios from 'axios'

const userStore = useUserStore()
const themeStore = useThemeStore()

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
  permissions?: string[]
  emailVerified?: boolean
}

// 修改 userInfo 的初始化
const userInfo = reactive<UserInfo>({
  username: userStore.userInfo?.username || '',
  email: userStore.userInfo?.email || '',
  emailVerified: false,
  bio: userStore.userInfo?.bio || '',
  avatar: userStore.userInfo?.avatar || '/avatars/default-avatar.png'
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
    // 创建 FormData 对象
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await axios.post('/api/user/upload-avatar', formData)
    if (response.data.success) {
      userInfo.avatar = response.data.avatarUrl
      showAlert('头像上传成功', 'success')
    }
  } catch (error) {
    showAlert('头像上传失败', 'error')
  }
}

// 邮箱验证
const verifyEmail = async () => {
  try {
    // TODO: 实现邮箱验证逻辑
    showAlert('验证邮件已发送', 'success')
  } catch (error) {
    showAlert('发送验证邮件失败', 'error')
  }
}

// 切换两步验证
const toggleTwoFactor = () => {
  security.twoFactorEnabled = !security.twoFactorEnabled
}

// 切换通知设置
const toggleNotification = (key: string) => {
  const setting = notificationSettings[key as keyof typeof notificationSettings]
  if (setting) {
    setting.enabled = !setting.enabled
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
    // TODO: 实现保存逻辑
    showAlert('保存成功', 'success')
  } catch (error) {
    showAlert('保存失败', 'error')
  }
}
</script>

<style scoped>
.profile-page {
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
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.profile-header {
  padding: 40px;
  display: flex;
  gap: 30px;
  background: rgba(0, 0, 0, 0.2);
}

.avatar-section {
  position: relative;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 3px solid rgba(135, 206, 235, 0.5);
  transition: all 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 24px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  color: #fff;
  margin: 0 0 5px;
}

.user-role {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(135, 206, 235, 0.2);
  border-radius: 20px;
  color: #87CEEB;
  font-size: 14px;
  margin-bottom: 15px;
}

.user-bio {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.5;
}

.profile-content {
  padding: 30px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.tab-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.1);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.input-with-icon {
  position: relative;
  margin-bottom: 15px;
}

.input-with-icon .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}

.input-with-icon input,
textarea {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

textarea {
  padding: 12px;
  resize: vertical;
}

.input-with-icon input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(135, 206, 235, 0.5);
  box-shadow: 0 0 15px rgba(135, 206, 235, 0.2);
}

.verify-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background: rgba(135, 206, 235, 0.8);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-btn:hover {
  background: rgba(135, 206, 235, 0.9);
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-switch {
  width: 50px;
  height: 26px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: rgba(135, 206, 235, 0.8);
}

.toggle-button {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.toggle-switch.active .toggle-button {
  left: 26px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 15px;
}

.notification-info h3 {
  color: #fff;
  margin: 0 0 5px;
}

.notification-info p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 14px;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.theme-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-card:hover {
  transform: translateY(-5px);
}

.theme-card.active {
  border: 2px solid #87CEEB;
}

.theme-preview {
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.preview-header {
  height: 30%;
  background: rgba(255, 255, 255, 0.1);
}

.preview-content {
  height: 70%;
  background: rgba(255, 255, 255, 0.05);
}

.theme-name {
  display: block;
  text-align: center;
  color: #fff;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(135, 206, 235, 0.8);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: rgba(135, 206, 235, 0.9);
  transform: translateY(-2px);
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
  }

  .tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .theme-options {
    grid-template-columns: 1fr;
  }
}
</style> 