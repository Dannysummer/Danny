<template>
  <ImgBg :rows="imageRows" enter-text="探索">
    <div class="content__header">
      <h2>测试画廊</h2>
    </div>
    <div class="content__text">
      <p class="right">这是一个用于测试 ImgBg 组件的演示页面。通过鼠标移动可以看到图片的动态效果。</p>
      <p class="highlight">点击"探索"按钮查看全屏切换效果。</p>
      <p>这个组件实现了：
        - 图片网格的动态变形
        - 鼠标跟踪效果
        - 平滑的过渡动画
        - 响应式布局
        - 触摸设备支持

      </p>
    </div>
  </ImgBg>
</template>

<script setup lang="ts">
import ImgBg from '../components/ImgBg.vue'
import type { ImgBgRow } from '../types'

// 测试图片数据
const imageRows: ImgBgRow[] = [
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/004/157/348/4k/weta-workshop-design-studio-1-thrarealm-gh-2eflatgh.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdnb.artstation.com/p/assets/images/images/063/380/103/large/still-xvii-elfs-environment-14.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/063/380/124/large/still-xvii-mordor-environment-7.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdnb.artstation.com/p/assets/images/images/064/258/965/large/artem-demura-4.jpg'
    }))
  },
  {
    items: Array(9).fill(null).map(() => ({
      url: 'https://cdna.artstation.com/p/assets/images/images/076/855/492/large/artem-demura-erebos3-copy.jpg'
    }))
  }
]
</script>

<style scoped>
.content__header h2 {
  font-size: clamp(2rem, 20vh, 16rem);
  font-family: "Anton", sans-serif;
  margin: 6rem 0 10vh;
  line-height: 0.9;
}

.content__text {
  text-wrap: balance;
  display: flex;
  flex-direction: column;
  gap: 10vh;
  padding: 0 5vw;
}

.content__text p {
  max-width: 700px;
  font-size: 1.5rem;
  line-height: 1.4;
  margin: 0;
  margin-left: auto;
}

.content__text p.highlight {
  max-width: 1000px;
  font-size: clamp(2rem, 7vh, 4rem);
  font-family: "Poppins", sans-serif;
  font-weight: 300;
}
</style> 