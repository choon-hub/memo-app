import { ref, computed, type Ref } from 'vue'
import type { WorkoutRecord, WorkoutCategory } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'
import { useSupabase } from '~/composables/useSupabase'

const items = ref<WorkoutRecord[]>([])
// メニュー候補はカテゴリ絞り込み中でも全カテゴリのメニューを対象とするため、
// 絞り込み前の全件を items とは別に保持する
const allRecords = ref<WorkoutRecord[]>([])
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
      const { data, error: fetchError } = await useSupabase().from('workout_records').select('*')
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      allRecords.value = data ?? []
      const filtered = category
        ? allRecords.value.filter((r) => r.category === category)
        : allRecords.value
      items.value = sortByDate(filtered, sortOrder.value)
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
    await withLoading(loading, error, async () => {
      const { error: insertError } = await useSupabase()
        .from('workout_records')
        .insert({
          category: payload.category,
          menu: payload.menu,
          intensity: payload.intensity,
          reps: payload.reps,
          ...(payload.date ? { created_at: payload.date } : {}),
        })
      if (insertError) {
        error.value = insertError.message
        return
      }
      await fetchList(lastCategory.value)
    })
  }

  const menuSuggestions = computed(() =>
    [...new Set(allRecords.value.map((r) => r.menu))].sort((a, b) => a.localeCompare(b)),
  )

  function getMenuCandidates(category: Ref<WorkoutCategory>) {
    return computed(() =>
      [
        ...new Set(
          allRecords.value.filter((r) => r.category === category.value).map((r) => r.menu),
        ),
      ].slice(0, 5),
    )
  }

  return {
    items,
    loading,
    error,
    sortOrder,
    lastCategory,
    menuSuggestions,
    getMenuCandidates,
    fetchList,
    toggleSortOrder,
    create,
  }
}
