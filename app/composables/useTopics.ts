import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { Topic } from '#shared/types/domain'

export const useTopics = () => {
  const client = useSupabase()
  const items = ref<Topic[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const { data, error: dbError } = await client
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })
      if (dbError) {
        error.value = dbError.message
      } else {
        items.value = data as unknown as Topic[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { content: string; date?: string }) {
    loading.value = true
    error.value = null
    try {
      const { error: dbError } = await client.from('topics').insert({
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
