<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { title: string; content: string; date: string }]
}>()

const title = ref('')
const content = ref('')
const date = ref('')

const isDisabled = computed(
  () => !title.value.trim() || !content.value.trim() || !date.value || props.loading,
)

function handleSubmit() {
  if (isDisabled.value) return
  emit('submit', { title: title.value.trim(), content: content.value.trim(), date: date.value })
  title.value = ''
  content.value = ''
  date.value = ''
}
</script>

<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="dn-title" class="label">タイトル</label>
      <input
        id="dn-title"
        v-model="title"
        type="text"
        class="input"
        placeholder="今日学んだことのタイトル"
      />
    </div>
    <div class="field">
      <label for="dn-content" class="label">内容</label>
      <textarea
        id="dn-content"
        v-model="content"
        class="textarea"
        placeholder="内容を詳しく書いてみましょう…"
        rows="2"
      />
    </div>
    <div class="field">
      <label for="dn-date" class="label">日付</label>
      <div class="date-wrapper">
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
        <input id="dn-date" v-model="date" type="date" class="input date-input" />
      </div>
    </div>
    <button type="submit" class="submit-btn" :disabled="isDisabled">保存する</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #29303e;
}

.input,
.textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0dfe9;
  border-radius: 10px;
  font-size: 14px;
  color: #29303e;
  background: #f8f8fb;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
}

.input:focus,
.textarea:focus {
  border-color: #6570f4;
}

.date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.calendar-icon {
  position: absolute;
  left: 12px;
  color: #7c85a2;
  pointer-events: none;
}

.date-input {
  padding-left: 36px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: #4754f0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
