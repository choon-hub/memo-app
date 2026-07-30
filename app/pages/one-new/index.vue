<script setup lang="ts">
import { useAsyncData } from '#app'
import { useDailyNew } from '~/composables/useDailyNew'
import { importDailyNewRows, type DailyNewCsvPayload } from '~/utils/csvImport'
import AppErrorAlert from '~/components/AppErrorAlert.vue'
import CsvImportSection from '~/components/CsvImportSection.vue'
import DailyNewForm from '~/components/DailyNewForm.vue'
import DailyNewList from '~/components/DailyNewList.vue'
import SkeletonList from '~/components/SkeletonList.vue'

const {
  items,
  loading,
  error,
  sortOrder,
  fetchList,
  create,
  createMany,
  update,
  remove,
  toggleSortOrder,
} = useDailyNew()

const csvColumns = [
  { key: 'title', label: 'タイトル' },
  { key: 'content', label: '内容' },
  { key: 'date', label: '日付' },
]

const { data } = await useAsyncData('daily-new', fetchList)
if (data.value) {
  items.value = data.value
}

async function handleSubmit(payload: { title: string; content: string; date: string }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}

async function handleCsvImport(payloads: DailyNewCsvPayload[]) {
  await createMany(
    payloads.map((payload) => ({
      title: payload.title,
      content: payload.content,
      date: payload.created_at ?? undefined,
    })),
  )
}

async function handleUpdate(id: string, title: string, content: string, date: string) {
  await update(id, { title, content, created_at: `${date}T00:00:00.000Z` })
}

async function handleRemove(id: string) {
  await remove(id)
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">1日1新</h1>
    <AppErrorAlert v-if="error" :message="error" @retry="fetchList()" />
    <DailyNewForm :loading="loading" @submit="handleSubmit" />
    <CsvImportSection
      :columns="csvColumns"
      :validate="importDailyNewRows"
      :loading="loading"
      @import="handleCsvImport"
    />
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
