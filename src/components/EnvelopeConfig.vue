<template>
  <div class="config-container">
    <div class="test-controls">
      <button class="test-button" @click="showEnvelope">
        <Icon icon="mdi:email" class="button-icon" />
        显示信封
      </button>
      
      <button class="test-button" @click="clearStorage">
        <Icon icon="mdi:refresh" class="button-icon" />
        重置显示状态
      </button>
    </div>

    <div class="config-panel">
      <h2 class="panel-title">信封配置</h2>
      
      <div class="config-item">
        <label>标题</label>
        <input v-model="config.title" type="text" placeholder="输入信封标题">
      </div>
      
      <div class="config-item">
        <label>内容</label>
        <textarea 
          v-model="config.content" 
          placeholder="输入信封内容，支持HTML标签"
          rows="4"
        ></textarea>
      </div>
      
      <div class="config-item">
        <label>按钮文字</label>
        <input v-model="config.buttonText" type="text" placeholder="输入按钮文字">
      </div>
      
      <div class="config-item">
        <label>显示间隔（小时）</label>
        <input 
          v-model.number="intervalHours" 
          type="number" 
          min="0" 
          @input="updateInterval"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

const config = ref({
  title: '欢迎来到我的博客',
  content: `
    <p>亲爱的访客：</p>
    <p>很高兴你能来到我的博客！</p>
    <p>这里有关于前端开发的各种分享和思考。</p>
    <p>希望你能找到感兴趣的内容！</p>
  `,
  buttonText: '我知道了',
  showInterval: 24 * 60 * 60 * 1000
})

const intervalHours = computed({
  get: () => config.value.showInterval / (60 * 60 * 1000),
  set: (val) => {
    config.value.showInterval = val * 60 * 60 * 1000
  }
})

const updateInterval = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  config.value.showInterval = Number(value) * 60 * 60 * 1000
}

const showEnvelope = () => {
  localStorage.removeItem('lastEnvelopeShowTime')
  window.location.reload()
}

const clearStorage = () => {
  localStorage.removeItem('lastEnvelopeShowTime')
  alert('显示状态已重置！')
}

defineExpose({
  config
})
</script>

<style scoped>
/* 保留原来的样式代码 */
</style> 