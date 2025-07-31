<template>
  <div class="dashboard">
    <MessageNotification ref="notification" />
    
    <!-- 卡片内容区 - 移至左侧列 -->
    
    <!-- 主要内容区 - 三列布局 -->
    <div class="dashboard-layout">
      <!-- 左侧列 - 1fr -->
      <div class="dashboard-left">
            <!-- 添加系统状态监测组件 -->
        <div class="system-monitor">
          <div class="monitor-content">
            <div class="monitor-circle">
              <div class="quote-container">
                <div class="quote-image">
                  <!-- 可以替换为实际的图片路径 -->
                  <div class="default-image">
                    <img src="https://picbedcdn.dannysummer.asia/public/avatars/avatar1.jpg" alt="avatar">
                  </div>
                </div>
                <div class="quote-text-avatar">"遇事不决，可问春风"</div>
              </div>
              <div class="stats-circles">
                <div class="stat-item">
                  <div class="stat-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E3F2FD"
                        stroke-width="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4f86f7"
                        stroke-width="2.5"
                        :stroke-dasharray="`${cpuUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label-watch">CPU<div class="stat-value-watch">{{ cpuUsage }}%</div></div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E3F2FD"
                        stroke-width="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4f86f7"
                        stroke-width="2.5"
                        :stroke-dasharray="`${memoryUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label-watch">内存<div class="stat-value-watch">{{ memoryUsage }}%</div></div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E3F2FD"
                        stroke-width="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4f86f7"
                        stroke-width="2.5"
                        :stroke-dasharray="`${diskUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label-watch">磁盘<div class="stat-value-watch">{{ diskUsage }}%</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card glass-card">
            <div class="stat-icon" style="background-color: rgba(252, 211, 77, 0.2);">
              <Icon icon="mdi:file-document-outline" style="color: #FBBF24;" />
            </div>
            <div class="stat-info">
              <div class="stat-label">文章总数</div>
              <div class="stat-value">{{ statistics.articleCount }}</div>
            </div>
          </div>
          
          <div class="stat-card glass-card">
            <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.2);">
              <Icon icon="mdi:heart-outline" style="color: #EF4444;" />
            </div>
            <div class="stat-info">
              <div class="stat-label">分类总数</div>
              <div class="stat-value">{{ statistics.categoryCount }}</div>
            </div>
          </div>
          
          <div class="stat-card glass-card">
            <div class="stat-icon" style="background-color: rgba(248, 113, 113, 0.2);">
              <Icon icon="mdi:tag-outline" style="color: #F87171;" />
            </div>
            <div class="stat-info">
              <div class="stat-label">标签总数</div>
              <div class="stat-value">{{ statistics.tagCount }}</div>
            </div>
          </div>
        </div>
        
        <!-- 标签云 -->
        <div class="tag-cloud glass-card">
          <div class="section-header">
            <div class="section-title">标签云</div>
            <div class="section-actions">
              <button class="action-btn" @click="openTagEditor(null)">
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
          
          <div class="cloud-container">
            <span 
              v-for="(tag, index) in tags" 
              :key="index" 
              :style="{ fontSize: `${tag.size}px`, color: tag.color }"
              class="tag-item"
            >
              {{ tag.name }}
              <div class="tag-actions">
                <button class="tag-action-btn edit" @click.stop="openTagEditor(tag)">
                  <Icon icon="mdi:pencil" />
                </button>
                <button class="tag-action-btn delete" @click.stop="deleteTag(tag)">
                  <Icon icon="mdi:delete" />
                </button>
              </div>
            </span>
          </div>
          
          <!-- 标签编辑器对话框 -->
          <div class="modal" v-if="showTagEditor">
            <div class="modal-content">
              <h3 class="modal-title">{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
              
              <div class="form-group">
                <label>标签名称</label>
                <input 
                  type="text" 
                  :value="editingTag ? editingTag.name : newTag.name"
                  @input="e => handleInputChange(e, 'name')"
                  placeholder="输入标签名称"
                />
              </div>
              
              <div class="form-group">
                <label>字体大小 (px)</label>
                <input 
                  type="range" 
                  :value="editingTag ? editingTag.size : newTag.size"
                  @input="e => handleRangeChange(e)"
                  min="12" 
                  max="24" 
                  step="1"
                />
                <span>{{ editingTag ? editingTag.size : newTag.size }}px</span>
              </div>
              
              <div class="form-group">
                <label>标签颜色</label>
                <input 
                  type="color" 
                  :value="editingTag ? editingTag.color : newTag.color"
                  @input="e => handleInputChange(e, 'color')"
                />
              </div>
              
              <div class="modal-actions">
                <button class="modal-btn cancel" @click="showTagEditor = false">取消</button>
                <button class="modal-btn save" @click="saveTag">保存</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中间列 - 2fr -->
      <div class="dashboard-center">
        <!-- 顶部热图区域 -->
        <div class="heatmap-container glass-card">
          <div class="heatmap-months">
            <div v-for="month in months" :key="month">{{ month }}</div>
          </div>
          <div class="heatmap-weekdays">
            <div>Mon</div>
            <div>Wed</div>
            <div>Fri</div>
          </div>
          <div class="heatmap-grid">
            <div 
              v-for="(cell, index) in heatmapData" 
              :key="index" 
              class="heatmap-cell"
              :class="getCellClass(cell)"
              :title="`${cell.date}: ${cell.count} articles`"
            ></div>
          </div>
        </div>
        
        <!-- 最新文章 -->
        <div class="latest-articles">
          <div class="section-title">最新文章</div>
          
          <div v-if="latestArticles.length === 0" class="empty-state">
            暂无文章数据
          </div>
          
          <div class="article-card glass-card" v-for="(article, index) in latestArticles" :key="index">
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <span class="publish-time">
                <Icon icon="mdi:clock-outline" />
                发布于{{ article.publishTime }}
              </span>
            </div>
            <p class="article-summary">{{ article.summary }}</p>
            <div class="article-footer">
              <div class="article-tags">
                <span class="tag" v-for="(tag, tagIndex) in article.tags" :key="tagIndex">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧列 - 1fr -->
      <div class="dashboard-right">
        <!-- 时钟组件 -->
        <div class="clock-container glass-card">
          <div class="time">
            {{ currentTime.slice(0, 2) }}
            <span class="colon">:</span>
            {{ currentTime.slice(2, 4) }}
            <span class="colon">:</span>
            {{ currentTime.slice(4, 6) }}
            <span class="period">{{ currentPeriod }}</span>
          </div>
        </div>
        
        <!-- 日历组件 -->
        <div class="calendar">
          <div class="calendar-header">
            <div class="emoji">😊</div>
            <div class="date-info">
              <div class="current-date">{{formatDate(currentDate)}}</div>
              <div class="date-desc">星期{{weekdays[currentDate.getDay()]}} · 今天也加油哦！</div>
            </div>
            <div class="completion">今年已度过 {{yearProgressPercentage}}% 喽！</div>
          </div>
          
          <div class="calendar-grid">
            <div class="weekdays">
              <div>一</div>
              <div>二</div>
              <div>三</div>
              <div>四</div>
              <div>五</div>
              <div>六</div>
              <div>日</div>
            </div>
            
            <div class="days">
              <div v-for="day in 42" :key="day" class="day" :class="getDayClass(day)">
                {{ getDayNumber(day) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 每日箴言 -->
        <div class="daily-quote glass-card">
          <div class="quote-header">
            <span>每日箴言</span>
            <div class="quote-controls">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
          </div>
          <div class="quote-content">
            <div class="quote-icon">📌</div>
            <p class="quote-text">我多想让过去重来 再给我一次机会</p>
          </div>
        </div>
        
        <!-- 开发进度 -->
        <div class="dev-progress glass-card">
          <div class="section-header">
            <div class="progress-title">开发进度</div>
            <div class="section-actions">
              <button class="action-btn" @click="showProgressEditor = true">
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: `${progressPercentage}%`}"></div>
          </div>
          
          <div class="progress-items">
            <div 
              v-for="(item, index) in progressItems" 
              :key="index" 
              class="progress-item" 
              :class="{ 'completed': item.completed }"
              @click="toggleProgressItemStatus(item)"
            >
              <Icon :icon="item.completed ? 'mdi:check' : 'mdi:circle-outline'" />
              <span>{{ item.text }}</span>
              <button class="progress-delete-btn" @click.stop="deleteProgressItem(item)">
                <Icon icon="mdi:delete" />
              </button>
            </div>
          </div>
          
          <!-- 进度项编辑器对话框 -->
          <div class="modal" v-if="showProgressEditor">
            <div class="modal-content">
              <h3 class="modal-title">添加进度项</h3>
              
              <div class="form-group">
                <label>进度项内容</label>
                <input 
                  type="text" 
                  v-model="newProgressItem" 
                  placeholder="输入进度项内容"
                />
              </div>
              
              <div class="modal-actions">
                <button class="modal-btn cancel" @click="showProgressEditor = false">取消</button>
                <button class="modal-btn save" @click="addProgressItem">添加</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import MessageNotification from '@/components/MessageNotification.vue'
import { config } from '../../config/index'

// 定义类型接口
interface Tag {
  id: number
  name: string
  size: number
  color: string
}

interface Article {
  id: number
  title: string
  publishTime: string
  summary: string
  tags: string[]
}

interface ProgressItem {
  id: number
  text: string
  completed: boolean
}

interface HeatmapCell {
  date: string
  count: number
  level: number
}

// 添加通知组件引用
const notification = ref<InstanceType<typeof MessageNotification> | null>(null)

// API基础URL
const API_BASE_URL = config.api.apiUrl

// 统计数据
const statistics = reactive({
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0
})

// 系统使用状态
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const diskUsage = ref(0)

// 获取真实系统状态
const fetchSystemStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/system/stats`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      
      // 使用平滑动画更新数据
      animateValue(cpuUsage, data.cpu || 0, 800)
      animateValue(memoryUsage, data.memory || 0, 800)
      animateValue(diskUsage, data.disk || 0, 800)
    } else {
      console.error('获取系统状态失败')
      // 使用模拟数据作为备选
      updateMockSystemStats()
    }
  } catch (error) {
    console.error('获取系统状态出错', error)
    // 使用模拟数据作为备选
    updateMockSystemStats()
  }
}

// 模拟数据作为备选
const updateMockSystemStats = () => {
  const newCpuUsage = Math.floor(40 + Math.random() * 45) // 40-85%
  const newMemoryUsage = Math.floor(30 + Math.random() * 40) // 30-70%
  const newDiskUsage = Math.floor(65 + Math.random() * 25) // 65-90%
  
  animateValue(cpuUsage, newCpuUsage, 800)
  animateValue(memoryUsage, newMemoryUsage, 800)
  animateValue(diskUsage, newDiskUsage, 800)
}

// 数值平滑过渡动画
const animateValue = (ref: any, newValue: number, duration: number) => {
  const startValue = ref.value
  const startTime = Date.now()
  
  const updateValue = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    
    if (elapsed < duration) {
      // 使用easeOutQuad缓动函数使动画更自然
      const progress = 1 - Math.pow(1 - elapsed / duration, 2)
      ref.value = Math.round(startValue + (newValue - startValue) * progress)
      requestAnimationFrame(updateValue)
    } else {
      ref.value = newValue
    }
  }
  
  updateValue()
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      
      statistics.articleCount = data.articles || 0
      statistics.categoryCount = data.categories || 0
      statistics.tagCount = data.tags || 0
    } else {
      console.error('获取统计数据失败')
      notification.value?.addMessage('获取统计数据失败', 'error')
    }
  } catch (error: any) {
    console.error('获取统计数据出错', error)
    notification.value?.addMessage('获取统计数据失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 月份数据
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// 文章热图数据
const heatmapData = ref<HeatmapCell[]>([])

// 获取文章热图数据
const fetchHeatmapData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/heatmap`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      heatmapData.value = data.map((item: any) => ({
        date: item.date,
        count: item.count,
        level: calculateLevel(item.count)
      }))
    } else {
      console.error('获取热图数据失败')
      // 使用模拟数据作为备选
      heatmapData.value = generateMockHeatmapData()
    }
  } catch (error) {
    console.error('获取热图数据出错', error)
    // 使用模拟数据作为备选
    heatmapData.value = generateMockHeatmapData()
  }
}

