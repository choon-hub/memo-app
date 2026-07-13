<script setup lang="ts">
import { useAsyncData } from '#app'
import { ref } from 'vue'
import { useWorkout } from '~/composables/useWorkout'
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
  create,
  toggleSortOrder,
} = useWorkout()
const selectedCategory = ref<WorkoutCategory>('chest')
const menuCandidates = getMenuCandidates(selectedCategory)
const prefill = ref<WorkoutRecord | undefined>(undefined)

await useAsyncData(
  () => `workout-${selectedCategory.value}`,
  () => fetchList(selectedCategory.value),
)

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

function handleCopy(record: WorkoutRecord) {
  selectedCategory.value = record.category
  prefill.value = { ...record }
}
</script>

<template>
  <div class="page">
    <h1 class="sr-only">筋トレ</h1>
    <WorkoutCategoryTabs
      :model-value="selectedCategory"
      @update:model-value="handleCategoryChange"
    />
    <div v-if="error" class="error">{{ error }}</div>
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
      @toggle-sort="toggleSortOrder"
      @copy="handleCopy"
    />
  </div>
</template>
