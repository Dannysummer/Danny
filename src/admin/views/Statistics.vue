<template>
  <div class="statistics-page">
    <div class="page-header">
      <h1>数据统计</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchStatistics">
          <Icon icon="mdi:refresh" :class="{ 'rotating': isLoading }" />
          刷新
        </button>
      </div>
    </div>

    <!-- 数据卡片 -->
    <div class="statistics-cards">
      <div v-for="(stat, index) in dataCards" :key="index" class="stat-card" :class="stat.class">
        <div class="stat-icon">
          <Icon :icon="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :class="{ 'up': stat.trend > 0, 'down': stat.trend < 0 }">
          <Icon :icon="stat.trend > 0 ? 'mdi:trending-up' : (stat.trend < 0 ? 'mdi:trending-down' : 'mdi:trending-neutral')" />
          {{ Math.abs(stat.trend) }}%
        </div>
      </div>
    </div>

    <!-- 数据图表 -->
    <div class="charts-container">
      <div class="chart-wrapper">
        <div class="chart-header">
          <h2>文章发布趋势</h2>
          <div class="chart-period-selector">
            <button 
              v-for="period in periods" 
              :key="period.value" 
              :class="{ active: selectedPeriod === period.value }"
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div id="article-trend-chart" class="chart-container"></div>
      </div>
      
      <div class="charts-row">
        <div class="chart-wrapper half-width">
          <h2>用户来源分布</h2>
          <div id="user-source-chart" class="chart-container"></div>
        </div>
        
        <div class="chart-wrapper half-width">
          <h2>访问设备占比</h2>
          <div id="device-chart" class="chart-container"></div>
        </div>
      </div>
      
      <div class="chart-wrapper">
        <h2>热门文章</h2>
        <div class="popular-articles">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>发布日期</th>
                <th>阅读量</th>
                <th>评论数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in popularArticles" :key="article.id">
                <td class="article-title">
                  <div>{{ article.title }}</div>
                </td>
                <td>{{ formatDate(article.publishDate) }}</td>
                <td>{{ formatNumber(article.views) }}</td>
                <td>{{ article.comments }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts/core'
import { 
  LineChart, 
  PieChart, 
  BarChart 
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { config } from '../../config/index'

// 注册 ECharts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  BarChart,
  CanvasRenderer
])

// 数据加载状态
const isLoading = ref(false)

// 时间周期选择
const periods = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季' },
  { value: 'year', label: '年' }
]
const selectedPeriod = ref('month')

// 图表实例
let articleTrendChart: echarts.ECharts | null = null
let userSourceChart: echarts.ECharts | null = null
let deviceChart: echarts.ECharts | null = null

// 数据卡片
const dataCards = ref([
  { 
    label: '文章总数', 
    value: 0, 
    icon: 'mdi:file-document-multiple', 
    trend: 0,
    class: 'articles'
  },
  { 
    label: '用户总数', 
    value: 0, 
    icon: 'mdi:account-group', 
    trend: 0,
    class: 'users' 
  },
  { 
    label: '总浏览量', 
    value: 0, 
    icon: 'mdi:eye', 
    trend: 0,
    class: 'views' 
  },
  { 
    label: '总评论数', 
    value: 0, 
    icon: 'mdi:comment-multiple', 
    trend: 0,
    class: 'comments' 
  }
])

// 热门文章
interface Article {
  id: number
  title: string
  publishDate: string
  views: number
  comments: number
}

