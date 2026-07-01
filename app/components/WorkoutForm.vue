<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { WorkoutRecord } from '#shared/types/domain'

const props = defineProps<{
  loading?: boolean
  prefill?: WorkoutRecord
  menuSuggestions?: string[]
  menuCandidates?: string[]
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

function applyCandidate(name: string) {
  menu.value = name
}

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
    <div v-if="props.menuCandidates?.length" class="candidates">
      <button
        v-for="c in props.menuCandidates"
        :key="c"
        type="button"
        class="candidate-chip"
        @click="applyCandidate(c)"
      >
        {{ c }}
      </button>
    </div>
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
        <CalendarIcon />
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

.candidates {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.candidate-chip {
  font-size: 12px;
  font-weight: 700;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.1);
  border: none;
  border-radius: 10px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: inherit;
}
</style>
