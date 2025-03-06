<template>
  <div class="social-page">
    <div class="page-header">
      <h1>社交管理</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchFriendLinks">
          <Icon icon="mdi:refresh" :class="{ 'rotating': isLoading }" />
          刷新
        </button>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tab-container">
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'approved' }"
          @click="currentTab = 'approved'"
        >
          已通过
          <span class="count">{{ approvedLinks.length }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'pending' }"
          @click="currentTab = 'pending'"
        >
          待审核
          <span class="count">{{ pendingLinks.length }}</span>
        </button>
      </div>
    </div>

    <!-- 友链列表 -->
    <div class="friend-links-container">
      <!-- 已通过的友链 -->
      <div v-if="currentTab === 'approved'" class="friend-links-sections">
        <div v-for="(links, category) in groupedApprovedLinks" :key="category" class="category-section">
          <h2 class="category-title">{{ categoryNames[category] || category }}</h2>
          <div class="friend-links-grid">
            <div v-for="link in links" :key="link.id" class="friend-card">
              <div class="friend-card-cover">
                <img :src="link.cover" :alt="link.name" />
              </div>
              <div class="friend-card-content">
                <div class="friend-info">
                  <img :src="link.avatar" class="friend-avatar" :alt="link.name" />
                  <div class="friend-details">
                    <h3>{{ link.name }}</h3>
                    <p>{{ link.description }}</p>
                  </div>
                </div>
                <div class="friend-actions">
                  <a :href="link.url" target="_blank" class="visit-btn">
                    <Icon icon="mdi:open-in-new" />
                    访问
                  </a>
                  <button class="delete-btn" @click="handleDelete(link.id)">
                    <Icon icon="mdi:delete" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待审核的友链 -->
      <div v-else class="friend-links-grid">
        <div v-for="link in pendingLinks" :key="link.id" class="friend-card pending">
          <div class="friend-card-cover">
            <img :src="link.cover" :alt="link.name" />
            <div class="pending-badge">待审核</div>
          </div>
          <div class="friend-card-content">
            <div class="friend-info">
              <img :src="link.avatar" class="friend-avatar" :alt="link.name" />
              <div class="friend-details">
                <h3>{{ link.name }}</h3>
                <p>{{ link.description }}</p>
              </div>
            </div>
            <div class="category-select">
              <label>分类：</label>
              <select v-model="link.category">
                <option v-for="(name, key) in categoryNames" :key="key" :value="key">
                  {{ name }}
                </option>
              </select>
              <a :href="link.url" target="_blank" class="visit-btn">
                <Icon icon="mdi:open-in-new" />
                访问
              </a>
            </div>
            <div class="friend-actions">
              <div class="action-buttons">
                <button class="approve-btn" @click="handleApprove(link)">
                  <Icon icon="mdi:check-circle" />
                  通过
                </button>
                <button class="reject-btn" @click="showRejectDialog(link)">
                  <Icon icon="mdi:close-circle" />
                  拒绝
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝理由对话框 -->
    <div class="modal" v-if="showRejectModal" @click.self="showRejectModal = false">
      <div class="modal-content">
        <h3>拒绝友链申请</h3>
        <div class="modal-body">
          <textarea 
            v-model="rejectReason" 
            placeholder="请输入拒绝理由..."
            rows="4"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showRejectModal = false">取消</button>
          <button class="confirm-btn" @click="confirmReject" :disabled="!rejectReason.trim()">
            确认拒绝
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface FriendLink {
  id: number
  name: string
  description: string
  url: string
  avatar: string
  cover: string
  category: string
  delay?: string
}

const currentTab = ref<'approved' | 'pending'>('approved')
const approvedLinks = ref<FriendLink[]>([])
const pendingLinks = ref<FriendLink[]>([])
const isLoading = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')
const currentRejectLink = ref<FriendLink | null>(null)

// 分类名称映射
const categoryNames: { [key: string]: string } = {
  friend: '知交',
  bigshot: '大佬',
  newbie: '萌新'
}

// 按分类分组已通过的友链
const groupedApprovedLinks = computed(() => {
  const grouped: Record<string, FriendLink[]> = {}
  approvedLinks.value.forEach(link => {
    if (!grouped[link.category]) {
      grouped[link.category] = []
    }
    grouped[link.category].push(link)
  })
  return grouped
})

// 获取友链数据
const fetchFriendLinks = async () => {
  try {
    isLoading.value = true
    
    // 获取已通过的友链
    const approvedResponse = await fetch('http://localhost:8088/api/friend-links/all', {
      credentials: 'include'
    })
    const approvedData = await approvedResponse.json()
    
    // 获取待审核的友链
    const pendingResponse = await fetch('http://localhost:8088/api/friend-links/pending', {
      credentials: 'include'
    })
    const pendingData = await pendingResponse.json()
    
    if (approvedData.success) {
      approvedLinks.value = approvedData.data || []
    }
    
    if (pendingData.success) {
      pendingLinks.value = pendingData.data || []
    }
    
    console.log('已通过的友链:', approvedLinks.value)
    console.log('待审核的友链:', pendingLinks.value)
  } catch (error) {
    console.error('获取友链失败:', error)
    showAlert('获取友链失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 通过友链
const handleApprove = async (link: FriendLink) => {
  try {
    const response = await fetch(`http://localhost:8088/api/friend-links/${link.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        category: link.category
      })
    })
    
    const data = await response.json()
    if (data.success) {
      showAlert('审核通过成功', 'success')
      await fetchFriendLinks()
    } else {
      throw new Error(data.message || '审核失败')
    }
  } catch (error: any) {
    console.error('审核友链失败:', error)
    showAlert(error.message || '审核失败，请重试', 'error')
  }
}

// 显示拒绝对话框
const showRejectDialog = (link: FriendLink) => {
  currentRejectLink.value = link
  rejectReason.value = '您的博客违背了《Dannyの友人帐公约》哦qaq~'
  showRejectModal.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!currentRejectLink.value || !rejectReason.value.trim()) return
  
  // 立即从前端移除该友链
  pendingLinks.value = pendingLinks.value.filter(link => link.id !== currentRejectLink.value?.id)
  showRejectModal.value = false
  showAlert('已拒绝该友链申请', 'success')
  
  try {
    // 后端请求异步处理
    const response = await fetch(`http://localhost:8088/api/friend-links/${currentRejectLink.value.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        reason: rejectReason.value.trim()
      })
    })
    
    const data = await response.json()
    if (!data.success) {
      console.error('拒绝友链失败:', data.message)
      // 如果后端处理失败，重新获取数据
      await fetchFriendLinks()
    }
  } catch (error: any) {
    console.error('拒绝友链失败:', error)
    // 如果发生错误，重新获取数据
    await fetchFriendLinks()
  }
}