const popularArticles = ref<Article[]>([])

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取统计数据
const fetchStatistics = async () => {
  isLoading.value = true
  try {
    // 获取数据卡片统计
    const overviewResponse = await fetch(`${config.api.apiUrl}/statistics/overview`, {
      credentials: 'include'
    })
    const overviewData = await overviewResponse.json()
    
    if (overviewData.success) {
      dataCards.value[0].value = overviewData.data.totalArticles || 0
      dataCards.value[0].trend = overviewData.data.articlesTrend || 0
      
      dataCards.value[1].value = overviewData.data.totalUsers || 0
      dataCards.value[1].trend = overviewData.data.usersTrend || 0
      
      dataCards.value[2].value = overviewData.data.totalViews || 0
      dataCards.value[2].trend = overviewData.data.viewsTrend || 0
      
      dataCards.value[3].value = overviewData.data.totalComments || 0
      dataCards.value[3].trend = overviewData.data.commentsTrend || 0
    }
    
    // 获取文章发布趋势
    fetchArticleTrend()
    
    // 获取用户来源分布
    const sourceResponse = await fetch(`${config.api.apiUrl}/statistics/user-sources`, {
      credentials: 'include'
    })
    const sourceData = await sourceResponse.json()
    
    if (sourceData.success) {
      renderUserSourceChart(sourceData.data)
    }
    
    // 获取设备分布
    const deviceResponse = await fetch(`${config.api.apiUrl}/statistics/devices`, {
      credentials: 'include'
    })
    const deviceData = await deviceResponse.json()
    
    if (deviceData.success) {
      renderDeviceChart(deviceData.data)
    }
    
    // 获取热门文章
    const articlesResponse = await fetch(`${config.api.apiUrl}/statistics/popular-articles`, {
      credentials: 'include'
    })
    const articlesData = await articlesResponse.json()
    
    if (articlesData.success) {
      popularArticles.value = articlesData.data || []
    }
    
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    showAlert('获取统计数据失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 获取文章发布趋势
const fetchArticleTrend = async () => {
  try {
    const response = await fetch(`${config.api.apiUrl}/statistics/article-trend?period=${selectedPeriod.value}`, {
      credentials: 'include'
    })
    const data = await response.json()
    
    if (data.success) {
      renderArticleTrendChart(data.data)
    }
  } catch (error) {
    console.error('获取文章趋势失败:', error)
  }
}

// 渲染文章趋势图表
const renderArticleTrendChart = (data: any) => {
  if (!articleTrendChart) {
    articleTrendChart = echarts.init(document.getElementById('article-trend-chart') as HTMLElement)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['发布文章数', '阅读量', '评论数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates || []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '发布文章数',
        type: 'bar',
        data: data.articles || [],
        color: 'rgba(24, 144, 255, 0.85)'
      },
      {
        name: '阅读量',
        type: 'line',
        data: data.views || [],
        color: 'rgba(47, 194, 91, 0.85)'
      },
      {
        name: '评论数',
        type: 'line',
        data: data.comments || [],
        color: 'rgba(250, 173, 20, 0.85)'
      }
    ]
  }
  
  articleTrendChart.setOption(option)
}

// 渲染用户来源图表
const renderUserSourceChart = (data: any) => {
  if (!userSourceChart) {
    userSourceChart = echarts.init(document.getElementById('user-source-chart') as HTMLElement)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.map((item: any) => item.name)
    },
    series: [
      {
        name: '用户来源',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data || []
      }
    ]
  }
  
  userSourceChart.setOption(option)
}

// 渲染设备分布图表
const renderDeviceChart = (data: any) => {
  if (!deviceChart) {
    deviceChart = echarts.init(document.getElementById('device-chart') as HTMLElement)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.map((item: any) => item.name)
    },
    series: [
      {
        name: '访问设备',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data || []
      }
    ]
  }
  
  deviceChart.setOption(option)
}

// 监听周期变化
watch(selectedPeriod, () => {
  fetchArticleTrend()
})

// 窗口大小变化时重绘图表
const handleResize = () => {
  articleTrendChart?.resize()
  userSourceChart?.resize()
  deviceChart?.resize()
}

// 显示提示
const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // 这里可以使用你的提示组件
  console.log(`${type}: ${message}`)
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

// 在组件卸载前移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  articleTrendChart?.dispose()
  userSourceChart?.dispose()
  deviceChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
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

/* 数据卡片样式 */
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
}

.stat-card.articles::before {
  background: linear-gradient(to bottom, #1890ff, #096dd9);
}

.stat-card.users::before {
  background: linear-gradient(to bottom, #52c41a, #389e0d);
}

.stat-card.views::before {
  background: linear-gradient(to bottom, #faad14, #d48806);
}

.stat-card.comments::before {
  background: linear-gradient(to bottom, #f759ab, #eb2f96);
}

.stat-icon {
  background: rgba(24, 144, 255, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #1890ff;
  margin-right: 16px;
}

.stat-card.articles .stat-icon {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.stat-card.users .stat-icon {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stat-card.views .stat-icon {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.stat-card.comments .stat-icon {
  background: rgba(247, 89, 171, 0.1);
  color: #f759ab;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-trend {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #f5222d;
}

/* 图表容器样式 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-wrapper {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.chart-wrapper h2 {
  font-size: 18px;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.chart-container {
  height: 300px;
  width: 100%;
}

.charts-row {
  display: flex;
  gap: 20px;
}

.chart-wrapper.half-width {
  flex: 1;
  min-width: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-period-selector {
  display: flex;
  gap: 8px;
}

.chart-period-selector button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-period-selector button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 热门文章表格样式 */
.popular-articles table {
  width: 100%;
  border-collapse: collapse;
}

.popular-articles th, .popular-articles td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.popular-articles th {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-secondary);
}

.article-title {
  font-weight: 500;
  display: flex;
  align-items: center;
}

.article-title div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
  }
  
  .chart-wrapper.half-width {
    width: 100%;
  }
  
  .article-title div {
    max-width: 200px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* 暗色主题适配 */
:root[class='dark-theme'] .stat-card,
:root[class='dark-theme'] .chart-wrapper {
  background: var(--bg-primary-dark);
}

:root[class='dark-theme'] .chart-period-selector button {
  border-color: var(--border-color-dark);
}

:root[class='dark-theme'] .popular-articles th,
:root[class='dark-theme'] .popular-articles td {
  border-color: var(--border-color-dark);
}
</style> 