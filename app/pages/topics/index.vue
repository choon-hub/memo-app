<script setup lang="ts">
import { useAsyncData } from '#app'
import { useTopics } from '~/composables/useTopics'
import TopicForm from '~/components/TopicForm.vue'
import TopicList from '~/components/TopicList.vue'

const { items, loading, error, sortOrder, fetchList, create, update, toggleSortOrder } = useTopics()

await useAsyncData('topics', fetchList)

async function handleSubmit(payload: { content: string; date: string }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}

async function handleUpdate(id: string, content: string) {
  await update(id, { content })
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">日々のトピック</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <TopicForm :loading="loading" @submit="handleSubmit" />
    <TopicList
      :items="items"
      :sort-order="sortOrder"
      :loading="loading"
      @toggle-sort="toggleSortOrder"
      @update="handleUpdate"
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
