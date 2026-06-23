<script setup lang="ts">
import type { WorkoutCategory, WorkoutRecord } from '#shared/types/domain'

defineProps<{
  items: WorkoutRecord[]
}>()

const categoryLabels: Record<WorkoutCategory, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
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
        <span class="card-date">{{ formatDate(item.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  gap: 12px;
}

.empty-icon-wrapper {
  width: 84px;
  height: 84px;
  background: rgba(174, 148, 251, 0.14);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 800;
  color: #29303e;
  margin: 0;
}

.empty-sub {
  font-size: 13px;
  color: #7c85a2;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-menu {
  font-size: 15px;
  font-weight: 700;
  color: #29303e;
}

.card-badge {
  font-size: 11px;
  font-weight: 700;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.1);
  border-radius: 4px;
  padding: 2px 8px;
}

.card-stats {
  font-size: 14px;
  font-weight: 600;
  color: #4754f0;
}

.card-date {
  font-size: 12px;
  color: #bab9d0;
}
</style>
