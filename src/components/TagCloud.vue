<template>
  <div class="tag-cloud" ref="cloudContainer">
    <span
      v-for="tag in tags"
      :key="tag.name"
      class="tag-item"
      :style="{
        fontSize: `${getTagSize(tag.count)}rem`,
        color: getTagColor(tag.count)
      }"
      @click="$emit('select-tag', tag.name)"
    >
      {{ tag.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Tag {
  name: string
  count: number
}

const props = defineProps<{
  tags: Tag[]
}>()

defineEmits(['select-tag'])

const getTagSize = (count: number) => {
  const minSize = 0.5
  const maxSize = 1.5
  const maxCount = Math.max(...props.tags.map(t => t.count))
  return minSize + (count / maxCount) * (maxSize - minSize)
}

const getTagColor = (count: number) => {
  const colors = ['rgba(255, 255, 255, 0.6)', '#87CEEB', '#3498db', '#00a8ff']
  const maxCount = Math.max(...props.tags.map(t => t.count))
  const index = Math.floor((count / maxCount) * (colors.length - 1))
  return colors[index]
}
</script>

<style scoped>
.tag-cloud {
  width: 100%;
  min-height: 300px;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.tag-item {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.tag-item:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
}
</style> 