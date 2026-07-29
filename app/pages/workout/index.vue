<script setup lang="ts">
import { useAsyncData } from '#app'
import { ref } from 'vue'
import { useWorkout } from '~/composables/useWorkout'
import AppErrorAlert from '~/components/AppErrorAlert.vue'
import WorkoutCategoryTabs from '~/components/WorkoutCategoryTabs.vue'
import WorkoutForm from '~/components/WorkoutForm.vue'
import WorkoutList from '~/components/WorkoutList.vue'
import SkeletonList from '~/components/SkeletonList.vue'
import type { WorkoutCategory, WorkoutRecord } from '#shared/types/domain'

const {
  items,
  loading,
  error,
  sortOrder,
  menuSuggestions,
  getMenuCandidates,
  fetchList,
  fetchMenuRecords,
  create,
  update,
  remove,
  toggleSortOrder,
} = useWorkout()
const selectedCategory = ref<WorkoutCategory>('chest')
const menuCandidates = getMenuCandidates(selectedCategory)
const prefill = ref<WorkoutRecord | undefined>(undefined)

await useAsyncData(
  () => `workout-${selectedCategory.value}`,
  () => fetchList(selectedCategory.value),
)
// メニュー候補は全カテゴリ横断のため、カテゴリ別キャッシュとは別に一度だけ取得する
await useAsyncData('workout-menus', () => fetchMenuRecords())

function handleCategoryChange(category: WorkoutCategory) {
  selectedCategory.value = category
}

async function handleSubmit(payload: {
  menu: string
  intensity: number
  reps: number
  date: string
}) {
  await create({
    category: selectedCategory.value,
    menu: payload.menu,
    intensity: payload.intensity,
    reps: payload.reps,
    date: `${payload.date}T00:00:00.000Z`,
  })
}

async function handleUpdate(
  id: string,
  payload: { menu: string; intensity: number; reps: number; date: string },
) {
  await update(id, { ...payload, date: `${payload.date}T00:00:00.000Z` })
}

function handleCopy(record: WorkoutRecord) {
  selectedCategory.value = record.category
  prefill.value = { ...record }
}

async function handleRemove(id: string) {
  await remove(id)
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">筋トレ</h1>
    <WorkoutCategoryTabs
      :model-value="selectedCategory"
      @update:model-value="handleCategoryChange"
    />
    <AppErrorAlert v-if="error" :message="error" @retry="fetchList(selectedCategory)" />
    <WorkoutForm
      :loading="loading"
      :prefill="prefill"
      :menu-suggestions="menuSuggestions"
      :menu-candidates="menuCandidates"
      @submit="handleSubmit"
    />
    <SkeletonList v-if="loading && items.length === 0" />
    <WorkoutList
      v-else
      :items="items"
      :sort-order="sortOrder"
      :loading="loading"
      @toggle-sort="toggleSortOrder"
      @copy="handleCopy"
      @update="handleUpdate"
      @remove="handleRemove"
    />
  </div>
</template>
