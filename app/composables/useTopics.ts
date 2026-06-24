import { ref } from 'vue'
import type { Topic } from '#shared/types/domain'

export const _topicsStore: Topic[] = [
  {
    id: 'seed-1',
    content: '今日は天気が良かった',
    created_at: '2026-06-24T09:00:00Z',
  },
]

export const useTopics = () => {
  const items = ref<Topic[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('desc')

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      items.value = [..._topicsStore].sort((a, b) => {
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

  async function create(payload: { content: string; date?: string }) {
    loading.value = true
    error.value = null
    try {
      _topicsStore.push({
        id: crypto.randomUUID(),
        content: payload.content,
        created_at: payload.date ?? new Date().toISOString(),
      })
      await fetchList()
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create }
}