// 删除友链
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个友链吗？')) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/friend-links/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    const data = await response.json()
    
    if (data.success) {
      showAlert('删除成功', 'success')
      await fetchFriendLinks()
    } else {
      throw new Error(data.message || '删除失败')
    }
  } catch (error: any) {
    console.error('删除友链失败:', error)
    showAlert(error.message || '删除失败，请重试', 'error')
  }
}

// 添加提示方法
const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // 这里可以使用你的提示组件
  console.log(`${type}: ${message}`)
}

onMounted(fetchFriendLinks)
</script>

<style scoped>
.social-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
  color: rgba(0, 162, 255, 0.9);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: rgba(0, 162, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: var(--primary-color-dark);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tab-container {
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 20px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 10px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  position: relative;
}

.tab-btn.active {
  color: rgba(0, 162, 255, 0.9);;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-color);
}

.count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.friend-links-container {
  margin-top: 20px;
}

.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.friend-card {
  position: relative;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.friend-card-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.friend-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-card-content {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  position: relative;
  z-index: 2;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.friend-info {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-details h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: var(--text-primary);
}

.friend-details p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.friend-actions {
  display: flex;
  gap: 10px;
}

.visit-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.visit-btn {
  border: solid 1px #22f8ff;
  background: var(--primary-color);
  margin-left: auto;
  color: white;
}

.visit-btn:hover {
  color: #22f8ff;
  background: var(--primary-color-dark);
}

.delete-btn {
  background: #ff5722;
  color: white;
}

.delete-btn:hover {
  background: #f4511e;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .friend-card {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .count {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .friend-card-content {
  border-top: 1px solid var(--border-color-dark);
}

.friend-links-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.category-section {
  background: rgba(255, 255, 255, 0.0);
  border-radius: 12px;
  padding: 20px;
}

.category-title {
  font-size: 20px;
  color: rgba(0, 162, 255, 0.9);
  margin-bottom: 20px;
  padding-left: 15px;
  border-left: 4px solid var(--primary-color);
}

.category-select {
  margin: 10px 0px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-select select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: rgba(14, 153, 196, 0.9);
  color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 24px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 16px;
}

.category-select select:focus {
  outline: none;
  border-color: #22f8ff;
  box-shadow: 0 0 0 2px rgba(34, 248, 255, 0.2);
}

.category-select select option {
  background: rgba(14, 153, 196, 0.9);
  color: white;
  padding: 8px;
}

.category-select select option:checked {
  background: rgba(0, 162, 255, 0.9) !important;
  color: white;
}

/* 使用 select 的 focus 状态下的 option 来模拟悬浮效果 */
.category-select select:focus option:hover,
.category-select select:focus option:focus {
  background: rgba(34, 248, 255, 0.7) !important;
  color: white;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .category-select select {
  background-color: rgba(20, 20, 20, 0.9);
  border-color: rgba(34, 248, 255, 0.3);
}

:root[class='dark-theme'] .category-select select option {
  background: rgba(20, 20, 20, 0.9);
}

:root[class='dark-theme'] .category-select select option:checked {
  background: rgba(34, 248, 255, 0.3) !important;
}

.action-buttons {
  border-radius: 12px;
  display: flex;
  width: calc(100% + 30px);  /* 补偿padding */
  margin: 15px -15px -15px -15px;  /* 抵消父元素padding */
}

.approve-btn,
.reject-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
  border: none;
  /* border-radius: 12px; */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  margin: 0;
}

.approve-btn {
  border-radius: 0 0 0 9.5px;
  background: rgba(14, 153, 196, 0.9);
}

.approve-btn:hover {
  background: rgba(76, 175, 80, 1);
}

.reject-btn {
  border-radius: 0 0 9.5px 0px;
  background: rgba(14, 153, 196, 0.9);
}

.reject-btn:hover {
  background: rgba(244, 67, 54, 1);
}

/* 暗色主题适配 */
:root[class='dark-theme'] .approve-btn {
  background: rgba(129, 199, 132, 0.9);
}

:root[class='dark-theme'] .approve-btn:hover {
  background: rgba(129, 199, 132, 1);
}

:root[class='dark-theme'] .reject-btn {
  background: rgba(229, 115, 115, 0.9);
}

:root[class='dark-theme'] .reject-btn:hover {
  background: rgba(229, 115, 115, 1);
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
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin: 0 0 20px;
  color: var(--text-primary);
}

.modal-body {
  margin-bottom: 20px;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .category-section {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .modal-content {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .modal-body textarea {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .cancel-btn {
  background: var(--bg-secondary-dark);
}
</style> 