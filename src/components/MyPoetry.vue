<template>
  <div class="poetry-card" :class="{ 'dark': isDark }">
    <div class="poetry-content">
      <!-- 诗词内容 -->
      <transition name="fade" mode="out-in">
        <p class="poetry-text" :key="currentPoetry.text">{{ currentPoetry.text }}</p>
      </transition>
      
      <!-- 诗词信息 -->
      <transition name="fade" mode="out-in">
        <div class="poetry-info" :key="currentPoetry.title">
          <div class="poetry-origin">
            <span class="poetry-dynasty">{{ currentPoetry.dynasty }}</span>
            <span>
              <span class="poetry-author">{{ currentPoetry.author }}</span>
              <span class="poetry-title">《{{ currentPoetry.title }}》</span>
            </span>
          </div>
          <span class="poetry-source" v-if="currentPoetry.source">
            ——{{ currentPoetry.source }}
          </span>
        </div>
      </transition>

      <!-- 切换按钮 -->
      <div class="change-btn" @click="changePoetry">
        <Icon icon="mdi:refresh" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

defineProps<{
  isDark?: boolean
}>()

// 诗词数据
const poetryList = [
  {
    text: "日日思君不见君，共饮长江水。此水几时休，此恨何时已。只愿君心似我心，定不负相思意。",
    title: "卜算子·我住长江头",
    author: "李之仪",
    dynasty: "宋",
    source: "《全宋词》"
  },
  {
    text: "人生若只如初见，何事秋风悲画扇。等闲变却故人心，却道故人心易变。骊山语罢清宵半，泪雨零铃终不怨。何如薄幸锦衣郎，比翼连枝当日愿。",
    title: "蝶恋花·春景",
    author: "纳兰性德",
    dynasty: "清",
    source: "《纳兰词》"
  },
  {
    text: "日思君不见君，共饮长江水。此水几时休，此恨何时已。只愿君心似我心，定不负相思意。",
    title: "卜算子·我住长江头",
    author: "李之仪",
    dynasty: "宋",
    source: "《全宋词》"
  }
  // 可以继续添加更多诗词...
]

const currentIndex = ref(0)
const currentPoetry = computed(() => poetryList[currentIndex.value])

// 切换诗词
const changePoetry = () => {
  currentIndex.value = (currentIndex.value + 1) % poetryList.length
}

// 组件加载时随机选择一首诗
onMounted(() => {
  currentIndex.value = Math.floor(Math.random() * poetryList.length)
})
</script>

<style scoped>
@font-face {
  font-family: 'ZhuShiAMaruGothic';
  src: url('../assets/fonts/chinese/筑紫a丸粗.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.poetry-card {
  width: calc(100%);
  height: auto;
  padding: 0px 30px;
  /* margin: 0 auto 50px; */
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.poetry-header {
  margin-bottom: 12px;
}

.poetry-dynasty {
  font-size: 1rem;
  color: #ffffff !important;
  font-weight: 500;
  background-color: #1568ac;
  border-radius: 5px;
  padding: 0px 8px;
}

.poetry-text {
  font-size: 1.5rem;
  line-height: 1.8;
  color: #fff;
  margin: 10px 0px;
  text-align: center;
  font-family: 'ZhuShiAMaruGothic', KaiTi, serif;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #13131377;
  border-radius: 5px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.poetry-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px;
  padding-top: 8px;
}

.poetry-origin {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.poetry-title {
  font-size: 1rem;
  color: rgb(255, 255, 255) !important;
  font-weight: 500;
}

.poetry-author {
  font-size: 1rem;
  color: rgb(255, 255, 255) !important;
}

.poetry-source {
  color: rgba(255, 255, 255, 0.836) !important;
  font-size: 0.85rem;
  font-style: italic;
  margin-left: auto;
  padding-right: 10px;
}

/* 暗色主题 */
.poetry-card.dark {
  background: rgba(30, 30, 30, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark .poetry-text {
  color: #e0e0e0;
}

.dark .poetry-title {
  color: #bbb;
}

.dark .poetry-author {
  color: #999;
}

.dark .poetry-dynasty {
  color: #888;
}

.dark .poetry-source {
  color: #777;
}

.dark.poetry-card::before {
  color: rgba(255, 255, 255, 0.05);
}

/* 悬浮效果 */
.poetry-card:hover {
  border-color: #1568ac;
  box-shadow: 0 0 10px rgba(1, 238, 255, 0.3);
  background: rgba(30, 30, 30, 0.7);
}

/* 移动端适配 */
@media (max-width: 1440px) {
  .poetry-card {
    width: calc(100%);
    margin: 0 auto 20px;
  }
}

@media (max-width: 768px) {
  .poetry-card {
    height: auto;
    min-height: 100px;
    padding: 15px;
  }

  .poetry-text {
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .poetry-info {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .poetry-dynasty {
    align-self: flex-end;
  }

  .poetry-source {
    margin-left: 0;
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .poetry-card {
    margin: 0 auto 15px;
    padding: 12px;
  }

  .poetry-text {
    font-size: 1rem;
  }
}

/* 切换按钮样式 */
.change-btn {
  position: absolute;
  top: 16px;
  right: 35px;
  width: 36px;
  height: 36px;
  border-radius: 5px;
  color: #1568ac;
  /* background: rgba(255, 255, 255, 0.1); */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.change-btn:hover {
  /* background: rgba(255, 255, 255, 0.2); */
  transform: rotate(180deg);
}

.change-btn .iconify {
  font-size: 1.2rem;
  color: rgba(0, 204, 255, 0.8);
}

.dark .change-btn {
  background: rgba(255, 255, 255, 0.1);
}

.dark .change-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dark .change-btn .iconify {
  color: #bbb;
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style> 