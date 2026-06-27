import { ref, computed } from 'vue'
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

const items = ref<WorkoutRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastCategory = ref<WorkoutCategory | undefined>(undefined)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useWorkout = () => {
  async function fetchList(category?: WorkoutCategory) {
    lastCategory.value = category
    if (items.value.length === 0) loading.value = true
    error.value = null
    try {
      const filtered = category
        ? _workoutStore.filter((r) => r.category === category)
        : [..._workoutStore]
      items.value = filtered.sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return sortOrder.value === 'desc' ? -diff : diff
      })
    } finally {
      loading.value = false
    }
  }

  async function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    await fetchList(lastCategory.value)
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
      const newItem: WorkoutRecord = {
        id: crypto.randomUUID(),
        category: payload.category,
        menu: payload.menu,
        intensity: payload.intensity,
        reps: payload.reps,
        created_at: payload.date ?? new Date().toISOString(),
      }
      _workoutStore.push(newItem)
      if (!lastCategory.value || newItem.category === lastCategory.value) {
        items.value = [...items.value, newItem].sort((a, b) => {
          const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          return sortOrder.value === 'desc' ? -diff : diff
        })
      }
    } finally {
      loading.value = false
    }
  }

  const menuSuggestions = computed(() =>
    [...new Set([...items.value, ..._workoutStore].map((r) => r.menu))].sort((a, b) =>
      a.localeCompare(b),
    ),
  )

  return {
    items,
    loading,
    error,
    sortOrder,
    lastCategory,
    menuSuggestions,
    fetchList,
    toggleSortOrder,
    create,
  }
}
