<script setup lang="ts">
import { ref } from 'vue'
import type { Topic } from '#shared/types/domain'
import { formatDate } from '~/utils/date'

const props = withDefaults(
  defineProps<{
    items: Topic[]
    sortOrder: 'asc' | 'desc'
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  toggleSort: []
  update: [id: string, content: string]
  remove: [id: string]
}>()

const editingId = ref<string | null>(null)
const editContent = ref('')

function startEdit(item: Topic) {
  editingId.value = item.id
  editContent.value = item.content
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

function saveEdit() {
  if (!editContent.value.trim() || !editingId.value) return
  emit('update', editingId.value, editContent.value.trim())
  editingId.value = null
  editContent.value = ''
}
</script>

<template>
  <div>
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p class="empty-title">まだ記録がありません</p>
      <p class="empty-sub">今日あったことを<br />上のフォームに記録しましょう</p>
    </div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="card">
        <template v-if="editingId === item.id">
          <textarea v-model="editContent" class="edit-textarea" :disabled="props.loading" />
          <div class="edit-actions">
            <button
              type="button"
              class="save-btn"
              :disabled="!editContent.trim() || props.loading"
              @click="saveEdit"
            >
              保存
            </button>
            <button type="button" class="cancel-btn" :disabled="props.loading" @click="cancelEdit">
              キャンセル
            </button>
          </div>
        </template>
        <template v-else>
          <p class="card-content">{{ item.content }}</p>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(item.created_at) }}</span>
            <div class="card-actions">
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
                class="delete-btn"
                :disabled="props.loading"
                @click="emit('remove', item.id)"
              >
                削除
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 13px 15px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.card-content {
  font-size: 13px;
  color: #4a4a68;
  margin: 0 0 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-date {
  font-size: 11px;
  color: #bab9d0;
}

.card-actions {
  display: flex;
  gap: 6px;
}

.delete-btn {
  font-size: 11px;
  font-weight: 600;
  color: #e05252;
  background: rgba(224, 82, 82, 0.08);
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(224, 82, 82, 0.15);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  font-size: 11px;
  font-weight: 600;
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

.edit-textarea {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  color: #4a4a68;
  resize: vertical;
  min-height: 72px;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.edit-textarea:focus {
  outline: none;
  border-color: #4754f0;
}

.edit-textarea:disabled {
  opacity: 0.6;
}

.edit-actions {
  display: flex;
  gap: 8px;
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
