<template>
  <div class="messages-page">
    <div class="page-header">
      <h1>消息管理</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchMessages">
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
          :class="{ active: currentTab === 'comments' }"
          @click="currentTab = 'comments'"
        >
          文章评论
          <span class="count">{{ comments.length }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'messages' }"
          @click="currentTab = 'messages'"
        >
          留言板
          <span class="count">{{ boardMessages.length }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'notifications' }"
          @click="currentTab = 'notifications'"
        >
          通知
          <span class="count">{{ notifications.length }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'bulletChats' }"
          @click="currentTab = 'bulletChats'"
        >
          树洞弹幕
          <span class="count">{{ bulletChats.length }}</span>
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container">
      <!-- 文章评论列表 -->
      <div v-if="currentTab === 'comments'" class="message-list">
        <div v-for="comment in displayedComments" :key="comment.id" class="message-card">
          <div class="message-header">
            <div class="user-info">
              <img :src="comment.user.avatar || '/avatars/default-avatar.png'" class="user-avatar" :alt="comment.user.username" />
              <div>
                <div class="username">{{ comment.user.username }}</div>
                <div class="message-time">{{ formatDate(comment.createdAt) }}</div>
              </div>
            </div>
            <div class="article-info">
              <Icon icon="mdi:file-document-outline" />
              <a :href="`/article/${comment.article.id}`" target="_blank">{{ comment.article.title }}</a>
            </div>
          </div>
          <div class="message-content">{{ comment.content }}</div>
          <div class="message-actions">
            <button class="reply-btn" @click="showReplyDialog(comment)">
              <Icon icon="mdi:reply" />
              回复
            </button>
            <button class="delete-btn" @click="confirmDeleteMessage(comment, 'comment')">
              <Icon icon="mdi:delete" />
              删除
            </button>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="comments.length > pageSize" class="pagination-controls">
          <div class="pagination-info">{{ currentPage }} / {{ Math.ceil(comments.length / pageSize) }}</div>
          <div class="page-navigation">
            <div class="page-buttons">
              <button 
                class="page-btn" 
                @click="goToPage(1, comments.length)"
                :disabled="currentPage <= 1"
                title="第一页"
              >
                <Icon icon="mdi:page-first" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage - 1, comments.length)" 
                :disabled="currentPage <= 1"
                title="上一页"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <button 
                v-for="page in getPaginationRange(Math.ceil(comments.length / pageSize))" 
                :key="page"
                class="page-btn" 
                :class="{ active: currentPage === page }"
                @click="goToPage(page, comments.length)"
              >
                {{ page }}
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage + 1, comments.length)" 
                :disabled="currentPage >= Math.ceil(comments.length / pageSize)"
                title="下一页"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(Math.ceil(comments.length / pageSize), comments.length)"
                :disabled="currentPage >= Math.ceil(comments.length / pageSize)"
                title="最后一页"
              >
                <Icon icon="mdi:page-last" />
              </button>
            </div>
            <div class="page-jumper">
              <span>跳转到</span>
              <input 
                type="number" 
                v-model="tempPage" 
                min="1" 
                :max="Math.ceil(comments.length / pageSize)"
                @keydown.enter="goToPage(Number(tempPage) || 1, comments.length)"
              />
              <span>页</span>
              <button 
                class="jump-btn"
                @click="goToPage(Number(tempPage) || 1, comments.length)"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        
        <!-- 没有消息时显示 -->
        <div v-if="comments.length === 0 && !isLoading" class="no-messages">
          <Icon icon="mdi:message-off" class="no-messages-icon" />
          <p>暂无评论消息</p>
        </div>
      </div>

      <!-- 留言板列表 -->
      <div v-if="currentTab === 'messages'" class="message-list">
        <div v-for="message in displayedBoardMessages" :key="message.id" class="message-card">
          <div class="message-header">
            <div class="user-info">
              <img :src="message.user.avatar || '/avatars/default-avatar.png'" class="user-avatar" :alt="message.user.username" />
              <div>
                <div class="username">{{ message.user.username }}</div>
                <div class="message-time">{{ formatDate(message.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="message-actions">
            <button class="reply-btn" @click="showReplyDialog(message)">
              <Icon icon="mdi:reply" />
              回复
            </button>
            <button class="delete-btn" @click="confirmDeleteMessage(message, 'message')">
              <Icon icon="mdi:delete" />
              删除
            </button>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="boardMessages.length > pageSize" class="pagination-controls">
          <div class="pagination-info">{{ currentPage }} / {{ Math.ceil(boardMessages.length / pageSize) }}</div>
          <div class="page-navigation">
            <div class="page-buttons">
              <button 
                class="page-btn" 
                @click="goToPage(1, boardMessages.length)"
                :disabled="currentPage <= 1"
                title="第一页"
              >
                <Icon icon="mdi:page-first" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage - 1, boardMessages.length)" 
                :disabled="currentPage <= 1"
                title="上一页"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <button 
                v-for="page in getPaginationRange(Math.ceil(boardMessages.length / pageSize))" 
                :key="page"
                class="page-btn" 
                :class="{ active: currentPage === page }"
                @click="goToPage(page, boardMessages.length)"
              >
                {{ page }}
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage + 1, boardMessages.length)" 
                :disabled="currentPage >= Math.ceil(boardMessages.length / pageSize)"
                title="下一页"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(Math.ceil(boardMessages.length / pageSize), boardMessages.length)"
                :disabled="currentPage >= Math.ceil(boardMessages.length / pageSize)"
                title="最后一页"
              >
                <Icon icon="mdi:page-last" />
              </button>
            </div>
            <div class="page-jumper">
              <span>跳转到</span>
              <input 
                type="number" 
                v-model="tempPage" 
                min="1" 
                :max="Math.ceil(boardMessages.length / pageSize)"
                @keydown.enter="goToPage(Number(tempPage) || 1, boardMessages.length)"
              />
              <span>页</span>
              <button 
                class="jump-btn"
                @click="goToPage(Number(tempPage) || 1, boardMessages.length)"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        
        <!-- 没有消息时显示 -->
        <div v-if="boardMessages.length === 0 && !isLoading" class="no-messages">
          <Icon icon="mdi:message-off" class="no-messages-icon" />
          <p>暂无留言板消息</p>
        </div>
      </div>

      <!-- 通知列表 -->
      <div v-if="currentTab === 'notifications'" class="message-list">
        <div v-for="notification in displayedNotifications" :key="notification.id" class="message-card">
          <div class="message-header">
            <div class="notification-info">
              <div class="notification-icon" :class="notification.type">
                <Icon :icon="getNotificationIcon(notification.type)" />
              </div>
              <div>
                <div class="notification-title">{{ notification.title }}</div>
                <div class="message-time">{{ formatDate(notification.createdAt) }}</div>
              </div>
            </div>
            <div class="notification-status" :class="{ read: notification.read }">
              {{ notification.read ? '已读' : '未读' }}
            </div>
          </div>
          <div class="message-content">{{ notification.content }}</div>
          <div class="message-actions">
            <button 
              v-if="!notification.read" 
              class="mark-read-btn" 
              @click="markAsRead(notification)"
            >
              <Icon icon="mdi:check" />
              标记为已读
            </button>
            <button class="delete-btn" @click="confirmDeleteMessage(notification, 'notification')">
              <Icon icon="mdi:delete" />
              删除
            </button>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="notifications.length > pageSize" class="pagination-controls">
          <div class="pagination-info">{{ currentPage }} / {{ Math.ceil(notifications.length / pageSize) }}</div>
          <div class="page-navigation">
            <div class="page-buttons">
              <button 
                class="page-btn" 
                @click="goToPage(1, notifications.length)"
                :disabled="currentPage <= 1"
                title="第一页"
              >
                <Icon icon="mdi:page-first" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage - 1, notifications.length)" 
                :disabled="currentPage <= 1"
                title="上一页"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <button 
                v-for="page in getPaginationRange(Math.ceil(notifications.length / pageSize))" 
                :key="page"
                class="page-btn" 
                :class="{ active: currentPage === page }"
                @click="goToPage(page, notifications.length)"
              >
                {{ page }}
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage + 1, notifications.length)" 
                :disabled="currentPage >= Math.ceil(notifications.length / pageSize)"
                title="下一页"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(Math.ceil(notifications.length / pageSize), notifications.length)"
                :disabled="currentPage >= Math.ceil(notifications.length / pageSize)"
                title="最后一页"
              >
                <Icon icon="mdi:page-last" />
              </button>
            </div>
            <div class="page-jumper">
              <span>跳转到</span>
              <input 
                type="number" 
                v-model="tempPage" 
                min="1" 
                :max="Math.ceil(notifications.length / pageSize)"
                @keydown.enter="goToPage(Number(tempPage) || 1, notifications.length)"
              />
              <span>页</span>
              <button 
                class="jump-btn"
                @click="goToPage(Number(tempPage) || 1, notifications.length)"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        
        <!-- 没有消息时显示 -->
        <div v-if="notifications.length === 0 && !isLoading" class="no-messages">
          <Icon icon="mdi:bell-off" class="no-messages-icon" />
          <p>暂无通知消息</p>
        </div>
      </div>

      <!-- 树洞弹幕列表 -->
      <div v-if="currentTab === 'bulletChats'" class="message-list">
        <div class="bullet-chat-filters">
          <div class="filter-group">
            <label>状态过滤：</label>
            <select v-model="bulletChatStatusFilter" @change="fetchBulletChats">
              <option value="all">全部</option>
              <option value="APPROVED">已通过</option>
              <option value="REJECTED">隐藏</option>
              <option value="PENDING">待审核</option>
            </select>
          </div>
          <button class="add-bullet-btn" @click="showAddBulletModal = true">
            <Icon icon="mdi:message-plus" />
            添加弹幕
          </button>
        </div>
        
        <div v-for="bullet in displayedBulletChats" :key="bullet.bulletId" class="message-card bullet-chat-card">
          <div class="message-header">
            <div class="user-info">
              <img :src="bullet.avatar || '/avatars/default-avatar.png'" class="user-avatar" alt="用户头像" />
              <div>
                <div class="username">弹幕 #{{ bullet.bulletId }}</div>
                <div class="message-time">{{ formatDate(bullet.cratetime) }}</div>
              </div>
            </div>
            <div class="bullet-status" :class="bullet.status">
              {{ getBulletStatusText(bullet.status) }}
            </div>
          </div>
          <div class="message-content">{{ bullet.content }}</div>
          <div class="message-actions">
            <button class="edit-btn" @click="showEditBulletDialog(bullet)">
              <Icon icon="mdi:pencil" />
              编辑
            </button>
            <button 
              v-if="bullet.status !== 'APPROVED'" 
              class="activate-btn" 
              @click="updateBulletStatus(bullet.bulletId, 'APPROVED')"
            >
              <Icon icon="mdi:eye" />
              显示
            </button>
            <button 
              v-if="bullet.status !== 'REJECTED'" 
              class="hide-btn" 
              @click="updateBulletStatus(bullet.bulletId, 'REJECTED')"
            >
              <Icon icon="mdi:eye-off" />
              隐藏
            </button>
            <button class="delete-btn" @click="confirmDeleteBullet(bullet)">
              <Icon icon="mdi:delete" />
              删除
            </button>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="bulletChats.length > pageSize" class="pagination-controls">
          <div class="pagination-info">{{ currentPage }} / {{ Math.ceil(bulletChats.length / pageSize) }}</div>
          <div class="page-navigation">
            <div class="page-buttons">
              <button 
                class="page-btn" 
                @click="goToPage(1, bulletChats.length)"
                :disabled="currentPage <= 1"
                title="第一页"
              >
                <Icon icon="mdi:page-first" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage - 1, bulletChats.length)" 
                :disabled="currentPage <= 1"
                title="上一页"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <button 
                v-for="page in getPaginationRange(Math.ceil(bulletChats.length / pageSize))" 
                :key="page"
                class="page-btn" 
                :class="{ active: currentPage === page }"
                @click="goToPage(page, bulletChats.length)"
              >
                {{ page }}
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(currentPage + 1, bulletChats.length)" 
                :disabled="currentPage >= Math.ceil(bulletChats.length / pageSize)"
                title="下一页"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
              <button 
                class="page-btn" 
                @click="goToPage(Math.ceil(bulletChats.length / pageSize), bulletChats.length)"
                :disabled="currentPage >= Math.ceil(bulletChats.length / pageSize)"
                title="最后一页"
              >
                <Icon icon="mdi:page-last" />
              </button>
            </div>
            <div class="page-jumper">
              <span>跳转到</span>
              <input 
                type="number" 
                v-model="tempPage" 
                min="1" 
                :max="Math.ceil(bulletChats.length / pageSize)"
                @keydown.enter="goToPage(Number(tempPage) || 1, bulletChats.length)"
              />
              <span>页</span>
              <button 
                class="jump-btn"
                @click="goToPage(Number(tempPage) || 1, bulletChats.length)"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        
        <!-- 没有弹幕时显示 -->
        <div v-if="bulletChats.length === 0 && !isLoading" class="no-messages">
          <Icon icon="mdi:message-text-outline" class="no-messages-icon" />
          <p>暂无树洞弹幕</p>
        </div>
      </div>
      
      <!-- 加载中 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 回复对话框 -->
    <div class="modal" v-if="showReplyModal" @click.self="showReplyModal = false">
      <div class="modal-content">
        <h3>回复消息</h3>
        <div class="modal-body">
          <div class="reply-to">
            <strong>回复给：</strong> {{ currentMessage?.user?.username }}
          </div>
          <div class="original-message">
            <strong>原消息：</strong> {{ currentMessage?.content }}
          </div>
          <div class="form-group">
            <textarea 
              v-model="replyContent" 
              placeholder="输入回复内容..." 
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showReplyModal = false">取消</button>
          <button 
            class="confirm-btn" 
            @click="sendReply" 
            :disabled="!replyContent.trim()"
          >
            发送回复
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div class="modal" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-content">
        <h3>删除消息</h3>
        <div class="modal-body">
          <p>确定要删除这条消息吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteConfirm = false">取消</button>
          <button class="delete-confirm-btn" @click="deleteMessage">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 添加弹幕对话框 -->
    <div class="modal" v-if="showAddBulletModal" @click.self="showAddBulletModal = false">
      <div class="modal-content">
        <h3>添加新弹幕</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>弹幕内容</label>
            <textarea 
              v-model="newBulletChat.content" 
              placeholder="输入弹幕内容..." 
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label>头像URL</label>
            <div class="avatar-input-group">
              <input 
                type="text" 
                v-model="newBulletChat.avatar" 
                placeholder="输入头像URL（可选）" 
              />
              <button class="default-avatar-btn" @click="newBulletChat.avatar = '/avatars/default-avatar.png'">
                默认头像
              </button>
            </div>
            <div class="avatar-preview" v-if="newBulletChat.avatar">
              <img :src="newBulletChat.avatar" alt="头像预览" />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="newBulletChat.status">
              <option value="APPROVED">已通过</option>
              <option value="REJECTED">隐藏</option>
              <option value="PENDING">待审核</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddBulletModal = false">取消</button>
          <button 
            class="confirm-btn" 
            @click="addBulletChat" 
            :disabled="!newBulletChat.content.trim()"
          >
            添加弹幕
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑弹幕对话框 -->
    <div class="modal" v-if="showEditBulletModal" @click.self="showEditBulletModal = false">
      <div class="modal-content">
        <h3>编辑弹幕</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>弹幕内容</label>
            <textarea 
              v-model="editingBulletChat.content" 
              placeholder="输入弹幕内容..." 
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label>头像URL</label>
            <div class="avatar-input-group">
              <input 
                type="text" 
                v-model="editingBulletChat.avatar" 
                placeholder="输入头像URL（可选）" 
              />
              <button class="default-avatar-btn" @click="editingBulletChat.avatar = '/avatars/default-avatar.png'">
                默认头像
              </button>
            </div>
            <div class="avatar-preview" v-if="editingBulletChat.avatar">
              <img :src="editingBulletChat.avatar" alt="头像预览" />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="editingBulletChat.status">
              <option value="APPROVED">已通过</option>
              <option value="REJECTED">隐藏</option>
              <option value="PENDING">待审核</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showEditBulletModal = false">取消</button>
          <button 
            class="confirm-btn" 
            @click="updateBulletChat" 
            :disabled="!editingBulletChat.content.trim()"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { type BulletChat as ImportedBulletChat, getBulletChatsByStatus, updateBulletChat as updateBulletChatAPI, deleteBulletChat } from '../../data/bulletChats'
