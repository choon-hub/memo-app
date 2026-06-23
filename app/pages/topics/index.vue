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
    <h1 class="page-title">日々のトピック</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <TopicForm :loading="loading" @submit="handleSubmit" />
    <TopicList :items="items" />
  </div>
</template>

<style scoped>
.page {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  color: #29303e;
  margin: 0;
}

.error {
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}
</style>