// 计算热力图等级
const calculateLevel = (count: number): number => {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  return 3
}

// 生成模拟热图数据作为备选
const generateMockHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 365) // 一年的数据
  
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    // 随机生成一些有文章的日期
    const hasArticle = Math.random() > 0.85
    const count = hasArticle ? Math.floor(Math.random() * 3) + 1 : 0
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      count: count,
      level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3
    })
  }
  
  return data
}

// 热图单元格类名
const getCellClass = (cell: HeatmapCell) => {
  if (cell.level === 0) return ''
  if (cell.level === 1) return 'level-1'
  if (cell.level === 2) return 'level-2'
  return 'level-3'
}

// 最新文章数据
const latestArticles = ref<Article[]>([])

// 获取最新文章
const fetchLatestArticles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/latest`)
    if (response.ok) {
      const data = await response.json()
      latestArticles.value = data.map((article: any) => ({
        id: article.id,
        title: article.title,
        publishTime: formatPublishTime(new Date(article.createdAt || article.createTime)),
        summary: article.summary || article.content?.substring(0, 100) || '暂无摘要',
        tags: article.tags?.split(',').filter(Boolean) || []
      }))
    } else {
      console.error('获取最新文章失败')
      notification.value?.addMessage('获取最新文章失败', 'error')
    }
  } catch (error: any) {
    console.error('获取最新文章出错', error)
    notification.value?.addMessage('获取最新文章失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 格式化发布时间
const formatPublishTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 标签云数据
const tags = ref<Tag[]>([])
const showTagEditor = ref(false)
const editingTag = ref<Tag | null>(null)
const newTag = ref<Tag>({ id: 0, name: '', size: 16, color: '#4f86f7' })

// 获取标签云数据
const fetchTags = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      tags.value = data.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        size: tag.size || Math.floor(Math.random() * 10) + 14,
        color: tag.color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
      }))
    } else {
      console.error('获取标签失败')
      // 使用模拟数据作为备选
      tags.value = generateMockTags()
    }
  } catch (error) {
    console.error('获取标签出错', error)
    // 使用模拟数据作为备选
    tags.value = generateMockTags()
  }
}

// 生成模拟标签数据作为备选
const generateMockTags = (): Tag[] => {
  const keywords = ['JavaScript', 'Python', 'React', 'Vue', 'TypeScript', 'Node.js', 'CSS', 'HTML', 
                   '设计', '算法', '数据结构', '云计算', '服务器', '编程', '开发', '前端', '后端',
                   'AI', '机器学习', '代码', '开源']
  
  return keywords.map((name, index) => {
    return {
      id: index + 1,
      name,
      size: Math.floor(Math.random() * 10) + 14, // 14px ~ 24px
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    }
  })
}

// 打开标签编辑器
const openTagEditor = (tag: Tag | null = null) => {
  if (tag) {
    editingTag.value = { ...tag }
  } else {
    newTag.value = { id: 0, name: '', size: 16, color: '#4f86f7' }
  }
  showTagEditor.value = true
}

// 保存标签
const saveTag = async () => {
  try {
    const tagData = editingTag.value || newTag.value
    
    if (!tagData.name.trim()) {
      notification.value?.addMessage('标签名称不能为空', 'error')
      return
    }
    
    const method = editingTag.value ? 'PUT' : 'POST'
    const url = editingTag.value 
      ? `${API_BASE_URL}/tags/${editingTag.value.id}` 
      : `${API_BASE_URL}/tags`
    
    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tagData)
    })
    
    if (response.ok) {
      const result = await response.json()
      if (editingTag.value) {
        // 更新标签列表
        const index = tags.value.findIndex(t => t.id === editingTag.value?.id)
        if (index !== -1) {
          tags.value[index] = { ...result }
        }
        notification.value?.addMessage('标签更新成功', 'success')
      } else {
        // 添加新标签
        tags.value.push(result)
        notification.value?.addMessage('标签添加成功', 'success')
      }
      
      // 关闭标签编辑器
      showTagEditor.value = false
      editingTag.value = null
    } else {
      notification.value?.addMessage('保存标签失败', 'error')
    }
  } catch (error: any) {
    console.error('保存标签出错', error)
    notification.value?.addMessage('保存标签失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 删除标签
const deleteTag = async (tag: Tag) => {
  if (!confirm(`确定要删除标签"${tag.name}"吗？`)) {
    return
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${tag.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      // 从列表中移除标签
      tags.value = tags.value.filter(t => t.id !== tag.id)
      notification.value?.addMessage('标签删除成功', 'success')
    } else {
      notification.value?.addMessage('删除标签失败', 'error')
    }
  } catch (error: any) {
    console.error('删除标签出错', error)
    notification.value?.addMessage('删除标签失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 开发进度相关
const progressItems = ref<ProgressItem[]>([])
const showProgressEditor = ref(false)
const newProgressItem = ref('')

// 获取开发进度数据
const fetchProgressItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      progressItems.value = await response.json()
    } else {
      console.error('获取开发进度失败')
      // 使用模拟数据作为备选
      progressItems.value = [
        { id: 1, text: '登录逻辑和后台页面UI', completed: true }
      ]
    }
  } catch (error) {
    console.error('获取开发进度出错', error)
    // 使用模拟数据作为备选
    progressItems.value = [
      { id: 1, text: '登录逻辑和后台页面UI', completed: true }
    ]
  }
}

// 添加开发进度项
const addProgressItem = async () => {
  if (!newProgressItem.value.trim()) {
    notification.value?.addMessage('进度项内容不能为空', 'error')
    return
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: newProgressItem.value,
        completed: false
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      progressItems.value.push(result)
      newProgressItem.value = ''
      notification.value?.addMessage('添加进度项成功', 'success')
      showProgressEditor.value = false
    } else {
      notification.value?.addMessage('添加进度项失败', 'error')
    }
  } catch (error: any) {
    console.error('添加进度项出错', error)
    notification.value?.addMessage('添加进度项失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 切换进度项完成状态
const toggleProgressItemStatus = async (item: ProgressItem) => {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/${item.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...item,
        completed: !item.completed
      })
    })
    
    if (response.ok) {
      // 更新本地数据
      const index = progressItems.value.findIndex(p => p.id === item.id)
      if (index !== -1) {
        progressItems.value[index].completed = !item.completed
      }
    } else {
      notification.value?.addMessage('更新进度项状态失败', 'error')
    }
  } catch (error: any) {
    console.error('更新进度项状态出错', error)
    notification.value?.addMessage('更新进度项状态失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 删除进度项
const deleteProgressItem = async (item: ProgressItem) => {
  if (!confirm(`确定要删除进度项"${item.text}"吗？`)) {
    return
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/progress/${item.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      // 从列表中移除进度项
      progressItems.value = progressItems.value.filter(p => p.id !== item.id)
      notification.value?.addMessage('删除进度项成功', 'success')
    } else {
      notification.value?.addMessage('删除进度项失败', 'error')
    }
  } catch (error: any) {
    console.error('删除进度项出错', error)
    notification.value?.addMessage('删除进度项失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 计算进度百分比
const progressPercentage = computed(() => {
  if (progressItems.value.length === 0) return 0
  const completedCount = progressItems.value.filter(item => item.completed).length
  return Math.round((completedCount / progressItems.value.length) * 100)
})

// 在组件挂载时获取所有数据
onMounted(async () => {
  // 获取系统状态
  fetchSystemStats()
  // 设置定时更新系统状态
  setInterval(fetchSystemStats, 30000) // 30秒更新一次
  
  // 获取统计数据
  fetchStatistics()
  
  // 获取文章热图数据
  fetchHeatmapData()
  
  // 获取最新文章
  fetchLatestArticles()
  
  // 获取标签云数据
  fetchTags()
  
  // 获取开发进度
  fetchProgressItems()
  
  // 启动时钟
  updateTime()
  setInterval(updateTime, 1000)
})

// 在 script setup 部分添加时钟逻辑
const currentTime = ref('000000')
const currentPeriod = ref('')

// 更新时间的函数
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  // 格式化时间
  currentTime.value = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`
  
  // 设置时间段
  if (hours >= 5 && hours < 12) {
    currentPeriod.value = '上午好'
  } else if (hours >= 12 && hours < 14) {
    currentPeriod.value = '中午好'
  } else if (hours >= 14 && hours < 18) {
    currentPeriod.value = '下午好'
  } else if (hours >= 18 && hours < 24) {
    currentPeriod.value = '晚上好'
  } else {
    currentPeriod.value = '夜深了'
  }
}

