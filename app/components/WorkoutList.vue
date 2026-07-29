<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkoutCategory, WorkoutRecord } from '#shared/types/domain'
import { formatDate, toDateInputValue } from '~/utils/date'
import AppSpinner from '~/components/AppSpinner.vue'

const props = defineProps<{
  items: WorkoutRecord[]
  sortOrder: 'asc' | 'desc'
  loading: boolean
}>()

const emit = defineEmits<{
  toggleSort: []
  copy: [item: WorkoutRecord]
  update: [id: string, payload: { menu: string; intensity: number; reps: number; date: string }]
  remove: [id: string]
}>()

const categoryLabels: Record<WorkoutCategory, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
}

const editingId = ref<string | null>(null)
const editMenu = ref('')
const editIntensity = ref('')
const editReps = ref('')
const editDate = ref('')
const confirmingId = ref<string | null>(null)

function startEdit(item: WorkoutRecord) {
  editingId.value = item.id
  editMenu.value = item.menu
  editIntensity.value = String(item.intensity)
  editReps.value = String(item.reps)
  editDate.value = toDateInputValue(item.created_at)
  confirmingId.value = null
}

function cancelEdit() {
  editingId.value = null
  editMenu.value = ''
  editIntensity.value = ''
  editReps.value = ''
  editDate.value = ''
}

const isSaveDisabled = computed(() => {
  const intensityNum = Number(editIntensity.value)
  const repsNum = Number(editReps.value)
  return (
    !editMenu.value.trim() ||
    editIntensity.value === '' ||
    isNaN(intensityNum) ||
    intensityNum < 0 ||
    editReps.value === '' ||
    isNaN(repsNum) ||
    !Number.isInteger(repsNum) ||
    repsNum <= 0 ||
    !editDate.value ||
    props.loading
  )
})

function saveEdit() {
  if (isSaveDisabled.value || !editingId.value) return
  emit('update', editingId.value, {
    menu: editMenu.value.trim(),
    intensity: Number(editIntensity.value),
    reps: Number(editReps.value),
    date: editDate.value,
  })
  cancelEdit()
}

function startDelete(item: WorkoutRecord) {
  confirmingId.value = item.id
}

function cancelDelete() {
  confirmingId.value = null
}

function confirmDelete() {
  if (!confirmingId.value) return
  emit('remove', confirmingId.value)
  confirmingId.value = null
}
</script>

<template>
  <div class="list-wrapper">
    <AppSpinner v-if="props.loading" />
    <div class="sort-bar">
      <button type="button" class="sort-btn" @click="emit('toggleSort')">
        {{ sortOrder === 'desc' ? '新しい順' : '古い順' }}
      </button>
    </div>
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#AE94FB"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>
      <p class="empty-title">まだ記録がありません</p>
      <p class="empty-sub">上のフォームから<br />トレーニングを記録しましょう</p>
    </div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="card">
        <template v-if="editingId === item.id">
          <input v-model="editMenu" class="edit-input" type="text" :disabled="props.loading" />
          <div class="edit-fields">
            <input
              v-model="editIntensity"
              class="edit-input edit-input-number"
              type="number"
              min="0"
              step="0.5"
              :disabled="props.loading"
            />
            <input
              v-model="editReps"
              class="edit-input edit-input-number"
              type="number"
              min="1"
              step="1"
              :disabled="props.loading"
            />
            <input
              v-model="editDate"
              class="edit-input edit-input-date"
              type="date"
              :disabled="props.loading"
            />
          </div>
          <div class="card-actions">
            <button type="button" class="save-btn" :disabled="isSaveDisabled" @click="saveEdit">
              保存
            </button>
            <button type="button" class="cancel-btn" :disabled="props.loading" @click="cancelEdit">
              キャンセル
            </button>
          </div>
        </template>
        <template v-else>
          <div class="card-header">
            <span class="card-menu">{{ item.menu }}</span>
            <span class="card-badge">{{ categoryLabels[item.category] }}</span>
          </div>
          <span class="card-stats">{{ item.intensity }}kg × {{ item.reps }}回</span>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(item.created_at) }}</span>
            <div class="card-actions">
              <template v-if="confirmingId === item.id">
                <span class="confirm-label">削除しますか？</span>
                <button
                  type="button"
                  class="confirm-delete-btn"
                  :disabled="props.loading"
                  @click="confirmDelete"
                >
                  削除する
                </button>
                <button
                  type="button"
                  class="cancel-btn"
                  :disabled="props.loading"
                  @click="cancelDelete"
                >
                  キャンセル
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="edit-btn"
                  :disabled="props.loading"
                  @click="startEdit(item)"
                >
                  編集
                </button>
                <button
                  type="button"
                  class="copy-btn"
                  :disabled="props.loading"
                  @click="emit('copy', item)"
                >
                  コピー
                </button>
                <button
                  type="button"
                  class="delete-btn"
                  :disabled="props.loading"
                  @click="startDelete(item)"
                >
                  削除
                </button>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-wrapper {
  position: relative;
}

