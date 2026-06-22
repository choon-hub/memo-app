<script setup lang="ts">
import type { DailyNew } from '#shared/types/domain'

defineProps<{
  items: DailyNew[]
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
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="#AE94FB"
          stroke="none"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
      </div>
      <p class="empty-title">まだ記録がありません</p>
      <p class="empty-sub">今日の新しい発見を<br />上のフォームに記録しましょう</p>
    </div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="card">
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-content">{{ item.content }}</p>
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

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #29303e;
  margin: 0;
}

.card-content {
  font-size: 13px;
  color: #7c85a2;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-date {
  font-size: 12px;
  color: #bab9d0;
}
</style>
