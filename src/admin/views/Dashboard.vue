<template>
  <div class="dashboard">

    
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
                <div class="quote-text">"遇事不决，可问春风"</div>
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
                        stroke-width="2"
                        :stroke-dasharray="`${cpuUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label">CPU</div>
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
                        stroke-width="2"
                        :stroke-dasharray="`${memoryUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label">内存</div>
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
                        stroke-width="2"
                        :stroke-dasharray="`${diskUsage}, 100`"
                      />
                    </svg>
                    <div class="stat-label">磁盘</div>
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
              <div class="stat-value">210</div>
            </div>
          </div>
          
          <div class="stat-card glass-card">
            <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.2);">
              <Icon icon="mdi:heart-outline" style="color: #EF4444;" />
            </div>
            <div class="stat-info">
              <div class="stat-label">分类总数</div>
              <div class="stat-value">10</div>
            </div>
          </div>
          
          <div class="stat-card glass-card">
            <div class="stat-icon" style="background-color: rgba(248, 113, 113, 0.2);">
              <Icon icon="mdi:tag-outline" style="color: #F87171;" />
            </div>
            <div class="stat-info">
              <div class="stat-label">标签总数</div>
              <div class="stat-value">22</div>
            </div>
          </div>
        </div>
        
        <!-- 标签云 -->
        <div class="tag-cloud glass-card">
          <div class="section-title">标签云</div>
          <div class="cloud-container">
            <span v-for="(tag, index) in tags" :key="index" 
                  :style="{ fontSize: `${tag.size}px`, color: tag.color }">
              {{ tag.name }}
            </span>
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
          <div class="progress-title">开发进度</div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-items">
            <div class="progress-item completed">
              <Icon icon="mdi:check" />
              <span>登录逻辑和后台页面UI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

// 系统使用状态（模拟数据）
const cpuUsage = ref(65)
const memoryUsage = ref(48)
const diskUsage = ref(75)

// 平滑更新系统状态数据
const updateSystemStats = () => {
  // 每次随机生成新的使用率数据
  const newCpuUsage = Math.floor(40 + Math.random() * 45) // 40-85%
  const newMemoryUsage = Math.floor(30 + Math.random() * 40) // 30-70%
  const newDiskUsage = Math.floor(65 + Math.random() * 25) // 65-90%
  
  // 使用动画平滑过渡到新数据
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

// 月份数据
const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']

// 热图数据生成
const generateHeatmapData = () => {
  const data = []
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

const heatmapData = ref(generateHeatmapData())

// 获取热图单元格的类名
const getCellClass = (cell: { level: number }) => {
  if (cell.level === 0) return ''
  if (cell.level === 1) return 'level-1'
  if (cell.level === 2) return 'level-2'
  return 'level-3'
}

// 最新文章数据
const latestArticles = ref([
  {
    title: '深入理解神经网络',
    publishTime: '6天前',
    summary: '本文探讨了神经网络的工作原理以及在机器学习和人工智能中的应用，从感知器到深度学习，了解神经网络的发展历程。',
    tags: ['神经网络', '机器学习', '人工智能']
  },
  {
    title: '构建高性能的Web应用',
    publishTime: '6天前',
    summary: '通过优化前端和后端代码，本文介绍了构建高性能Web应用的最佳实践，包括性能监测、代码分割、缓存策略等方面的建议。',
    tags: ['Web开发', '性能优化', '前端', '后端']
  },
  {
    title: '掌握数据结构与算法',
    publishTime: '6天前',
    summary: '深入研究常见的数据结构和算法，讨论它们的优缺点以及在解决实际问题中的应用，包括排序算法、图算法、动态规划等。',
    tags: ['数据结构', '算法', '编程']
  },
  {
    title: '容器化应用与Docker',
    publishTime: '6天前',
    summary: '学习如何使用Docker容器技术来高效应用的部署和管理，了解容器的基本概念、Dockerfile的编写以及容器编排工具的使用。',
    tags: ['Docker', '容器化', 'DevOps']
  }
])

// 标签云数据
const generateTags = () => {
  const keywords = ['JavaScript', 'Python', 'React', 'Vue', 'TypeScript', 'Node.js', 'CSS', 'HTML', 
                   '设计', '算法', '数据结构', '云计算', '服务器', '编程', '开发', '前端', '后端',
                   'AI', '机器学习', '代码', '开源']
  
  return keywords.map(name => {
    return {
      name,
      size: Math.floor(Math.random() * 10) + 14, // 14px ~ 24px
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    }
  })
}

const tags = ref(generateTags())

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

// 在组件挂载时启动系统状态更新
onMounted(() => {
  // 立即更新一次数据
  updateSystemStats()
  
  // 设置定时更新
  setInterval(updateSystemStats, 5000)
})
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

.stat-value {
  margin-top: 15px;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

/* 标签云 */
.tag-cloud {
  width: 100%;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 15px;
}

.cloud-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.cloud-container span {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cloud-container span:hover {
  transform: scale(1.05);
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
  font-size: 14px;
  color: #64748b;
}

.progress-item.completed {
  color: #10b981;
}

/* 系统监测组件样式 */
.system-monitor {
  margin-bottom: 20px;
  /* background: rgba(227, 242, 253, 0.0); */
  border-radius: 12px;
  overflow: hidden;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08); */
}

.monitor-content {
  padding: 20px;
}

.monitor-circle {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: flex-start;
  gap: 20px;
  padding: 0;
}

.quote-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  width: auto;
  margin-bottom: 0;
}

.quote-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 5%;
  overflow: hidden;
  background-color: #eef2f8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.default-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.default-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quote-text {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0;
}

.stats-circles {
  display: flex;
  gap: 50px;
  margin: 20px auto;
  /* align-items: start; */
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-circle {
  width: 130px;
  height: 130px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.stat-circle path {
  transition: stroke-dasharray 0.5s ease;
}

.stat-label {
  position: absolute;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .dashboard-layout {
    grid-template-columns: 1fr 1fr;
  }
  
  .dashboard-right {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .dashboard-right {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
  }
  
  .heatmap-container {
    padding: 10px;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .completion {
    align-self: flex-end;
  }
  
  .monitor-circle {
    flex-direction: column;
  }
  
  .quote-container {
    flex-direction: column;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .stats-circles {
    flex-direction: row;
    /* align-items: left; */
    margin-left: 0;
    /* width: 100%; */
    justify-content: space-around;
  }
  
  .quote-image {
    width: 60px;
    height: 60px;
  }
  
  .stat-circle {
    width: 50px;
    height: 50px;
  }
  
  .quote-text {
    font-size: 16px;
  }
}
</style> 