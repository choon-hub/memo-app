import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockQueryChain, mockSupabaseClient, resetMocks } from '../../../test/mocks/supabase'
import { useTopics } from '../useTopics'
import type { Topic } from '#shared/types/domain'

vi.mock('~/composables/useSupabase', () => ({
  useSupabase: () => mockSupabaseClient,
}))

function mockTable(rows: Topic[]) {
  mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolve({ data: rows, error: null })),
  )
}

describe('useTopics', () => {
  beforeEach(() => {
    resetMocks()
    const { items, loading, error, sortOrder } = useTopics()
    items.value = []
    loading.value = false
    error.value = null
    sortOrder.value = 'desc'
  })

  describe('fetchList()', () => {
    it('returns items sorted by created_at descending', async () => {
      mockTable([
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('topics')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when the table is empty', async () => {
      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('sets error when fetch fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'fetch failed' } })),
      )

      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(error.value).toBe('fetch failed')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useTopics()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
      mockTable([
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, sortOrder, fetchList, toggleSortOrder } = useTopics()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('toggles back to desc', async () => {
      mockTable([
        { id: '1', content: 'Topic A', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, sortOrder, fetchList, toggleSortOrder } = useTopics()
      await fetchList()
      await toggleSortOrder()
      await toggleSortOrder()
      expect(sortOrder.value).toBe('desc')
      expect(items.value[0].id).toBe('2')
    })
  })

  describe('update()', () => {
    it('applies the returned row to items without refetching the list', async () => {
      mockTable([{ id: '1', content: 'Original', created_at: '2024-01-01T00:00:00Z' }])

      const { items, loading, error, fetchList, update } = useTopics()
      await fetchList()

      mockQueryChain.select.mockClear()
      vi.mocked(mockSupabaseClient.from).mockClear()

      mockTable([{ id: '1', content: 'Updated', created_at: '2024-01-01T00:00:00Z' }])
      await update('1', { content: 'Updated' })

      expect(mockQueryChain.update).toHaveBeenCalledWith({ content: 'Updated' })
      expect(mockQueryChain.eq).toHaveBeenCalledWith('id', '1')
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1)
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('*')
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toEqual([
        { id: '1', content: 'Updated', created_at: '2024-01-01T00:00:00Z' },
      ])
    })

    it('preserves sort order (desc) after update', async () => {
      mockTable([
        { id: '1', content: 'Older', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Newer', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, fetchList, update } = useTopics()
      await fetchList()

      mockTable([{ id: '2', content: 'Newer updated', created_at: '2024-01-02T00:00:00Z' }])
      await update('2', { content: 'Newer updated' })

      expect(items.value.map((item) => item.id)).toEqual(['2', '1'])
      expect(items.value[0].content).toBe('Newer updated')
      expect(items.value[1].content).toBe('Older')
    })

    it('refetches the list as rollback when no row is returned', async () => {
      mockTable([{ id: '1', content: 'Original', created_at: '2024-01-01T00:00:00Z' }])

      const { fetchList, update } = useTopics()
      await fetchList()

      mockQueryChain.select.mockClear()

      mockTable([])
      await update('1', { content: 'Updated' })

      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
    })

    it('sets error when update fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'update failed' } })),
      )

      const { error, update } = useTopics()
      await update('1', { content: 'Updated' })

      expect(error.value).toBe('update failed')
    })
  })

  describe('remove()', () => {
    it('removes the item locally without refetching the list', async () => {
      mockTable([
        { id: '1', content: 'To remove', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Keep', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, loading, error, fetchList, remove } = useTopics()
      await fetchList()

      await remove('1')

      expect(mockQueryChain.delete).toHaveBeenCalled()
      expect(mockQueryChain.eq).toHaveBeenCalledWith('id', '1')
      // fetchList と delete の 2 回のみ（一覧の再 select なし）
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(mockQueryChain.select).toHaveBeenCalledTimes(1)
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0].id).toBe('2')
    })

    it('preserves sort order (desc) after remove', async () => {
      mockTable([
        { id: '1', content: 'Oldest', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Middle', created_at: '2024-01-02T00:00:00Z' },
        { id: '3', content: 'Newest', created_at: '2024-01-03T00:00:00Z' },
      ])

      const { items, fetchList, remove } = useTopics()
      await fetchList()

      await remove('2')

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('3')
      expect(items.value[1].id).toBe('1')
    })

    it('sets error and keeps items when delete fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'delete failed' } })),
      )

      const { items, error, remove } = useTopics()
      items.value = [{ id: '1', content: 'Keep', created_at: '2024-01-01T00:00:00Z' }]
      await remove('1')

      expect(error.value).toBe('delete failed')
      expect(items.value).toHaveLength(1)
    })
  })

  describe('create()', () => {
    it('inserts the returned row into items without refetching the list', async () => {
      mockTable([{ id: 'new-1', content: 'New topic', created_at: '2024-01-01T00:00:00Z' }])

      const { items, error, loading, create } = useTopics()
      await create({ content: 'New topic' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({ content: 'New topic' })
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1)
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('*')
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toEqual([
        { id: 'new-1', content: 'New topic', created_at: '2024-01-01T00:00:00Z' },
      ])
    })

    it('passes provided date as created_at', async () => {
      mockTable([{ id: 'new-1', content: 'Topic with date', created_at: '2024-01-15T00:00:00Z' }])

      const { items, create } = useTopics()
      await create({ content: 'Topic with date', date: '2024-01-15T00:00:00Z' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        content: 'Topic with date',
        created_at: '2024-01-15T00:00:00Z',
      })
      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })

    it('new item appears first when it has the latest created_at', async () => {
      mockTable([{ id: 'old', content: 'Old topic', created_at: '2024-01-01T00:00:00Z' }])

      const { items, fetchList, create } = useTopics()
      await fetchList()

      mockQueryChain.select.mockClear()

      mockTable([{ id: 'new', content: 'New topic', created_at: '2024-01-02T00:00:00Z' }])
      await create({ content: 'New topic', date: '2024-01-02T00:00:00Z' })

      expect(mockQueryChain.select).not.toHaveBeenCalledWith('*')
      expect(items.value.map((item) => item.id)).toEqual(['new', 'old'])
      expect(items.value[0].content).toBe('New topic')
    })

    it('inserts the new item at the end when sort order is asc', async () => {
      mockTable([{ id: 'old', content: 'Old topic', created_at: '2024-01-01T00:00:00Z' }])

      const { items, sortOrder, fetchList, create } = useTopics()
      sortOrder.value = 'asc'
      await fetchList()

      mockTable([{ id: 'new', content: 'New topic', created_at: '2024-01-02T00:00:00Z' }])
      await create({ content: 'New topic', date: '2024-01-02T00:00:00Z' })

      expect(items.value.map((item) => item.id)).toEqual(['old', 'new'])
    })

    it('refetches the list as rollback when no row is returned', async () => {
      const { create } = useTopics()

      mockQueryChain.select.mockClear()

      mockTable([])
      await create({ content: 'New topic' })

      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
    })

    it('sets error when insert fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'insert failed' } })),
      )

      const { items, error, create } = useTopics()
      await create({ content: 'New topic' })

      expect(error.value).toBe('insert failed')
      expect(items.value).toEqual([])
    })
  })
})
