import { ref, computed, type Ref } from 'vue'
import type { WorkoutRecord, WorkoutCategory } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'
import { useSupabase } from '~/composables/useSupabase'

const items = ref<WorkoutRecord[]>([])
// メニュー候補はカテゴリ絞り込み中でも全カテゴリのメニューを対象とするため、
// 候補算出に必要な列だけを items とは別に保持する（取得は初回と create 成功時のみ）
const menuRecords = ref<Pick<WorkoutRecord, 'menu' | 'category'>[]>([])
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
      let query = useSupabase().from('workout_records').select('*')
      if (category) query = query.eq('category', category)
      const { data, error: fetchError } = await query
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      items.value = sortByDate(data ?? [], sortOrder.value)
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuRecords() {
    const { data, error: fetchError } = await useSupabase()
      .from('workout_records')
      .select('menu, category')
    if (fetchError) {
      error.value = fetchError.message
      return
    }
    menuRecords.value = data ?? []
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
      await fetchMenuRecords()
    })
  }

  const menuSuggestions = computed(() =>
    [...new Set(menuRecords.value.map((r) => r.menu))].sort((a, b) => a.localeCompare(b)),
  )

  function getMenuCandidates(category: Ref<WorkoutCategory>) {
    return computed(() =>
      [
        ...new Set(
          menuRecords.value.filter((r) => r.category === category.value).map((r) => r.menu),
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
    fetchMenuRecords,
    toggleSortOrder,
    create,
  }
}
