<template>
  <div class="user-management-page">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchUsers">
          <Icon icon="mdi:refresh" :class="{ 'rotating': isLoading }" />
          刷新
        </button>
        <button class="add-btn" @click="showAddUserModal = true">
          <Icon icon="mdi:account-plus" />
          添加用户
        </button>
      </div>
    </div>

    <!-- 搜索过滤器 -->
    <div class="filters-container">
      <div class="search-box">
        <input
          type="text"
          v-model="filters.username"
          placeholder="搜索用户名..."
          @keyup.enter="applyFilters"
        />
        <button class="search-btn" @click="applyFilters">
          <Icon icon="mdi:magnify" />
        </button>
      </div>
      <div class="status-filter">
        <select v-model="filters.status" @change="applyFilters">
          <option value="">全部状态</option>
          <option v-for="(name, status) in statusNames" :key="status" :value="status">
            {{ name }}
          </option>
        </select>
      </div>
      <div class="page-size-selector">
        <span>每页显示：</span>
        <select v-model="pageSize" @change="applyFilters">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-container">
      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>头像</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>真实姓名</th>
              <th>注册时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" :class="{ 'admin-row': user.role === 'ROLE_ADMIN' }">
              <td>
                <img class="user-avatar" :src="user.avatar || '/default-avatar.png'" :alt="user.username" />
              </td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  {{ roleNames[user.role] }}
                </span>
              </td>
              <td>{{ user.realName || '-' }}</td>
              <td>{{ formatDate(user.createTime) }}</td>
              <td>
                <span class="status-badge" :class="getStatusBadgeClass(user.status)">
                  {{ statusNames[user.status] }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="showEditUser(user)">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button 
                    class="reset-pwd-btn" 
                    @click="resetUserPassword(user)"
                    :disabled="user.role === 'ROLE_ADMIN' && userInfo.role !== 'ROLE_ADMIN'"
                  >
                    <Icon icon="mdi:key" />
                  </button>
                  <button 
                    class="toggle-status-btn" 
                    :class="{ 'deactivate': user.status === 'NORMAL' }"
                    @click="showStatusChangeModal(user)"
                    :disabled="user.role === 'ROLE_ADMIN' && userInfo.role !== 'ROLE_ADMIN'"
                  >
                    <Icon icon="mdi:account-cog" />
                  </button>
                  <button 
                    class="delete-btn" 
                    @click="confirmDeleteUser(user)"
                    :disabled="user.role === 'ROLE_ADMIN' && userInfo.role !== 'ROLE_ADMIN'"
                  >
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 没有用户时显示 -->
      <div v-if="users.length === 0 && !isLoading" class="no-users">
        <Icon icon="mdi:account-off" class="no-users-icon" />
        <p>暂无用户数据</p>
      </div>
      
      <!-- 加载中 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container" v-if="totalPages > 0">
        <div class="pagination-info">
          共 {{ totalItems }} 条记录，第 {{ currentPage + 1 }}/{{ totalPages }} 页
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 0" 
            @click="changePage(0)"
          >
            <Icon icon="mdi:page-first" />
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 0" 
            @click="changePage(currentPage - 1)"
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="page-number" 
              :class="{ 'active': currentPage === page }"
              @click="changePage(page)"
            >
              {{ page + 1 }}
            </button>
          </div>
          
          <button 
            class="pagination-btn" 
            :disabled="currentPage >= totalPages - 1" 
            @click="changePage(currentPage + 1)"
          >
            <Icon icon="mdi:chevron-right" />
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage >= totalPages - 1" 
            @click="changePage(totalPages - 1)"
          >
            <Icon icon="mdi:page-last" />
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户对话框 -->
    <div class="modal" v-if="showAddUserModal || showEditUserModal" @click.self="closeUserModal">
      <div class="modal-content">
        <h3>{{ showEditUserModal ? '编辑用户' : '添加用户' }}</h3>
        <div class="modal-body">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="userForm.username" :disabled="showEditUserModal" />
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="userForm.email" />
          </div>
          <div class="form-group" v-if="showAddUserModal">
            <label for="password">密码 (留空则自动生成)</label>
            <input type="password" id="password" v-model="userForm.password" placeholder="留空将生成随机密码" />
          </div>
          <div class="form-group">
            <label for="role">角色</label>
            <select id="role" v-model="userForm.role" :disabled="currentUser?.role === 'ROLE_ADMIN' && userInfo.role !== 'ROLE_ADMIN'">
              <option v-for="(name, role) in roleNames" :key="role" :value="role">{{ name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="realName">真实姓名</label>
            <input type="text" id="realName" v-model="userForm.realName" placeholder="选填" />
          </div>
          <div class="form-group">
            <label for="phoneNumber">手机号码</label>
            <input type="text" id="phoneNumber" v-model="userForm.phoneNumber" placeholder="选填" />
          </div>
          <div class="form-group">
            <label for="remark">备注</label>
            <textarea id="remark" v-model="userForm.remark" placeholder="选填" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="avatar">头像URL</label>
            <input type="text" id="avatar" v-model="userForm.avatar" placeholder="留空使用默认头像" />
            <div class="avatar-preview">
              <img :src="userForm.avatar || '/default-avatar.png'" alt="头像预览" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeUserModal">取消</button>
          <button 
            class="confirm-btn" 
            @click="showEditUserModal ? updateUser() : addUser()"
            :disabled="!userForm.username || !userForm.email || (showAddUserModal && !userForm.password)"
          >
            {{ showEditUserModal ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div class="modal" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-content">
        <h3>删除用户</h3>
        <div class="modal-body">
          <p>确定要删除用户 <strong>{{ currentUser?.username }}</strong> 吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteConfirm = false">取消</button>
          <button class="delete-confirm-btn" @click="deleteUser">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 重置密码确认对话框 -->
    <div class="modal" v-if="showResetPasswordConfirm" @click.self="showResetPasswordConfirm = false">
      <div class="modal-content">
        <h3>重置密码</h3>
        <div class="modal-body">
          <p>确定要重置用户 <strong>{{ currentUser?.username }}</strong> 的密码吗？</p>
          <p>系统将生成一个新的随机密码。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showResetPasswordConfirm = false">取消</button>
          <button class="confirm-btn" @click="confirmResetPassword">确认重置</button>
        </div>
      </div>
    </div>

    <!-- 修改状态确认对话框 -->
    <div class="modal" v-if="showChangeStatusModal" @click.self="showChangeStatusModal = false">
      <div class="modal-content">
        <h3>修改用户状态</h3>
        <div class="modal-body">
          <p>当前用户：<strong>{{ currentUser?.username }}</strong></p>
          <div class="form-group">
            <label for="new-status">新状态</label>
            <select id="new-status" v-model="newStatus">
              <option v-for="(name, status) in statusNames" :key="status" :value="status">
                {{ name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showChangeStatusModal = false">取消</button>
          <button class="confirm-btn" @click="changeUserStatus">确认修改</button>
        </div>
      </div>
    </div>

    <!-- 新密码展示对话框 -->
    <div class="modal" v-if="showNewPasswordModal" @click.self="showNewPasswordModal = false">
      <div class="modal-content">
        <h3>密码已重置</h3>
        <div class="modal-body">
          <p>用户 <strong>{{ currentUser?.username }}</strong> 的密码已重置。</p>
          <div class="new-password-container">
            <span>新密码：</span>
            <div class="password-display">
              <span v-if="showPassword">{{ newPassword }}</span>
              <span v-else>••••••••••••</span>
              <button class="toggle-password-btn" @click="showPassword = !showPassword">
                <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
              </button>
            </div>
            <button class="copy-password-btn" @click="copyPassword">
              <Icon icon="mdi:content-copy" />
              复制密码
            </button>
          </div>
          <p class="password-warning">请记录此密码，关闭此窗口后将无法再次查看！</p>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="showNewPasswordModal = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user'

interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
  avatar: string
  phoneNumber?: string
  realName?: string
  remark?: string
  createTime: string
  updateTime: string
  lastLoginTime?: string
}

const userStore = useUserStore()
const users = ref<User[]>([])
const isLoading = ref(false)
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteConfirm = ref(false)
const showResetPasswordConfirm = ref(false)
const showChangeStatusModal = ref(false)
const showNewPasswordModal = ref(false)
const currentUser = ref<User | null>(null)
const newPassword = ref('')
const showPassword = ref(false)
const newStatus = ref('')

// 分页相关
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalItems = ref(0)

// 过滤条件
const filters = ref({
  username: '',
  status: ''
})

// 用户表单
const userForm = ref({
  id: 0,
  username: '',
  email: '',
  password: '',
  role: 'ROLE_USER',
  avatar: '',
  phoneNumber: '',
  realName: '',
  remark: '',
  status: 'NORMAL'
})

// 用户信息
const userInfo = computed(() => userStore.userInfo || {
  username: '',
  role: ''
})

// 角色名称映射
const roleNames: Record<string, string> = {
  'ROLE_ADMIN': '管理员',
  'ROLE_EDITOR': '编辑',
  'ROLE_USER': '普通用户'
}

// 状态名称映射
const statusNames: Record<string, string> = {
  'NORMAL': '正常',
  'PENDING': '待审核',
  'LOCKED': '锁定',
  'BANNED': '封禁',
  'DELETED': '注销'
}

// 计算要显示的页码数组
const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5 // 最多显示的页码数量
  
  let start = Math.max(0, currentPage.value - Math.floor(maxPagesToShow / 2))
  let end = Math.min(start + maxPagesToShow - 1, totalPages.value - 1)
  
  // 调整start，确保显示maxPagesToShow个页码
  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(0, end - maxPagesToShow + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 根据角色获取对应的徽章类名
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'ROLE_ADMIN':
      return 'admin-badge'
    case 'ROLE_EDITOR':
      return 'moderator-badge'
    default:
      return 'user-badge'
  }
}

// 根据状态获取对应的徽章类名
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'NORMAL':
      return 'active'
    case 'PENDING':
      return 'pending'
    case 'LOCKED':
      return 'locked'
    case 'BANNED':
      return 'banned'
    case 'DELETED':
      return 'deleted'
    default:
      return ''
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取用户数据
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      size: pageSize.value.toString()
    })
    
    if (filters.value.username) {
      queryParams.append('username', filters.value.username)
    }
    
    if (filters.value.status) {
      queryParams.append('status', filters.value.status)
    }
    
    const response = await fetch(`http://localhost:8088/api/admin/users?${queryParams.toString()}`, {
      credentials: 'include'
    })
    const data = await response.json()
    
    if (data.success) {
      users.value = data.data.users || []
      totalItems.value = data.data.totalItems || 0
      totalPages.value = data.data.totalPages || 0
      console.log('用户列表:', users.value)
    } else {
      throw new Error(data.message || '获取用户失败')
    }
  } catch (error: any) {
    console.error('获取用户失败:', error)
    alert('获取用户失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 切换页码
const changePage = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

// 应用过滤器
const applyFilters = () => {
  currentPage.value = 0 // 重置为第一页
  fetchUsers()
}

// 显示编辑用户对话框
const showEditUser = (user: User) => {
  currentUser.value = user
  userForm.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    avatar: user.avatar || '',
    phoneNumber: user.phoneNumber || '',
    realName: user.realName || '',
    remark: user.remark || '',
    status: user.status
  }
  showEditUserModal.value = true
}

// 关闭用户对话框
const closeUserModal = () => {
  showAddUserModal.value = false
  showEditUserModal.value = false
  currentUser.value = null
  userForm.value = {
    id: 0,
    username: '',
    email: '',
    password: '',
    role: 'ROLE_USER',
    avatar: '',
    phoneNumber: '',
    realName: '',
    remark: '',
    status: 'NORMAL'
  }
}

// 添加用户
const addUser = async () => {
  try {
    const response = await fetch('http://localhost:8088/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password || undefined, // 如果为空则不发送此字段
        role: userForm.value.role,
        phoneNumber: userForm.value.phoneNumber || undefined,
        realName: userForm.value.realName || undefined,
        remark: userForm.value.remark || undefined,
        avatar: userForm.value.avatar || undefined
      })
    })
    
    const data = await response.json()
    if (data.success) {
      // 如果返回了自动生成的密码
      if (data.data && data.data.password) {
        currentUser.value = { ...data.data }
        newPassword.value = data.data.password
        showNewPasswordModal.value = true
      } else {
        alert('添加用户成功')
      }
      
      closeUserModal()
      await fetchUsers()
    } else {
      throw new Error(data.message || '添加用户失败')
    }
  } catch (error: any) {
    console.error('添加用户失败:', error)
    alert('添加用户失败，请重试')
  }
}