.sort-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.sort-btn {
  font-size: 12px;
  font-weight: 600;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.08);
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.sort-btn:hover {
  background: rgba(71, 84, 240, 0.15);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 28px 48px;
  gap: 0;
  text-align: center;
}

.empty-icon-wrapper {
  width: 84px;
  height: 84px;
  background: rgba(174, 148, 251, 0.14);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}

.empty-title {
  font-size: 17px;
  font-weight: 800;
  color: #29303e;
  margin: 0 0 10px;
  line-height: 1.3;
}

.empty-sub {
  font-size: 13px;
  color: #bab9d0;
  text-align: center;
  line-height: 1.65;
  margin: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
  padding: 13px 14px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.card-menu {
  font-size: 14px;
  font-weight: 700;
  color: #29303e;
}

.card-badge {
  font-size: 11px;
  font-weight: 700;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.1);
  border-radius: 10px;
  padding: 2px 8px;
}

.card-stats {
  font-size: 14px;
  font-weight: 700;
  color: #4754f0;
  margin-bottom: 5px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 11px;
  color: #bab9d0;
}

.copy-btn {
  font-size: 11px;
  font-weight: 700;
  color: #4754f0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.copy-btn:hover:not(:disabled) {
  opacity: 1;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.edit-btn {
  font-size: 11px;
  font-weight: 700;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.08);
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.edit-btn:hover:not(:disabled) {
  background: rgba(71, 84, 240, 0.15);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-label {
  font-size: 11px;
  font-weight: 700;
  color: #4a4a68;
  align-self: center;
}

.confirm-delete-btn {
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #e05252;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #c94444;
}

.confirm-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  font-size: 11px;
  font-weight: 700;
  color: #4a4a68;
  background: rgba(74, 74, 104, 0.08);
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(74, 74, 104, 0.15);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-input {
  font-size: 14px;
  font-weight: 700;
  color: #29303e;
  border: 1px solid rgba(71, 84, 240, 0.3);
  border-radius: 6px;
  padding: 6px 8px;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 6px;
}

.edit-fields {
  display: flex;
  gap: 6px;
}

.edit-input-number {
  flex: 1;
  min-width: 0;
}

.edit-input-date {
  flex: 1;
  min-width: 0;
}

.edit-input:disabled {
  opacity: 0.6;
}

.save-btn {
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: #4754f0;
  border: none;
  border-radius: 4px;
  padding: 5px 14px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.save-btn:hover:not(:disabled) {
  background: #3a45d4;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  font-size: 12px;
  font-weight: 600;
  color: #4a4a68;
  background: rgba(74, 74, 104, 0.08);
  border: none;
  border-radius: 4px;
  padding: 5px 14px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(74, 74, 104, 0.15);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
