<template>
  <div class="line-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface MonthData {
  month: string
  count: number
}

const props = defineProps<{
  data: MonthData[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const getChartOption = (monthData: MonthData[]) => {
  return {
    backgroundColor: 'transparent',
    color: ['#00a8ff'],
    title: {
      text: '文章发布趋势',
      textStyle: {
        color: '#ffffff',
        fontSize: 36,
        fontFamily: 'ZhuZiAWan',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0, 168, 255, 0.5)'
      },
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#00a8ff',
          width: 2,
          type: 'dashed'
        }
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#00a8ff',
      textStyle: {
        color: '#fff',
        fontFamily: 'ZhuZiAWan'
      }
    },
    grid: {
      left: '5%',
      right: '10%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        name: '发布月份',
        nameTextStyle: {
          color: '#00a8ff',
          fontSize: 16,
          fontFamily: 'ZhuZiAWan',
        },
        type: 'category',
        data: monthData.map(item => item.month),
        boundaryGap: false,
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            width: 1
          }
        },
        axisLabel: {
          color: 'white',
          fontSize: 14,
          fontFamily: 'ZhuZiAWan'
        }
      }
    ],
    yAxis: [
      {
        name: '文章数量',
        min: 0,
        position: 'left',
        nameTextStyle: {
          color: '#00a8ff',
          fontSize: 16,
          fontFamily: 'ZhuZiAWan'
        },
        type: 'value',
        axisLabel: {
          color: 'white',
          fontSize: 14,
          fontFamily: 'ZhuZiAWan'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    ],
    series: [
      {
        name: '文章数量',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        symbol: 'circle',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontFamily: 'ZhuZiAWan',
          fontSize: 14,
          color: '#fff',
          textShadow: '0 0 3px rgba(0, 168, 255, 0.5)'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        lineStyle: {
          width: 4,
          shadowColor: '#00a8ff',
          shadowBlur: 15,
          cap: 'round',
          join: 'round'
        },
        areaStyle: {
          opacity: 1,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 168, 255, 0.4)'
              },
              {
                offset: 0.3,
                color: 'rgba(0, 168, 255, 0.2)'
              },
              {
                offset: 1,
                color: 'rgba(0, 168, 255, 0)'
              }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#fff',
            borderColor: '#00a8ff',
            borderWidth: 2,
            shadowColor: '#00a8ff',
            shadowBlur: 10
          }
        },
        data: monthData.map(item => item.count)
      }
    ]
  }
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(getChartOption(props.data))
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (chart) {
    chart.setOption(getChartOption(newData))
  }
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
@font-face {
  font-family: 'ZhuZiAWan';
  src: url('@/assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
}

.line-chart {
  width: 100%;
  height: 400px;
}
</style> 