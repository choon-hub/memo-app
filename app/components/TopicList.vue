<script setup lang="ts">
import type { Topic } from '#shared/types/domain'

defineProps<{
  items: Topic[]
  sortOrder: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  toggleSort: []
}>()

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
        <p class="card-content">{{ item.content }}</p>
        <span class="card-date">{{ formatDate(item.created_at) }}</span>
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
}

.card-date {
  font-size: 11px;
  color: #bab9d0;
}
</style>
