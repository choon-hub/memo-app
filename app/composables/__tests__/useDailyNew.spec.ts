import { beforeEach, describe, expect, it } from 'vitest'
import { useDailyNew, _dailyNewStore } from '../useDailyNew'

describe('useDailyNew', () => {
  beforeEach(() => {
    _dailyNewStore.length = 0
    const { items, loading, error, sortOrder } = useDailyNew()
    items.value = []
    loading.value = false
    error.value = null
    sortOrder.value = 'desc'
  })

  describe('fetchList()', () => {
    it('returns items sorted by created_at descending', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when store is empty', async () => {
      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useDailyNew()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, sortOrder, fetchList, toggleSortOrder } = useDailyNew()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('toggles back to desc', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, sortOrder, fetchList, toggleSortOrder } = useDailyNew()
      await fetchList()
      await toggleSortOrder()
      await toggleSortOrder()
      expect(sortOrder.value).toBe('desc')
      expect(items.value[0].id).toBe('2')
    })
  })

  describe('update()', () => {
    it('updates the title and content of an existing item', async () => {
      _dailyNewStore.push({
        id: '1',
        title: 'Original title',
        content: 'Original content',
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, loading, error, fetchList, update } = useDailyNew()
      await fetchList()
      await update('1', { title: 'Updated title', content: 'Updated content' })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value[0].title).toBe('Updated title')
      expect(items.value[0].content).toBe('Updated content')
    })

    it('preserves sort order (desc) after update', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, fetchList, update } = useDailyNew()
      await fetchList()
      await update('2', { title: 'Newer updated', content: 'C2 updated' })

      expect(items.value[0].id).toBe('2')
      expect(items.value[0].title).toBe('Newer updated')
    })

    it('does nothing when id is not found', async () => {
      _dailyNewStore.push({
        id: '1',
        title: 'Original title',
        content: 'Original content',
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, fetchList, update } = useDailyNew()
      await fetchList()
      await update('nonexistent', { title: 'Updated', content: 'Updated' })

      expect(items.value[0].title).toBe('Original title')
    })
  })

  describe('remove()', () => {
    it('removes the item from the list', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'To remove', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Keep', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      )

      const { items, loading, error, fetchList, remove } = useDailyNew()
      await fetchList()
      await remove('1')

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0].id).toBe('2')
    })

    it('preserves sort order (desc) after remove', async () => {
      _dailyNewStore.push(
        { id: '1', title: 'Oldest', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Middle', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
        { id: '3', title: 'Newest', content: 'C3', created_at: '2024-01-03T00:00:00Z' },
      )

      const { items, fetchList, remove } = useDailyNew()
      await fetchList()
      await remove('2')

      expect(items.value[0].id).toBe('3')
      expect(items.value[1].id).toBe('1')
    })

    it('does nothing when id is not found', async () => {
      _dailyNewStore.push({
        id: '1',
        title: 'Keep',
        content: 'C1',
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, fetchList, remove } = useDailyNew()
      await fetchList()
      await remove('nonexistent')

      expect(items.value).toHaveLength(1)
    })
  })

  describe('create()', () => {
    it('adds a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useDailyNew()
      await create({ title: 'New title', content: 'New content' })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({ title: 'New title', content: 'New content' })
    })

    it('uses provided date as created_at', async () => {
      const { items, create } = useDailyNew()
      await create({ title: 'Title', content: 'Content', date: '2024-01-15T00:00:00Z' })

      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })

    it('new item appears first when it has the latest created_at', async () => {
      _dailyNewStore.push({
        id: 'old',
        title: 'Old',
        content: 'Old',
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, fetchList, create } = useDailyNew()
      await fetchList()
      await create({ title: 'New', content: 'New', date: '2024-01-02T00:00:00Z' })

      expect(items.value[0].title).toBe('New')
      expect(items.value[1].id).toBe('old')
    })
  })
})