// 日历功能
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentDay = currentDate.getDate()
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 格式化当前日期为 yyyy年MM月dd日 格式
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month < 10 ? '0' + month : month}月${day < 10 ? '0' + day : day}日`
}

// 计算今年已度过的时间百分比
const calculateYearProgress = (): number => {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1) // 今年1月1日
  
  // 计算今年的天数（处理闰年情况）
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }
  const daysInYear = isLeapYear(now.getFullYear()) ? 366 : 365
  
  // 计算今天是一年中的第几天
  const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }
  
  const dayOfYear = getDayOfYear(now)
  
  // 计算百分比并保留一位小数
  return parseFloat(((dayOfYear / daysInYear) * 100).toFixed(1))
}

const yearProgressPercentage = calculateYearProgress()

// 获取当前月的第一天是星期几和当月天数
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1).getDay()
const daysInMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate()

// 判断日期单元格的类名
const getDayClass = (day: number) => {
  const dayValue = getDayNumber(day)
  
  // 如果日期是数字且等于当前日期，则标记为"当前"
  if (typeof dayValue === 'number' && dayValue === currentDay) {
    return 'current'
  }
  
  // 如果日期为空，标记为"空"
  if (dayValue === '') {
    return 'empty'
  }
  
  return ''
}

// 获取日期单元格的数字 - 改进实现以准确显示当前月份的日期
const getDayNumber = (day: number): string | number => {
  // 日历从星期日开始，所以我们需要调整索引
  // firstDayOfMonth是0（星期日）到6（星期六）
  // day从1开始
  
  // 计算在日历中的实际日期
  const adjustedDay = day - firstDayOfMonth
  
  // 如果日期在当前月的范围内
  if (adjustedDay > 0 && adjustedDay <= daysInMonth) {
    return adjustedDay
  }
  
  return ''
}

// 处理输入变化
const handleInputChange = (e: Event, field: string) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  
  if (editingTag.value) {
    if (field === 'name') editingTag.value.name = value
    if (field === 'color') editingTag.value.color = value
  } else {
    if (field === 'name') newTag.value.name = value
    if (field === 'color') newTag.value.color = value
  }
}

// 处理范围滑块变化
const handleRangeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  
  if (editingTag.value) {
    editingTag.value.size = value
  } else {
    newTag.value.size = value
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  color: #333;
}

/* 三列布局 */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 80px;
  margin-top: 20px;
}

.dashboard-left,
.dashboard-center,
.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 热图样式 */
.heatmap-container {
  width: 100%;
  overflow-x: auto;
  padding: 15px 20px;
  position: relative;
}

.heatmap-months {
  display: flex;
  justify-content: space-between;
  padding-left: 40px;
  margin-bottom: 5px;
}

.heatmap-weekdays {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 24px;
  left: 10px;
  top: 50px;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(53, 15px);
  grid-template-rows: repeat(7, 15px);
  gap: 3px;
  padding-left: 40px;
}

.heatmap-cell {
  width: 15px;
  height: 15px;
  background-color: rgba(235, 237, 240, 0.5);
  border-radius: 2px;
}

.heatmap-cell.level-1 {
  background-color: #9bdde9;
}

.heatmap-cell.level-2 {
  background-color: #408dc4;
}

.heatmap-cell.level-3 {
  background-color: #21446e;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 5px;
}

.stat-label-watch {
  font-size: 18px!important;
  color: #ffffff!important;
  margin-bottom: -5px;
}

.stat-value {
  margin-top: 15px;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.stat-value-watch {
  margin-top: 5px;
  font-size: 28px;
  font-weight: 600;
  color: #00aeff;
}

/* 标签云 */
.tag-cloud {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(79, 134, 247, 0.1);
  color: #4f86f7;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #4f86f7;
  color: white;
}

.tag-item {
  position: relative;
  cursor: pointer;
}

.tag-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: none;
  gap: 4px;
}

.tag-item:hover .tag-actions {
  display: flex;
}

.tag-action-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tag-action-btn.edit {
  background-color: rgba(79, 134, 247, 0.8);
  color: white;
}

.tag-action-btn.delete {
  background-color: rgba(239, 68, 68, 0.8);
  color: white;
}

.tag-action-btn:hover {
  transform: scale(1.1);
}

/* 对话框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 24px;
  min-width: 300px;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.modal-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #1e293b;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
}

.form-group input[type="range"] {
  width: 80%;
  vertical-align: middle;
}

.form-group input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background-color: #e2e8f0;
  color: #64748b;
}

.modal-btn.save {
  background-color: #4f86f7;
  color: white;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 文章列表 */
.latest-articles {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.article-card {
  padding: 20px;
  border-left: 4px solid #4f86f7;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.publish-time {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-summary {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 15px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(79, 134, 247, 0.1);
  color: #4f86f7;
}

/* 日历组件 */
.calendar {
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background: white;
  /* border: 1px solid rgba(255, 255, 255, 0.5); */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.calendar:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  align-items: center;
  background-color: #4f86f7;
  background-image: linear-gradient(135deg, #4f86f7, #2a6af0);
  border-radius: 12px 12px 0 0;
  padding: 15px 20px;
  color: white;
  box-shadow: 0 2px 4px rgba(79, 134, 247, 0.3);
  width: 100%;
  box-sizing: border-box;
}

.emoji {
  font-size: 28px;
  margin-right: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.date-info {
  flex: 1;
}

.current-date {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.date-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.completion {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.calendar-grid {
  padding: 15px 20px 20px;
  border-radius: 0 0 12px 12px;
  background-color: white;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  padding-top: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;
}

.day.current {
  background: #4f86f7;
  color: white;
  border-radius: 5px;
}

.day.empty {
  opacity: 0;
}

/* 每日箴言 */
.daily-quote {
  background: rgba(255, 251, 235, 0.7);
  border: 1px solid rgba(254, 243, 199, 0.5);
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: #92400e;
}

.quote-controls {
  display: flex;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.red { background: #ef4444; }
.yellow { background: #f59e0b; }
.green { background: #10b981; }

.quote-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.quote-icon {
  font-size: 18px;
}

.quote-text {
  margin: 0;
  font-size: 28px;
  line-height: 1.6;
  color: #92400e;
}

.quote-text-avatar {
  font-size: 36px;
  margin-left: 10%;
  margin-right: -45%;
  line-height: 1.6;
  color: #11596e;
}

/* 开发进度 */
.dev-progress {
  position: relative;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 15px;
}

.progress-bar {
  height: 8px;
  background: rgba(226, 232, 240, 0.5);
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 25%;
  background: #4f86f7;
  border-radius: 4px;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.progress-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.progress-item.completed {
  color: #10b981;
  text-decoration: line-through;
}

.progress-delete-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #ef4444;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.progress-item:hover .progress-delete-btn {
  opacity: 1;
}

/* 空状态提示 */
.empty-state {
  padding: 24px;
  text-align: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-bottom: 16px;
}

/* 时钟组件样式 */
.clock-container {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.time {
  font-size: 48px;
  font-weight: 300;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.colon {
  opacity: 1;
  animation: blink 1s infinite;
  margin: 0 5px;
  color: rgba(255, 255, 255, 0.8);
}

.period {
  font-size: 18px;
  margin-left: 15px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 系统监控面板样式 */
.system-monitor {
  background: linear-gradient(135deg, rgba(255 , 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 12px;
  color: white;
  overflow: hidden;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(178, 204, 255, 0.3);
}

.monitor-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.monitor-circle {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.quote-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20px;
}

.quote-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-left: -45%;
  margin-bottom: 0;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.default-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quote-text {
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stats-circles {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 5px;
}

.stat-circle {
  width: 120px;
  height: 120px;
  position: relative;
}

.stat-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.stat-label-watch, .stat-value-watch {
  position: absolute;
  text-align: center;
  width: 100%;
  color: rgb(38, 227, 252);
}

.stat-label-watch {
  top: 50%;
  left: 0;
  transform: translateY(-20px);
  font-size: 12px;
  font-weight: 500;
}

.stat-value-watch {
  top: 50%;
  left: 0;
  transform: translateY(2px);
  font-size: 16px;
  font-weight: 700;
}
</style> 