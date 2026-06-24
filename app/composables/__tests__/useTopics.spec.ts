import { beforeEach, describe, expect, it } from 'vitest'
import { useTopics, _topicsStore } from '../useTopics'

describe('useTopics', () => {
  beforeEach(() => {
    _topicsStore.length = 0
  })

  describe('fetchList()', () => {
    it('returns items sorted by created_at descending', async () => {
      _topicsStore.push(
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when store is empty', async () => {
      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useTopics()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
      _topicsStore.push(
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, sortOrder, fetchList, toggleSortOrder } = useTopics()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('toggles back to desc', async () => {
      _topicsStore.push(
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, sortOrder, fetchList, toggleSortOrder } = useTopics()
      await fetchList()
      await toggleSortOrder()
      await toggleSortOrder()
      expect(sortOrder.value).toBe('desc')
      expect(items.value[0].id).toBe('2')
    })
  })

  describe('create()', () => {
    it('adds a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useTopics()
      await create({ content: 'New topic' })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({ content: 'New topic' })
    })

    it('uses provided date as created_at', async () => {
      const { items, create } = useTopics()
      await create({ content: 'Topic with date', date: '2024-01-15T00:00:00Z' })

      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })

    it('new item appears first when it has the latest created_at', async () => {
      _topicsStore.push({ id: 'old', content: 'Old topic', created_at: '2024-01-01T00:00:00Z' })

      const { items, create } = useTopics()
      await create({ content: 'New topic', date: '2024-01-02T00:00:00Z' })

      expect(items.value[0].content).toBe('New topic')
      expect(items.value[1].id).toBe('old')
    })
  })
})
