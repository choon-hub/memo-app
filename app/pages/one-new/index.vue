<script setup lang="ts">
import { useAsyncData } from '#app'
import { useDailyNew } from '~/composables/useDailyNew'
import DailyNewForm from '~/components/DailyNewForm.vue'
import DailyNewList from '~/components/DailyNewList.vue'

const { items, loading, error, sortOrder, fetchList, create, update, remove, toggleSortOrder } =
  useDailyNew()

await useAsyncData('daily-new', fetchList)

async function handleSubmit(payload: { title: string; content: string; date: string }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}

async function handleUpdate(id: string, title: string, content: string) {
  await update(id, { title, content })
}

async function handleRemove(id: string) {
  await remove(id)
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">1日1新</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <DailyNewForm :loading="loading" @submit="handleSubmit" />
    <DailyNewList
      :items="items"
      :sort-order="sortOrder"
      :loading="loading"
      @toggle-sort="toggleSortOrder"
      @update="handleUpdate"
      @remove="handleRemove"
    />
  </div>
</template>

<style scoped>
.page {
  padding: 14px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.error {
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}
</style>
