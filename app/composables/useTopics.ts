import { ref } from 'vue'
import type { Topic } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'
import { useSupabase } from '~/composables/useSupabase'

const items = ref<Topic[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useTopics = () => {
  async function fetchList() {
    if (items.value.length === 0) loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useSupabase().from('topics').select('*')
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      items.value = sortByDate(data ?? [], sortOrder.value)
    } finally {
      loading.value = false
    }
  }

  async function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    await fetchList()
  }

  async function create(payload: { content: string; date?: string }) {
    await withLoading(loading, error, async () => {
      const { error: insertError } = await useSupabase()
        .from('topics')
        .insert({
          content: payload.content,
          ...(payload.date ? { created_at: payload.date } : {}),
        })
      if (insertError) {
        error.value = insertError.message
        return
      }
      await fetchList()
    })
  }

  async function update(id: string, payload: { content: string }) {
    await withLoading(loading, error, async () => {
      const { error: updateError } = await useSupabase().from('topics').update(payload).eq('id', id)
      if (updateError) {
        error.value = updateError.message
        return
      }
      await fetchList()
    })
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create, update }
}
