import { ref } from 'vue'
import type { DailyNew } from '#shared/types/domain'

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
      items.value = [..._dailyNewStore].sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return sortOrder.value === 'desc' ? -diff : diff
      })
    } finally {
      loading.value = false
    }
  }

  async function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    await fetchList()
  }

  async function create(payload: { title: string; content: string; date?: string }) {
    loading.value = true
    error.value = null
    try {
      const newItem: DailyNew = {
        id: crypto.randomUUID(),
        title: payload.title,
        content: payload.content,
        created_at: payload.date ?? new Date().toISOString(),
      }
      _dailyNewStore.push(newItem)
      items.value = [...items.value, newItem].sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return sortOrder.value === 'desc' ? -diff : diff
      })
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create }
}