// 更新用户
const updateUser = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/admin/users/${currentUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userForm.value.email,
        role: userForm.value.role,
        phoneNumber: userForm.value.phoneNumber || undefined,
        realName: userForm.value.realName || undefined,
        remark: userForm.value.remark || undefined,
        avatar: userForm.value.avatar || undefined
      })
    })
    
    const data = await response.json()
    if (data.success) {
      alert('更新用户成功')
      closeUserModal()
      await fetchUsers()
    } else {
      throw new Error(data.message || '更新用户失败')
    }
  } catch (error: any) {
    console.error('更新用户失败:', error)
    alert('更新用户失败，请重试')
  }
}

// 显示状态修改对话框
const showStatusChangeModal = (user: User) => {
  currentUser.value = user
  newStatus.value = user.status
  showChangeStatusModal.value = true
}

// 修改用户状态
const changeUserStatus = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/admin/users/${currentUser.value.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        status: newStatus.value
      })
    })
    
    const data = await response.json()
    if (data.success) {
      alert(`用户状态修改成功`)
      showChangeStatusModal.value = false
      await fetchUsers()
    } else {
      throw new Error(data.message || '修改用户状态失败')
    }
  } catch (error: any) {
    console.error('修改用户状态失败:', error)
    alert('修改用户状态失败，请重试')
  }
}

