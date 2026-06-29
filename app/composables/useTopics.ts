import { ref } from 'vue'
import type { Topic } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'

export const _topicsStore: Topic[] = [
  {
    id: 'seed-1',
    content: '今日は天気が良かった',
    created_at: '2026-06-24T09:00:00Z',
  },
]

const items = ref<Topic[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useTopics = () => {
  async function fetchList() {
    if (items.value.length === 0) loading.value = true
    error.value = null
    try {
      items.value = sortByDate([..._topicsStore], sortOrder.value)
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
      const newItem: Topic = {
        id: crypto.randomUUID(),
        content: payload.content,
        created_at: payload.date ?? new Date().toISOString(),
      }
      _topicsStore.push(newItem)
      items.value = sortByDate([...items.value, newItem], sortOrder.value)
    })
  }

  async function update(id: string, payload: { content: string }) {
    await withLoading(loading, error, async () => {
      const idx = _topicsStore.findIndex((t) => t.id === id)
      if (idx !== -1) {
        _topicsStore[idx] = { ..._topicsStore[idx], content: payload.content }
      }
      items.value = sortByDate([..._topicsStore], sortOrder.value)
    })
  }

  return { items, loading, error, sortOrder, fetchList, toggleSortOrder, create, update }
}