import { config } from '../../config/index'

// 消息类型接口
interface User {
  id: number
  username: string
  avatar: string
}

interface Article {
  id: number
  title: string
  slug: string
}

interface Comment {
  id: number
  content: string
  createdAt: string
  user: User
  article: Article
}

interface BoardMessage {
  id: number
  content: string
  createdAt: string
  user: User
}

interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  createdAt: string
}

// 本地使用的BulletChat接口，确保与导入的类型兼容
interface BulletChat {
  bulletId: number
  content: string
  cratetime: string | Date
  avatar?: string
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
}

// 状态变量
const isLoading = ref(false)
const currentTab = ref<'comments' | 'messages' | 'notifications' | 'bulletChats'>('comments')
const comments = ref<Comment[]>([])
const boardMessages = ref<BoardMessage[]>([])
const notifications = ref<Notification[]>([])
const bulletChats = ref<BulletChat[]>([])
const currentPage = ref(1)
const pageSize = 10
const tempPage = ref(1) // 临时输入的页码

// 回复相关
const showReplyModal = ref(false)
const replyContent = ref('')
const currentMessage = ref<Comment | BoardMessage | null>(null)

// 删除相关
const showDeleteConfirm = ref(false)
const messageToDelete = ref<any>(null)
const messageTypeToDelete = ref<'comment' | 'message' | 'notification' | 'bullet'>('comment')

