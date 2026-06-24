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
    <h1 class="sr-only">筋トレ</h1>
    <WorkoutCategoryTabs
      :model-value="selectedCategory"
      @update:model-value="handleCategoryChange"
    />
    <div v-if="error" class="error">{{ error }}</div>
    <template v-if="!initialized">
      <div class="skeleton-form-card">
        <div class="sk-row">
          <div class="skeleton sk-field-lg" />
          <div class="skeleton sk-field-sm" />
          <div class="skeleton sk-field-sm" />
        </div>
        <div class="skeleton sk-full" />
        <div class="skeleton sk-btn" />
      </div>
      <div class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card-item">
          <div class="sk-card-header">
            <div class="skeleton sk-title" />
            <div class="skeleton sk-badge" />
          </div>
          <div class="skeleton sk-stats" />
          <div class="skeleton sk-date" />
        </div>
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

@keyframes skPulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.75;
  }
}

.skeleton {
  background: #f1f3f7;
  animation: skPulse 1.6s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.sk-row {
  display: flex;
  gap: 8px;
}

.sk-field-lg {
  flex: 2;
  height: 36px;
  animation-delay: 0s;
}

.sk-field-sm {
  flex: 1;
  height: 36px;
}

.sk-field-sm:nth-child(2) {
  animation-delay: 0.15s;
}

.sk-field-sm:nth-child(3) {
  animation-delay: 0.3s;
}

.sk-full {
  height: 36px;
  animation-delay: 0.38s;
}

.sk-btn {
  height: 46px;
  animation-delay: 0.52s;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.skeleton-card-item {
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.sk-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sk-title {
  height: 14px;
  width: 110px;
}

.sk-badge {
  height: 20px;
  width: 34px;
  border-radius: 10px;
}

.sk-stats {
  height: 13px;
  width: 75px;
}

.sk-date {
  height: 10px;
  width: 96px;
}
</style>
