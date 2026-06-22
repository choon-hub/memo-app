<script setup lang="ts">
import { onMounted } from 'vue'
import { useDailyNew } from '~/composables/useDailyNew'
import DailyNewForm from '~/components/DailyNewForm.vue'
import DailyNewList from '~/components/DailyNewList.vue'

const { items, loading, error, fetchList, create } = useDailyNew()

onMounted(fetchList)

async function handleSubmit(payload: { title: string; content: string; date: string }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">1日1新</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <DailyNewForm :loading="loading" @submit="handleSubmit" />
    <DailyNewList :items="items" />
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
