<template>
  <div class="profile-card">
    <!-- 背景图片 -->
    <div class="profile-bg"></div>
    
    <!-- 中间遮罩层 -->
    <div class="profile-mask"></div>
    
    <!-- 内容区域 -->
    <div class="profile-content">
      <!-- 头像区域 -->
      <div class="avatar-wrapper">
        <img :src="userStore.userInfo?.avatar || '../assets/logo.png'" alt="头像" class="avatar" />
      </div>
      
      <!-- 用户信息 -->
      <div class="user-info">
        <h2 class="username">{{ userStore.userInfo?.username || 'Dansela' }}</h2>
        <p class="subtitle">{{ userStore.userInfo?.bio || 'Danny' }}</p>
      </div>
      
      <!-- 统计数据 -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">文章</span>
          <span class="stat-value">{{ userStats.articles }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">标签</span>
          <span class="stat-value">{{ userStats.tags }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">分类</span>
          <span class="stat-value">{{ userStats.categories }}</span>
        </div>
      </div>
      
      <!-- Follow按钮 -->
      <div class="follow-btn">
        <Icon icon="mdi:github" />
        <span class="Follow-btns">Follow Me！🛫</span>
        <template v-for="i in 120" :key="i">
          <span class="line" :style="{ 
            top: `${(i - 1)}px`, 
            transitionDelay: `${Math.random() * 0.75}s` 
          }"></span>
        </template>
      </div>
      
      <!-- 社交图标 -->
      <div class="social-icons">
        <a href="mailto:your@email.com" class="social-icon" title="Email">
          <Icon icon="mdi:email" />
        </a>
        <a href="tencent://message/?uin=your-qq" class="social-icon" title="QQ">
          <Icon icon="mdi:qqchat" />
        </a>
        <a href="https://wakatime.com/@yourusername" class="social-icon" title="WakaTime">
          <Icon icon="simple-icons:wakatime" />
        </a>
        <a href="/rss.xml" class="social-icon" title="RSS">
          <Icon icon="mdi:rss" />
        </a>
        <div class="social-icon more-icon" @click="showMoreSocial = true" title="更多">
          <Icon icon="mdi:dots-horizontal" />
        </div>
      </div>
    </div>
  </div>

  <!-- 更多社交平台弹出框 -->
  <div class="more-social-modal" v-if="showMoreSocial" @click.self="showMoreSocial = false">
    <div class="modal-content">
      <div class="modal-header">
        <h3>更多社交平台</h3>
        <Icon icon="mdi:close" class="close-btn" @click="showMoreSocial = false" />
      </div>
      <div class="social-grid">
        <a href="https://space.bilibili.com/your-id" class="social-item">
          <Icon icon="ri:bilibili-fill" />
          <span>哔哩哔哩</span>
        </a>
        <a href="https://github.com/your-username" class="social-item">
          <Icon icon="mdi:github" />
          <span>GitHub</span>
        </a>
        <a href="https://gitee.com/your-username" class="social-item">
          <Icon icon="simple-icons:gitee" />
          <span>Gitee</span>
        </a>
        <!-- 可以继续添加更多社交平台 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const showMoreSocial = ref(false)

// 用户统计信息
const userStats = ref({
  articles: 0,
  tags: 0,
  categories: 0
})

// 组件挂载时获取用户数据
onMounted(async () => {
  // 如果用户已登录但尚未加载详细信息
  if (userStore.isLoggedIn && userStore.userInfo) {
    // 获取用户详细信息和排名
    await userStore.fetchUserProfile()
    
    // 获取用户排名
    if (userStore.fetchUserRank) {
      await userStore.fetchUserRank()
    }
    
    // 这里可以添加获取用户统计数据的逻辑
    // 示例：通过API获取用户的文章、标签和分类数量
    try {
      // 这里应该是实际的API调用，目前使用模拟数据
      userStats.value = {
        articles: 60,
        tags: 80,
        categories: 3
      }
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
    }
  }
})
</script>

<style scoped>
.profile-card {
  width: 300px;
  height: auto;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* 背景图片 */
.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background/宫水三叶3.png');
  background-size: cover;
  background-position: center;
  opacity: 0.9;
  z-index: 1;
  transition: all 0.5s ease;
}

/* 遮罩层 */
.profile-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('public/elements/cardFrame/card-frame2.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 2;
  opacity: 0.9;
  transition: all 0.5s ease;
}

/* 内容区域 */
.profile-content {
  position: relative;
  z-index: 3;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

/* 头像容器 */
.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 20px 0;
  transition: all 0.5s ease;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

/* 用户信息 */
.user-info {
  text-align: center;
  margin-bottom: 0px;
}

.username {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 5px 0;
}

/* 统计数据 */
.stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 10px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

/* Follow按钮 */
.follow-btn {
  position: relative;
  width: 90%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 24px;
  border: none;
  border-radius: 5px;
  background: rgba(52, 152, 219, 0.9);
  color: #ffffff;
  cursor: pointer;
  overflow: hidden;
  transition: 0.5s;
  transition-delay: 0.5s;
  margin-bottom: 15px;
  font-size: 1em;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.follow-btn:hover {
  color: #363a3b;
  filter: drop-shadow(0 0 10px #87CEEB) drop-shadow(0 0 30px #87CEEB);
  transform: translateY(-2px);
}

/* 添加 span 和 line 样式 */
.follow-btn span {
  position: relative;
  z-index: 1;
  color: inherit;
}

.follow-btn .line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 0.5px;
  background-color: #87CEEB;
  z-index: 0;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s ease-in-out;
}

.follow-btn:hover .line {
  transform: scaleX(1);
  transform-origin: left;
}

.follow-btn .iconify {
  position: relative;
  z-index: 1;
  font-size: 1.5em;
  margin-right: 2px;
  margin-bottom: 2px;
}

/* 文本样式调整 */
.Follow-btns {
  white-space: nowrap;
  font-weight: 500;
}

/* 社交图标 */
.social-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 0 10px;
}

.social-icon {
  color: white;
  font-size: 1.2rem;
  transition: all 0.5s ease;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.social-icon:hover {
  transform: rotate(360deg);
  color: #3498db;
  background: rgba(255, 255, 255, 0.2);
}

.more-icon {
  padding: 2px;
}

/* Hover效果 */
.profile-card:hover .profile-bg {
  filter: blur(0);
}

.profile-card:hover .profile-mask {
  opacity: 0.3;
}

.profile-card:hover .avatar-wrapper {
  transform: scale(1.5);
  opacity: 0.0;
}

.profile-card:hover .avatar {
  filter: blur(2px);
}

.social-icon:hover {
  transform: rotate(360deg);
  color: #3498db;
}

/* 更多社交平台弹出框样式 */
.more-social-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  color: #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #3498db;
  transform: rotate(90deg);
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border-radius: 8px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-item:hover {
  background: rgba(52, 152, 219, 0.1);
  transform: translateY(-2px);
}

.social-item .iconify {
  font-size: 1.8rem;
}
</style> 