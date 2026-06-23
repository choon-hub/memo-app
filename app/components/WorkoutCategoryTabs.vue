<script setup lang="ts">
import type { WorkoutCategory } from '#shared/types/domain'

defineProps<{
  modelValue: WorkoutCategory
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WorkoutCategory]
}>()

const tabs: { label: string; value: WorkoutCategory }[] = [
  { label: '胸', value: 'chest' },
  { label: '背中', value: 'back' },
  { label: '脚', value: 'legs' },
]
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="tab"
      :class="{ active: modelValue === tab.value }"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  background: #f1f3f7;
  border-radius: 4px;
  padding: 3px;
  gap: 2px;
}

.tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  color: #bab9d0;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.tab.active {
  background: #4754f0;
  color: white;
  font-weight: 700;
}
</style>
