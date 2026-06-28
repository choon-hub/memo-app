<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { WorkoutRecord } from '#shared/types/domain'

const props = defineProps<{
  loading?: boolean
  prefill?: WorkoutRecord
  menuSuggestions?: string[]
}>()

const emit = defineEmits<{
  submit: [payload: { menu: string; intensity: number; reps: number; date: string }]
}>()

const menu = ref('')
const intensity = ref('')
const reps = ref('')
const date = ref('')

onMounted(() => {
  date.value = new Date().toLocaleDateString('en-CA')
})

watch(
  () => props.prefill,
  (record) => {
    if (!record) return
    menu.value = record.menu
    intensity.value = String(record.intensity)
    reps.value = String(record.reps)
  },
)

const isDisabled = computed(() => {
  const intensityNum = Number(intensity.value)
  const repsNum = Number(reps.value)
  return (
    !menu.value.trim() ||
    intensity.value === '' ||
    isNaN(intensityNum) ||
    intensityNum < 0 ||
    reps.value === '' ||
    isNaN(repsNum) ||
    !Number.isInteger(repsNum) ||
    repsNum <= 0 ||
    !date.value ||
    props.loading
  )
})

function handleSubmit() {
  if (isDisabled.value) return
  emit('submit', {
    menu: menu.value.trim(),
    intensity: Number(intensity.value),
    reps: Number(reps.value),
    date: date.value,
  })
  menu.value = ''
  intensity.value = ''
  reps.value = ''
  date.value = new Date().toLocaleDateString('en-CA')
}
</script>

<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="fields">
      <div class="field field-menu">
        <label for="wo-menu" class="label">メニュー</label>
        <input
          id="wo-menu"
          v-model="menu"
          type="text"
          class="input"
          placeholder="種目名"
          list="wo-menu-list"
        />
        <datalist id="wo-menu-list">
          <option v-for="s in props.menuSuggestions" :key="s" :value="s" />
        </datalist>
      </div>
      <div class="field field-intensity">
        <label for="wo-intensity" class="label">重量 kg</label>
        <input
          id="wo-intensity"
          v-model="intensity"
          type="number"
          class="input"
          placeholder="0"
          min="0"
          step="0.5"
        />
      </div>
      <div class="field field-reps">
        <label for="wo-reps" class="label">回数</label>
        <input
          id="wo-reps"
          v-model="reps"
          type="number"
          class="input"
          placeholder="0"
          min="1"
          step="1"
        />
      </div>
    </div>
    <div class="field">
      <label for="wo-date" class="label">日付</label>
      <div class="date-wrapper">
        <input id="wo-date" v-model="date" type="date" class="input date-input" />
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
    <button type="submit" class="submit-btn" :disabled="isDisabled">記録する</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
}

.fields {
  display: flex;
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-menu {
  flex: 2;
}

.field-intensity,
.field-reps {
  flex: 1;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #bab9d0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  font-size: 14px;
  color: #29303e;
  background: #f1f3f7;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus {
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
