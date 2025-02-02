<template>
  <div class="pie-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface CategoryData {
  name: string
  value: number
}

const props = defineProps<{
  data: CategoryData[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const getChartOption = (categoryData: CategoryData[]) => {
  const sum = categoryData.reduce((cur, pre) => cur + pre.value, 0)
  const data = []
  const legendData = []
  const color = [
    '#00a8ff',  // 亮蓝色
    '#3498db',  // 蓝色
    '#2980b9',  // 深蓝色
    '#87CEEB',  // 天蓝色
    '#1e3799',  // 深蓝色
    '#192a56'   // 暗蓝色
  ]

  for (let i = 0; i < categoryData.length; i++) {
    const name = `${categoryData[i].name}`
    legendData.push(name)
    data.push(
      {
        value: categoryData[i].value,
        name: name,
        itemStyle: {
          borderWidth: 0,
          borderRadius: 10,
          shadowBlur: 10,
          borderColor: color[i],
          shadowColor: color[i]
        }
      },
      {
         value: sum / 50, // 控制每个环形之间的间隙
         name: '',
         itemStyle: {
            color: 'rgba(0, 0, 0, 0)',
            borderColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 0,
            opacity: 0
         },
         label: {
           show: false
         },
         labelLine: {
           show: false
         },
         emphasis: {
           disabled: true
         },
         tooltip: {
           show: false
         }
      }
    )
  }

  return {
    backgroundColor: 'transparent',
    title: {
      text: '文章分类',
      subtext: sum,
      textStyle: {
        fontFamily: 'ZhuZiAWan',
        color: '#ffffff',
        fontSize: 44,
        padding: [0, 0, 0, 0],
        margin: [100, 0, 0, 0],
        fontWeight: 'bolder',
        marginTop: '100px'
      },
      subtextStyle: {
        fontFamily: 'ZhuZiAWan',
        fontSize: 28,
        fontWeight: 'bolder',
        color: '#00a8ff',
      },
      x: 'center',
      y: 'top'
    },
    color: color,
    tooltip: {
      show: true,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#00a8ff',
      textStyle: {
        fontFamily: 'ZhuZiAWan',
        fontSize: 16,
        color: '#fff'
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 16,
      itemHeight: 8,
      itemStyle: {
        borderWidth: 8,
        borderRadius: 4
      },
      orient: 'horizontal',
      data: legendData,
      bottom: '0%',
      left: 'center',
      width: '80%',
      align: 'left',
      textStyle: {
        fontFamily: 'ZhuZiAWan',
        color: '#fff',
        fontSize: 18,
        padding: [0, 0, 0, 10]
      },
      itemGap: 55,
      formatter: function(name: string) {
        return name
      },
      pageIconColor: '#00a8ff',
      pageTextStyle: {
        color: '#fff'
      },
      type: 'scroll',
      pageButtonPosition: 'end'
    },
    toolbox: {
      show: false
    },
    series: [
      {
        name: '分类数量',
        type: 'pie',
        clockwise: false,
        radius: ['40%', '60%'],
        center: ['50%', '55%'],
        itemStyle: {
          borderRadius: 4,
          borderWidth: 5,
          borderColor: 'transparent'
        },
        emphasis: {
          scale: false,
          itemStyle: {
            shadowBlur: 20,
            shadowColor: '#00a8ff'
          }
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{c}',
          fontFamily: 'ZhuZiAWan',
          color: '#fff',
          fontSize: 24,
          textShadow: '0 0 3px rgba(0, 168, 255, 0.5)'
        },
        labelLine: {
          length: 15,
          length2: 80,
          smooth: 0.2,
          maxSurfaceAngle: 80
        },
        data: data
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

.pie-chart {
  width: 100%;
  height: 450px;
}
</style> 