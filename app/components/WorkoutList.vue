<script setup lang="ts">
import type { WorkoutCategory, WorkoutRecord } from '#shared/types/domain'
import { formatDate } from '~/utils/date'

defineProps<{
  items: WorkoutRecord[]
  sortOrder: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  toggleSort: []
  copy: [item: WorkoutRecord]
}>()

const categoryLabels: Record<WorkoutCategory, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
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
        <div class="card-header">
          <span class="card-menu">{{ item.menu }}</span>
          <span class="card-badge">{{ categoryLabels[item.category] }}</span>
        </div>
        <span class="card-stats">{{ item.intensity }}kg × {{ item.reps }}回</span>
        <div class="card-footer">
          <span class="card-date">{{ formatDate(item.created_at) }}</span>
          <button type="button" class="copy-btn" @click="emit('copy', item)">コピー</button>
        </div>
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

.copy-btn:hover {
  opacity: 1;
}
</style>
