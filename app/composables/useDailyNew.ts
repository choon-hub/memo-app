import { ref } from 'vue'
import type { DailyNew } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'
import { useSupabase } from '~/composables/useSupabase'

const items = ref<DailyNew[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useDailyNew = () => {
  async function fetchList() {
    if (items.value.length === 0) loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useSupabase().from('daily_new').select('*')
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

  async function create(payload: { title: string; content: string; date?: string }) {
    await withLoading(loading, error, async () => {
      const { data, error: insertError } = await useSupabase()
        .from('daily_new')
        .insert({
          title: payload.title,
          content: payload.content,
          ...(payload.date ? { created_at: payload.date } : {}),
        })
        .select()
      if (insertError) {
        error.value = insertError.message
        return
      }
      if (!data || data.length === 0) {
        // 挿入は成功したが行を取得できずローカル状態と DB がずれた可能性があるため再フェッチ
        await fetchList()
        return
      }
      items.value = sortByDate([...items.value, ...data], sortOrder.value)
    })
  }

  async function update(id: string, payload: { title: string; content: string }) {
    await withLoading(loading, error, async () => {
      const { data, error: updateError } = await useSupabase()
        .from('daily_new')
        .update(payload)
        .eq('id', id)
        .select()
      if (updateError) {
        error.value = updateError.message
        return
      }
      const updated = data?.[0]
      if (!updated) {
        // 更新は成功したが行を取得できずローカル状態と DB がずれた可能性があるため再フェッチ
        await fetchList()
        return
      }
      items.value = sortByDate(
        items.value.map((item) => (item.id === id ? updated : item)),
        sortOrder.value,
      )
    })
  }

  async function remove(id: string) {
    await withLoading(loading, error, async () => {
      const { error: deleteError } = await useSupabase().from('daily_new').delete().eq('id', id)
      if (deleteError) {
        error.value = deleteError.message
        return
      }
      items.value = items.value.filter((item) => item.id !== id)
    })
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create, update, remove }
}
