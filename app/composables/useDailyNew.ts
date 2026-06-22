import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { DailyNew } from '#shared/types/domain'

export const useDailyNew = () => {
  const client = useSupabase()
  const items = ref<DailyNew[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const { data, error: dbError } = await client
        .from('daily_new')
        .select('*')
        .order('created_at', { ascending: false })
      if (dbError) {
        error.value = dbError.message
      } else {
        items.value = data as unknown as DailyNew[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { title: string; content: string; date?: string }) {
    loading.value = true
    error.value = null
    try {
      const { error: dbError } = await client.from('daily_new').insert({
        title: payload.title,
        content: payload.content,
        ...(payload.date !== undefined ? { created_at: payload.date } : {}),
      })
      if (dbError) {
        error.value = dbError.message
      } else {
        await fetchList()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchList, create }
}
