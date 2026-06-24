<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { content: string; date: string }]
}>()

const content = ref('')
const date = ref('')

const isDisabled = computed(() => !content.value.trim() || !date.value || props.loading)

function handleSubmit() {
  if (isDisabled.value) return
  emit('submit', { content: content.value.trim(), date: date.value })
  content.value = ''
  date.value = ''
}
</script>

<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="topic-content" class="label">トピック</label>
      <textarea
        id="topic-content"
        v-model="content"
        class="textarea"
        placeholder="今日あったことを書いてみましょう…"
        rows="2"
      />
    </div>
    <div class="field">
      <label for="topic-date" class="label">日付</label>
      <div class="date-wrapper">
        <input id="topic-date" v-model="date" type="date" class="input date-input" />
        <svg
          class="calendar-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    </div>
    <button type="submit" class="submit-btn" :disabled="isDisabled">追加する</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #bab9d0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input,
.textarea {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  font-size: 14px;
  color: #29303e;
  background: #f1f3f7;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
}

.input:focus,
.textarea:focus {
  border-color: #4754f0;
}

.date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #bab9d0;
  pointer-events: none;
}

.date-input {
  padding-right: 36px;
}

.date-input::-webkit-calendar-picker-indicator {
  display: none;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: #4754f0;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