// 添加弹幕相关
const showAddBulletModal = ref(false)
const newBulletChat = ref<BulletChat>({
  bulletId: 0,
  content: '',
  cratetime: '',
  avatar: '',
  status: 'APPROVED'
})

// 编辑弹幕相关
const showEditBulletModal = ref(false)
const editingBulletChat = ref<BulletChat>({
  bulletId: 0,
  content: '',
  cratetime: '',
  avatar: '',
  status: 'APPROVED'
})

// 弹幕状态过滤
const bulletChatStatusFilter = ref<'all' | 'APPROVED' | 'REJECTED' | 'PENDING'>('all')

// 分页后的数据
const displayedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return comments.value.slice(start, end)
})

const displayedBoardMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return boardMessages.value.slice(start, end)
})

const displayedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return notifications.value.slice(start, end)
})

const displayedBulletChats = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return bulletChats.value.slice(start, end)
})

// 获取通知图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info':
      return 'mdi:information'
    case 'warning':
      return 'mdi:alert'
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    default:
      return 'mdi:bell'
  }
}

// 格式化日期
const formatDate = (dateString: string | Date) => {
  try {
    // 如果是字符串且包含微秒部分，先处理日期格式
    if (typeof dateString === 'string') {
      // 标准化ISO格式，处理可能的微秒部分
      const normalizedDateString = dateString.replace(/\.\d+/, '');
      dateString = new Date(normalizedDateString);
    }
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('无效日期格式:', dateString);
      return '无效日期';
    }
    
    // 格式化为 YYYY-MM-DD HH:MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    console.error('日期格式化错误:', error, dateString);
    return '日期错误';
  }
}

