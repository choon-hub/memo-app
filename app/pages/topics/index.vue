<script setup lang="ts">
import { onMounted } from 'vue'
import { useTopics } from '~/composables/useTopics'
import TopicForm from '~/components/TopicForm.vue'
import TopicList from '~/components/TopicList.vue'

const { items, loading, error, fetchList, create } = useTopics()

onMounted(fetchList)

async function handleSubmit(payload: { content: string; date: string }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">日々のトピック</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <TopicForm :loading="loading" @submit="handleSubmit" />
    <TopicList :items="items" />
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
