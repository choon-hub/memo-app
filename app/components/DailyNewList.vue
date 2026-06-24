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

.card-date {
  font-size: 11px;
  color: #bab9d0;
}
</style>
