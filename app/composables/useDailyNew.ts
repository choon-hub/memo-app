import { ref } from 'vue'
import type { DailyNew } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'

export const _dailyNewStore: DailyNew[] = [
  {
    id: 'seed-1',
    title: '初めての発見',
    content: '今日は新しいことを学んだ',
    created_at: '2026-06-24T09:00:00Z',
  },
]

const items = ref<DailyNew[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useDailyNew = () => {
  async function fetchList() {
    if (items.value.length === 0) loading.value = true
    error.value = null
    try {
      items.value = sortByDate([..._dailyNewStore], sortOrder.value)
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
      const newItem: DailyNew = {
        id: crypto.randomUUID(),
        title: payload.title,
        content: payload.content,
        created_at: payload.date ?? new Date().toISOString(),
      }
      _dailyNewStore.push(newItem)
      items.value = sortByDate([...items.value, newItem], sortOrder.value)
    })
  }

  async function update(id: string, payload: { title: string; content: string }) {
    await withLoading(loading, error, async () => {
      const idx = _dailyNewStore.findIndex((d) => d.id === id)
      if (idx !== -1) {
        _dailyNewStore[idx] = { ..._dailyNewStore[idx], ...payload }
      }
      items.value = sortByDate([..._dailyNewStore], sortOrder.value)
    })
  }

  async function remove(id: string) {
    await withLoading(loading, error, async () => {
      const idx = _dailyNewStore.findIndex((d) => d.id === id)
      if (idx !== -1) {
        _dailyNewStore.splice(idx, 1)
      }
      items.value = sortByDate([..._dailyNewStore], sortOrder.value)
    })
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create, update, remove }
}