// 显示回复对话框
const showReplyDialog = (message: Comment | BoardMessage) => {
  currentMessage.value = message
  replyContent.value = ''
  showReplyModal.value = true
}

// 发送回复
const sendReply = async () => {
  if (!currentMessage.value || !replyContent.value.trim()) return
  
  try {
    const isComment = 'article' in currentMessage.value
    
    const url = isComment 
      ? `${config.api.apiUrl}/comments/${currentMessage.value.id}/reply`
      : `${config.api.apiUrl}/messages/${currentMessage.value.id}/reply`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        content: replyContent.value
      })
    })
    
    const data = await response.json()
    if (data.success) {
      showAlert('回复发送成功', 'success')
      showReplyModal.value = false
      
      // 重新获取消息列表
      await fetchMessages()
    } else {
      throw new Error(data.message || '回复发送失败')
    }
  } catch (error: any) {
    console.error('回复发送失败:', error)
    showAlert(error.message || '回复发送失败，请重试', 'error')
  }
}

// 确认删除消息
const confirmDeleteMessage = (message: any, type: 'comment' | 'message' | 'notification' | 'bullet') => {
  messageToDelete.value = message
  messageTypeToDelete.value = type
  showDeleteConfirm.value = true
}

// 删除消息
const deleteMessage = async () => {
  if (!messageToDelete.value) return
  
  try {
    let url = ''
    let success = false
    
    switch (messageTypeToDelete.value) {
      case 'comment':
        url = `${config.api.apiUrl}/comments/${messageToDelete.value.id}`
        break
      case 'message':
        url = `${config.api.apiUrl}/messages/${messageToDelete.value.id}`
        break
      case 'notification':
        url = `${config.api.apiUrl}/notifications/${messageToDelete.value.id}`
        break
      case 'bullet':
        success = await deleteBulletChat(messageToDelete.value.bulletId)
        break
    }
    
    if (messageTypeToDelete.value !== 'bullet') {
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const data = await response.json()
      success = data.success
    }
    
    if (success) {
      showAlert('删除成功', 'success')
      showDeleteConfirm.value = false
      
      // 更新本地数据
      if (messageTypeToDelete.value === 'comment') {
        comments.value = comments.value.filter(item => item.id !== messageToDelete.value.id)
      } else if (messageTypeToDelete.value === 'message') {
        boardMessages.value = boardMessages.value.filter(item => item.id !== messageToDelete.value.id)
      } else if (messageTypeToDelete.value === 'notification') {
        notifications.value = notifications.value.filter(item => item.id !== messageToDelete.value.id)
      } else if (messageTypeToDelete.value === 'bullet') {
        bulletChats.value = bulletChats.value.filter(item => item.bulletId !== messageToDelete.value.bulletId)
      }
      
      messageToDelete.value = null
    } else {
      throw new Error('删除失败')
    }
  } catch (error: any) {
    console.error('删除失败:', error)
    showAlert(error.message || '删除失败，请重试', 'error')
  }
}

