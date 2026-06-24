import { ref } from 'vue'
import type { WorkoutRecord, WorkoutCategory } from '#shared/types/domain'

export const _workoutStore: WorkoutRecord[] = [
  {
    id: 'seed-1',
    category: 'chest',
    menu: 'ベンチプレス',
    intensity: 60,
    reps: 10,
    created_at: '2026-06-24T09:00:00Z',
  },
  {
    id: 'seed-2',
    category: 'back',
    menu: 'ラットプルダウン',
    intensity: 50,
    reps: 12,
    created_at: '2026-06-23T09:00:00Z',
  },
]

export const useWorkout = () => {
  const items = ref<WorkoutRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastCategory = ref<WorkoutCategory | undefined>(undefined)

  async function fetchList(category?: WorkoutCategory) {
    lastCategory.value = category
    loading.value = true
    error.value = null
    try {
      const filtered = category
        ? _workoutStore.filter((r) => r.category === category)
        : [..._workoutStore]
      items.value = filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    } finally {
      loading.value = false
    }
  }

  async function create(payload: {
    category: WorkoutCategory
    menu: string
    intensity: number
    reps: number
    date?: string
  }) {
    loading.value = true
    error.value = null
    try {
      _workoutStore.push({
        id: crypto.randomUUID(),
        category: payload.category,
        menu: payload.menu,
        intensity: payload.intensity,
        reps: payload.reps,
        created_at: payload.date ?? new Date().toISOString(),
      })
      await fetchList(lastCategory.value)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchList, create }
}
