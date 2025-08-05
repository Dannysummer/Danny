<template>
  <div class="bar-chart">
    <div class="chart-title">文章标签统计</div>
    <div class="chart-container">
      <!-- 背景刻度线 -->
      <div class="grid-lines">
        <div v-for="value in yAxisValues" :key="value" class="grid-line" 
             :style="{ bottom: `${(value / maxGridValue) * 101}%` }">
        </div>
      </div>
      
      <!-- Y轴 -->
      <div class="y-axis">
        <div class="y-axis-line"></div>
        <div v-for="value in yAxisValues" :key="value" class="y-label"
             :style="{ bottom: `${(value / maxGridValue) }%` }">
          <div class="y-tick"></div>
          {{ value }}
        </div>
        <div class="y-axis-title">文章数量</div>
      </div>
      
      <div class="bars-wrapper"
          ref="barsWrapper"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart.passive="startDrag"
          @touchmove="onDrag"
          @touchend="stopDrag">
        <div class="bars-container">
          <div v-for="tag in sortedTags" :key="tag.name" class="bar-item">
            <div class="bar-wrapper">
              <div class="bar" 
                   :style="{ 
                     height: `${getBarHeight(tag.count)}px`,
                     background: getBarGradient(tag.count)
                   }">
                <span class="count" :style="{ opacity: 1 }">{{ tag.count }}</span>
              </div>
            </div>
            <span class="label">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- X轴 -->
    <div class="x-axis">
      <div class="x-axis-title">标签名称</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Tag {
  name: string
  count: number
}

const props = defineProps<{
  tags: Tag[]
}>()

const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => b.count - a.count)
})

const maxCount = computed(() => Math.max(...props.tags.map(t => t.count)))

const maxGridValue = computed(() => {
  const max = maxCount.value + 2
  return Math.max(2, Math.ceil(max / 2) * 2)
})

const yAxisValues = computed(() => {
  const values = []
  const step = Math.ceil(maxGridValue.value / 4)
  for (let i = 0; i <= maxGridValue.value; i += step) {
    values.push(i)
  }
  return values
})

const getBarHeight = (count: number) => {
  const containerHeight = 150 // 容器总高度
  const heightPerUnit = containerHeight / maxGridValue.value
  return Math.round(count * heightPerUnit)
}

const getBarGradient = (count: number) => {
  const intensity = count / maxCount.value
  const alpha = 0.3 + intensity * 0.7
  return `linear-gradient(to top, 
    rgba(30, 55, 153, ${alpha}), 
    rgba(0, 168, 255, ${alpha}))`
}

const barsWrapper = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const wrapper = barsWrapper.value
  if (!wrapper) return
  
  const clientX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX
  startX.value = clientX - wrapper.offsetLeft
  scrollLeft.value = wrapper.scrollLeft
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  
  const wrapper = barsWrapper.value
  if (!wrapper) return
  
  const clientX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX
  const x = clientX - wrapper.offsetLeft
  const walk = (x - startX.value) * 2
  wrapper.scrollLeft = scrollLeft.value - walk
}

const stopDrag = () => {
  isDragging.value = false
}
</script>

<style scoped>
.bar-chart {
  width: 100%;
  padding: 30px;
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-top: 20px;
  position: relative;
}

.chart-title {
  text-align: center;
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  height: 200px;
  padding-left: 40px;
  position: relative;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  left: 50px;
  right: 0;
  top: 21px;
  height: 150px;
  pointer-events: none;
  z-index: 0;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 20px;
  width: 55px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  padding-top: 10px;
}

.y-axis-line {
  position: absolute;
  top: 10px;
  bottom: 0;
  right: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.y-axis-title {
  position: absolute;
  left: 20px;
  top: 80%;
  transform: rotate(-90deg) translateX(50%);
  transform-origin: left;
  color: #00a8ff;
  font-size: 0.9rem;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
}

.y-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  text-align: right;
  padding-right: 8px;
  position: relative;
}

.y-tick {
  position: absolute;
  right: -4px;
  top: 50%;
  width: 4px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.bars-wrapper {
  flex: 1;
  left: 20px;
  overflow-x: auto;
  position: relative;
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  cursor: grab;
  user-select: none;
  z-index: 1;  /* 确保在网格线上层 */
}

/* 隐藏 Webkit 浏览器的滚动条 */
.bars-wrapper::-webkit-scrollbar {
  display: none;
}

.bars-wrapper:active {
  cursor: grabbing;
}

.bars-container {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  min-width: max-content;
  padding-right: 20px;
  pointer-events: none;  /* 确保拖动时不会选中内容 */
}

.x-axis {
  height: 1px;
  background: rgba(255, 255, 255, 0.0);
  margin: 0 40px;
  position: relative;
}

.x-axis-title {
  position: absolute;
  right: -60px;
  bottom: -10px;
  color: #00a8ff;
  font-size: 0.8rem;
  text-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 80px;
}

.bar-wrapper {
  display: flex;
  align-items: flex-end;
  height: 150px;  /* 确保与 grid-lines 高度一致 */
  width: 100%;
}

.bar {
  width: 100%;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 168, 255, 0.2);
}

.bar:hover {
  transform: scaleY(1.05);
  box-shadow: 0 0 20px rgba(0, 168, 255, 0.4);
}

.count {
  color: #fff;
  font-size: 0.8rem;
  padding: 4px;
  position: absolute;
  top: -20px;
  text-shadow: 0 0 10px rgba(0, 168, 255, 0.5);
}

.label {
  margin-top: 8px;
  color: #fff;
  font-size: 0.9rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 4px;
}

@media (max-width: 768px) {
  .chart-container {
    padding-left: 50px;
  }
  
  .grid-lines {
    left: 50px;
  }
  
  .y-axis-title {
    left: -30px;
  }
}
</style> 