// 标记通知为已读
const markAsRead = async (notification: Notification) => {
  try {
    const response = await fetch(`${config.api.apiUrl}/notifications/${notification.id}/read`, {
      method: 'PUT',
      credentials: 'include'
    })
    
    const data = await response.json()
    if (data.success) {
      // 更新本地数据
      notification.read = true
      showAlert('标记已读成功', 'success')
    } else {
      throw new Error(data.message || '标记已读失败')
    }
  } catch (error: any) {
    console.error('标记已读失败:', error)
    showAlert(error.message || '标记已读失败，请重试', 'error')
  }
}

// 获取所有消息
const fetchMessages = async () => {
  isLoading.value = true
  
  try {
    // 获取评论
    const commentsResponse = await fetch(`${config.api.apiUrl}/comments`, {
      credentials: 'include'
    })
    const commentsData = await commentsResponse.json()
    
    if (commentsData.success) {
      comments.value = commentsData.data || []
    }
    
    // 获取留言板消息
    const messagesResponse = await fetch(`${config.api.apiUrl}/messages`, {
      credentials: 'include'
    })
    const messagesData = await messagesResponse.json()
    
    if (messagesData.success) {
      boardMessages.value = messagesData.data || []
    }
    
    // 获取通知
    const notificationsResponse = await fetch(`${config.api.apiUrl}/notifications`, {
      credentials: 'include'
    })
    const notificationsData = await notificationsResponse.json()
    
    if (notificationsData.success) {
      notifications.value = notificationsData.data || []
    }
    
    // 获取树洞弹幕
    await fetchBulletChats()
  } catch (error: any) {
    console.error('获取消息失败:', error)
    showAlert(error.message || '获取消息失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 监听标签页变化重置分页
watch(currentTab, () => {
  currentPage.value = 1
})

// 显示提示
const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // 这里可以使用你的提示组件
  console.log(`${type}: ${message}`)
}

// 获取弹幕状态文本
const getBulletStatusText = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return '已通过'
    case 'REJECTED':
      return '隐藏'
    case 'PENDING':
      return '待审核'
    default:
      return '未知'
  }
}

