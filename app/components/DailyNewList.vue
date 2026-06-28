<script setup lang="ts">
import { ref } from 'vue'
import type { DailyNew } from '#shared/types/domain'

const props = defineProps<{
  items: DailyNew[]
  sortOrder: 'asc' | 'desc'
  loading?: boolean
}>()

const emit = defineEmits<{
  toggleSort: []
  update: [id: string, title: string, content: string]
  remove: [id: string]
}>()

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editContent = ref('')

function startEdit(item: DailyNew) {
  editingId.value = item.id
  editTitle.value = item.title
  editContent.value = item.content
}

function cancelEdit() {
  editingId.value = null
  editTitle.value = ''
  editContent.value = ''
}

function saveEdit() {
  if (!editTitle.value.trim() || !editContent.value.trim() || !editingId.value) return
  emit('update', editingId.value, editTitle.value.trim(), editContent.value.trim())
  editingId.value = null
  editTitle.value = ''
  editContent.value = ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
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
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
          />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </svg>
      </div>
      <p class="empty-title">まだ記録がありません</p>
      <p class="empty-sub">今日の新しい発見を<br />上のフォームに記録しましょう</p>
    </div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="card">
        <template v-if="editingId === item.id">
          <input v-model="editTitle" class="edit-input" type="text" :disabled="props.loading" />
          <textarea
            v-model="editContent"
            class="edit-textarea"
            rows="3"
            :disabled="props.loading"
          />
          <div class="card-actions">
            <button type="button" class="btn-save" :disabled="props.loading" @click="saveEdit">
              保存
            </button>
            <button type="button" class="btn-cancel" :disabled="props.loading" @click="cancelEdit">
              キャンセル
            </button>
          </div>
        </template>
        <template v-else>
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-content">{{ item.content }}</p>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(item.created_at) }}</span>
            <div class="card-actions">
              <button
                type="button"
                class="btn-edit"
                :disabled="props.loading"
                @click="startEdit(item)"
              >
                編集
              </button>
              <button
                type="button"
                class="btn-delete"
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

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #29303e;
  margin: 0 0 3px;
  line-height: 1.3;
}

.card-content {
  font-size: 13px;
  color: #4a4a68;
  margin: 0 0 5px;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

.btn-edit,
.btn-save {
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

.btn-edit:hover,
.btn-save:hover {
  background: rgba(71, 84, 240, 0.15);
}

.btn-edit:disabled,
.btn-save:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-delete,
.btn-cancel {
  font-size: 12px;
  font-weight: 600;
  color: #4a4a68;
  background: rgba(74, 74, 104, 0.08);
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-delete:hover,
.btn-cancel:hover {
  background: rgba(74, 74, 104, 0.15);
}

.btn-delete:disabled,
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: default;
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

.edit-textarea {
  font-size: 13px;
  color: #4a4a68;
  border: 1px solid rgba(71, 84, 240, 0.3);
  border-radius: 6px;
  padding: 6px 8px;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  margin-bottom: 8px;
  line-height: 1.5;
}

.edit-input:disabled,
.edit-textarea:disabled {
  opacity: 0.6;
}
</style>
