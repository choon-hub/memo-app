<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkout } from '~/composables/useWorkout'
import WorkoutCategoryTabs from '~/components/WorkoutCategoryTabs.vue'
import WorkoutForm from '~/components/WorkoutForm.vue'
import WorkoutList from '~/components/WorkoutList.vue'
import type { WorkoutCategory } from '#shared/types/domain'

const { items, loading, error, fetchList, create } = useWorkout()
const selectedCategory = ref<WorkoutCategory>('chest')
const initialized = ref(false)

onMounted(async () => {
  await fetchList(selectedCategory.value)
  initialized.value = true
})

async function handleCategoryChange(category: WorkoutCategory) {
  selectedCategory.value = category
  await fetchList(category)
  if (selectedCategory.value !== category) {
    await fetchList(selectedCategory.value)
  }
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
</script>

<template>
  <div class="page">
    <h1 class="page-title">筋トレ</h1>
    <WorkoutCategoryTabs
      :model-value="selectedCategory"
      @update:model-value="handleCategoryChange"
    />
    <div v-if="error" class="error">{{ error }}</div>
    <template v-if="!initialized">
      <div class="skeleton skeleton-form" />
      <div class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton skeleton-card" />
      </div>
    </template>
    <template v-else>
      <WorkoutForm :loading="loading" @submit="handleSubmit" />
      <WorkoutList :items="items" />
    </template>
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

@keyframes skPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.skeleton {
  background: #f1f3f7;
  animation: skPulse 1.6s ease-in-out infinite;
}

.skeleton-form {
  height: 220px;
  border-radius: 16px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  height: 90px;
  border-radius: 16px;
}
</style>
