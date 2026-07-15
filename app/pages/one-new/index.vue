<script setup lang="ts">
import { useAsyncData } from '#app'
import { useDailyNew } from '~/composables/useDailyNew'
import DailyNewForm from '~/components/DailyNewForm.vue'
import DailyNewList from '~/components/DailyNewList.vue'
import SkeletonList from '~/components/SkeletonList.vue'

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
    <SkeletonList v-if="loading && items.length === 0" />
    <DailyNewList
      v-else
      :items="items"
      :sort-order="sortOrder"
      :loading="loading"
      @toggle-sort="toggleSortOrder"
      @update="handleUpdate"
      @remove="handleRemove"
    />
  </div>
</template>
