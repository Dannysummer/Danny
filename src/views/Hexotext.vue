<template>
  <div class="hexotext-container">
    <HexoLetterhead v-bind="configRef?.config" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HexoLetterhead from '../components/HexoLetterhead.vue'

const configRef = ref()
</script>

<style scoped>
.hexotext-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: visible;
}
</style> 