// 重置用户密码弹窗
const resetUserPassword = (user: User) => {
  currentUser.value = user
  showResetPasswordConfirm.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/admin/users/${currentUser.value.id}/reset-password`, {
      method: 'POST',
      credentials: 'include'
    })
    
    const data = await response.json()
    if (data.success) {
      showResetPasswordConfirm.value = false
      newPassword.value = data.data
      showPassword.value = true
      showNewPasswordModal.value = true
    } else {
      throw new Error(data.message || '重置密码失败')
    }
  } catch (error: any) {
    console.error('重置密码失败:', error)
    alert('重置密码失败，请重试')
    showResetPasswordConfirm.value = false
  }
}

// 复制新密码到剪贴板
const copyPassword = () => {
  navigator.clipboard.writeText(newPassword.value)
    .then(() => {
      alert('密码已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    })
}

// 确认删除用户
const confirmDeleteUser = (user: User) => {
  currentUser.value = user
  showDeleteConfirm.value = true
}

// 删除用户
const deleteUser = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch(`http://localhost:8088/api/admin/users/${currentUser.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    const data = await response.json()
    if (data.success) {
      alert('删除用户成功')
      showDeleteConfirm.value = false
      currentUser.value = null
      await fetchUsers()
    } else {
      throw new Error(data.message || '删除用户失败')
    }
  } catch (error: any) {
    console.error('删除用户失败:', error)
    alert('删除用户失败，请重试')
  }
}

