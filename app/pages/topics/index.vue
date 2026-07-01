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
