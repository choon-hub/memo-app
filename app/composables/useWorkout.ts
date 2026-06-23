import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { WorkoutRecord, WorkoutCategory } from '#shared/types/domain'

export const useWorkout = () => {
  const client = useSupabase()
  const items = ref<WorkoutRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastCategory = ref<WorkoutCategory | undefined>(undefined)

  async function fetchList(category?: WorkoutCategory) {
    lastCategory.value = category
    loading.value = true
    error.value = null
    try {
      let query = client.from('workout_records').select('*')
      if (category !== undefined) query = query.eq('category', category)
      const { data, error: dbError } = await query.order('created_at', { ascending: false })
      if (dbError) {
        error.value = dbError.message
      } else {
        items.value = data as unknown as WorkoutRecord[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
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
      const { error: dbError } = await client.from('workout_records').insert({
        category: payload.category,
        menu: payload.menu,
        intensity: payload.intensity,
        reps: payload.reps,
        ...(payload.date !== undefined ? { created_at: payload.date } : {}),
      })
      if (dbError) {
        error.value = dbError.message
      } else {
        await fetchList(lastCategory.value)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchList, create }
}