onMounted(fetchUsers)

// 监听过滤器变化
watch([pageSize], () => {
  applyFilters()
})
</script>

<style scoped>
.user-management-page {
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

.refresh-btn, .add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover, .add-btn:hover {
  background: var(--primary-color-dark);
}

.add-btn {
  background: rgba(76, 175, 80, 0.9);
}

.add-btn:hover {
  background: rgba(76, 175, 80, 1);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.users-container {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  min-height: 300px;
}

.users-table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.users-table th {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.users-table tr:hover {
  background: var(--bg-hover);
}

.admin-row {
  background: rgba(0, 162, 255, 0.05);
}

.admin-row:hover {
  background: rgba(0, 162, 255, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge, .status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.admin-badge {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.moderator-badge {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.user-badge {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-badge {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .toggle-status-btn, .delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.toggle-status-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.toggle-status-btn.deactivate:hover {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.edit-btn:disabled, .toggle-status-btn:disabled, .delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.no-users-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.avatar-preview {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.avatar-preview img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn, .delete-confirm-btn {
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

.delete-confirm-btn {
  background: #f44336;
  color: white;
}

.confirm-btn:disabled, .delete-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-table-wrapper {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 700px;
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .users-container {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .users-table th {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .loading-container {
  background: rgba(30, 30, 30, 0.8);
}

:root[class='dark-theme'] .modal-content {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .form-group input, 
:root[class='dark-theme'] .form-group select {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .cancel-btn {
  background: var(--bg-secondary-dark);
}

/* 添加新的CSS样式 */
.filters-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 200px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px 0 0 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-btn {
  padding: 8px 12px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.status-filter select, .page-size-selector select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
}

.page-number:hover {
  background: var(--bg-hover);
}

.page-number.active {
  background: var(--primary-color);
  color: white;
}

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
}

.new-password-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 20px 0;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.password-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-family: monospace;
  font-size: 16px;
}

.toggle-password-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.copy-password-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.copy-password-btn:hover {
  background: var(--primary-color-dark);
}

.password-warning {
  color: #ff5722;
  font-size: 14px;
  margin-top: 12px;
}

.reset-pwd-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-pwd-btn:hover {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

/* 状态徽章样式 */
.status-badge.pending {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.status-badge.locked {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.status-badge.banned {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.status-badge.deleted {
  background: rgba(97, 97, 97, 0.1);
  color: #616161;
}

/* 暗色主题适配 */
:root[class='dark-theme'] .search-box input,
:root[class='dark-theme'] .status-filter select,
:root[class='dark-theme'] .page-size-selector select,
:root[class='dark-theme'] .form-group textarea {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .pagination-btn,
:root[class='dark-theme'] .page-number {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .new-password-container {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .password-display {
  background: var(--bg-primary-dark);
  border-color: var(--border-color-dark);
}
</style> 