// 显示编辑弹幕对话框
const showEditBulletDialog = (bullet: BulletChat) => {
  editingBulletChat.value = { ...bullet }
  showEditBulletModal.value = true
}

// 更新弹幕状态
const updateBulletStatus = async (id: number, status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
  try {
    const success = await updateBulletChatAPI(id, { status })
    if (success) {
      showAlert(`弹幕状态已更新为${getBulletStatusText(status)}`, 'success')
      
      // 更新本地数据
      const index = bulletChats.value.findIndex(bullet => bullet.bulletId === id)
      if (index !== -1) {
        bulletChats.value[index].status = status
      }
    } else {
      throw new Error('更新弹幕状态失败')
    }
  } catch (error: any) {
    console.error('更新弹幕状态失败:', error)
    showAlert(error.message || '更新弹幕状态失败，请重试', 'error')
  }
}

// 确认删除弹幕
const confirmDeleteBullet = (bullet: BulletChat) => {
  messageToDelete.value = bullet
  messageTypeToDelete.value = 'bullet'
  showDeleteConfirm.value = true
}

// 添加新弹幕
const addBulletChat = async () => {
  try {
    const response = await fetch(`${config.api.apiUrl}/bullet-chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        content: newBulletChat.value.content,
        avatar: newBulletChat.value.avatar,
        status: newBulletChat.value.status
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      showAlert('添加弹幕成功', 'success')
      showAddBulletModal.value = false
      
      // 重置表单
      newBulletChat.value = {
        bulletId: 0,
        content: '',
        cratetime: '',
        avatar: '',
        status: 'APPROVED'
      }
      
      // 重新获取弹幕列表
      await fetchBulletChats()
    } else {
      throw new Error(data.message || '添加弹幕失败')
    }
  } catch (error: any) {
    console.error('添加弹幕失败:', error)
    showAlert(error.message || '添加弹幕失败，请重试', 'error')
  }
}

// 更新弹幕
const updateBulletChat = async () => {
  try {
    const success = await updateBulletChatAPI(editingBulletChat.value.bulletId, {
      content: editingBulletChat.value.content,
      avatar: editingBulletChat.value.avatar,
      status: editingBulletChat.value.status
    })
    
    if (success) {
      showAlert('弹幕更新成功', 'success')
      showEditBulletModal.value = false
      
      // 更新本地数据
      const index = bulletChats.value.findIndex(bullet => bullet.bulletId === editingBulletChat.value.bulletId)
      if (index !== -1) {
        bulletChats.value[index] = { ...editingBulletChat.value }
      }
    } else {
      throw new Error('更新弹幕失败')
    }
  } catch (error: any) {
    console.error('更新弹幕失败:', error)
    showAlert(error.message || '更新弹幕失败，请重试', 'error')
  }
}

// 获取弹幕列表
const fetchBulletChats = async () => {
  isLoading.value = true
  
  try {
    if (bulletChatStatusFilter.value === 'all') {
      // 获取所有弹幕
      const response = await fetch(`${config.api.apiUrl}/bullet-chats`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        bulletChats.value = (data.data || []) as BulletChat[]
      } else {
        throw new Error(data.message || '获取弹幕列表失败')
      }
    } else {
      // 根据状态获取弹幕
      const chats = await getBulletChatsByStatus(bulletChatStatusFilter.value)
      // 确保类型转换正确
      bulletChats.value = chats as unknown as BulletChat[]
    }
  } catch (error: any) {
    console.error('获取弹幕列表失败:', error)
    showAlert(error.message || '获取弹幕列表失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 生成分页范围
const getPaginationRange = (totalPages: number) => {
  // 最多显示5个页码按钮
  const maxButtons = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  
  const range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
};

// 重置分页
watch(currentTab, () => {
  currentPage.value = 1;
});

// 跳转到指定页
const goToPage = (page: number, totalItems: number) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage.value = page;
};

onMounted(fetchMessages)
</script>

<style scoped>
.messages-page {
  padding: 20px;
}

input[type="text"] {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
}

select {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
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
  color: white;
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
  color: rgba(0, 162, 255, 0.9);
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

.messages-container {
  background: var(--bg-primary-transparent);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  min-height: 300px;
}

.message-list {
  padding: 20px;
}

.message-card {
  background: var(--bg-primary-transparent);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.article-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.article-info a {
  color: var(--primary-color);
  text-decoration: none;
}

.article-info a:hover {
  text-decoration: underline;
}

.message-content {
  margin-bottom: 16px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
}

.message-actions {
  display: flex;
  gap: 12px;
}

.reply-btn, .delete-btn, .mark-read-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reply-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.reply-btn:hover {
  background: var(--primary-color);
  color: white;
}

.delete-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.delete-btn:hover {
  background: #f44336;
  color: white;
}

.mark-read-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.mark-read-btn:hover {
  background: #4caf50;
  color: white;
}

.notification-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.notification-icon.info {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.notification-icon.warning {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.notification-icon.success {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.notification-icon.error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.notification-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.notification-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.notification-status.read {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
  margin-right: 10px;
}

.page-navigation {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.page-buttons {
  display: flex;
  gap: 5px;
}

.page-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.page-jumper input {
  width: 50px;
  padding: 5px 8px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.jump-btn {
  padding: 5px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.jump-btn:hover {
  background-color: var(--primary-color);
  color: white;
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.no-messages-icon {
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
  min-height: 300px;
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

.reply-to, .original-message {
  margin-bottom: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.original-message {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
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
  background: rgb(255, 114, 114);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: rgb(255, 72, 72);
  color: white;
}

.confirm-btn {
  background: var(--primary-color);
  color: var(--text-primary);
}

.delete-confirm-btn {
  background: #f44336;
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .article-info {
    margin-top: 10px;
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .messages-container {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .message-card {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .reply-btn,
:root[class='dark-theme'] .delete-btn,
:root[class='dark-theme'] .mark-read-btn,
:root[class='dark-theme'] .page-btn {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .original-message {
  background: var(--bg-secondary-dark);
}

:root[class='dark-theme'] .loading-container {
  background: rgba(30, 30, 30, 0.8);
}

:root[class='dark-theme'] .modal-content {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .form-group textarea {
  background: var(--bg-secondary-dark);
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .cancel-btn {
  background: var(--bg-secondary-dark);
}

/* 添加弹幕管理相关样式 */
.bullet-chat-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.add-bullet-btn {
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

.add-bullet-btn:hover {
  background: var(--primary-color-dark);
}

.bullet-chat-card {
  border-left: 4px solid var(--primary-color);
}

.bullet-status {
  border: 1px solid transparent;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.bullet-status.APPROVED {
  background-color: #4CAF50;
  border-color: #43A047;
}

.bullet-status.REJECTED {
  background-color: #F44336;
  border-color: #E53935;
}

.bullet-status.PENDING {
  background-color: #FFC107;
  border-color: #FFB300;
  color: #333;
}

.edit-btn, .activate-btn, .hide-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.edit-btn:hover {
  background: #2196F3;
  color: white;
}

.activate-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.activate-btn:hover {
  background: #4CAF50;
  color: white;
}

.hide-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.hide-btn:hover {
  background: #FFC107;
  color: white;
}

.avatar-input-group {
  display: flex;
  gap: 10px;
}

.default-avatar-btn {
  padding: 8px 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-avatar-btn:hover {
  background: #3a7bc8;
}

.avatar-preview {
  margin-top: 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 