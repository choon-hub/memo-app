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

export const useDailyNew = () => {
  const items = ref<DailyNew[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      items.value = [..._dailyNewStore].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { title: string; content: string; date?: string }) {
    loading.value = true
    error.value = null
    try {
      _dailyNewStore.push({
        id: crypto.randomUUID(),
        title: payload.title,
        content: payload.content,
        created_at: payload.date ?? new Date().toISOString(),
      })
      await fetchList()
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchList, create }
}
