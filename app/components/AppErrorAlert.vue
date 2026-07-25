<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
  close: []
}>()

const visible = ref(true)

function handleClose() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="error-alert" role="alert">
    <p class="message">{{ message }}</p>
    <div class="actions">
      <button type="button" class="retry-btn" @click="emit('retry')">再試行</button>
      <button type="button" class="close-btn" aria-label="閉じる" @click="handleClose">×</button>
    </div>
  </div>
</template>

<style scoped>
.error-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.message {
  flex: 1;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #dc2626;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.close-btn {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
}
</style>
