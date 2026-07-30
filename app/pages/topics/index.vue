<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData } from '#app'
import { useTopics } from '~/composables/useTopics'
import { importTopicRows, type TopicCsvPayload } from '~/utils/csvImport'
import AppErrorAlert from '~/components/AppErrorAlert.vue'
import CsvImportSection from '~/components/CsvImportSection.vue'
import TopicForm from '~/components/TopicForm.vue'
import TopicList from '~/components/TopicList.vue'
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
} = useTopics()

const csvColumns = [
  { key: 'content', label: '内容' },
  { key: 'date', label: '日付' },
]

const { data } = await useAsyncData('topics', fetchList)
if (data.value) {
  items.value = data.value
}

const selectedPerson = ref<string | null>(null)

const filteredItems = computed(() => {
  const person = selectedPerson.value
  return person ? items.value.filter((item) => item.persons.includes(person)) : items.value
})

function handleFilterPerson(person: string) {
  selectedPerson.value = selectedPerson.value === person ? null : person
}

function clearFilter() {
  selectedPerson.value = null
}

async function handleSubmit(payload: { content: string; date: string; persons: string[] }) {
  await create({ ...payload, date: `${payload.date}T00:00:00.000Z` })
}

async function handleUpdate(id: string, content: string, persons: string[], createdAt: string) {
  await update(id, { content, persons, created_at: createdAt })
}

async function handleRemove(id: string) {
  await remove(id)
}

async function handleCsvImport(payloads: TopicCsvPayload[]) {
  await createMany(
    payloads.map((payload) => ({
      content: payload.content,
      date: payload.created_at ?? undefined,
    })),
  )
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">日々のトピック</h1>
    <AppErrorAlert v-if="error" :message="error" @retry="fetchList()" />
    <TopicForm :loading="loading" @submit="handleSubmit" />
    <CsvImportSection
      :columns="csvColumns"
      :validate="importTopicRows"
      :loading="loading"
      @import="handleCsvImport"
    />
    <div v-if="selectedPerson" class="filter-indicator">
      <span class="filter-text">{{ selectedPerson }}で絞り込み中</span>
      <button type="button" class="filter-clear-btn" aria-label="絞り込み解除" @click="clearFilter">
        ×
      </button>
    </div>
    <SkeletonList v-if="loading && items.length === 0" />
    <TopicList
      v-else
      :items="filteredItems"
      :sort-order="sortOrder"
      :loading="loading"
      :active-person="selectedPerson"
      @toggle-sort="toggleSortOrder"
      @update="handleUpdate"
      @remove="handleRemove"
      @filter-person="handleFilterPerson"
    />
  </div>
</template>

<style scoped>
.filter-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 9px;
  background: rgba(71, 84, 240, 0.08);
  border-radius: 8px;
  color: #4754f0;
  font-size: 12px;
  font-weight: 600;
}

.filter-clear-btn {
  border: none;
  background: transparent;
  color: #4754f0;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
}
</style>
