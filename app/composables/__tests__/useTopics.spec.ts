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
    it('updates the content of an existing item', async () => {
      mockTable([{ id: '1', content: 'Original', created_at: '2024-01-01T00:00:00Z' }])

      const { items, loading, error, fetchList, update } = useTopics()
      await fetchList()

      mockTable([{ id: '1', content: 'Updated', created_at: '2024-01-01T00:00:00Z' }])
      await update('1', { content: 'Updated' })

      expect(mockQueryChain.update).toHaveBeenCalledWith({ content: 'Updated' })
      expect(mockQueryChain.eq).toHaveBeenCalledWith('id', '1')
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value[0].content).toBe('Updated')
    })

    it('preserves sort order (desc) after update', async () => {
      mockTable([
        { id: '1', content: 'Older', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Newer', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, fetchList, update } = useTopics()
      await fetchList()

      mockTable([
        { id: '1', content: 'Older', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', content: 'Newer updated', created_at: '2024-01-02T00:00:00Z' },
      ])
      await update('2', { content: 'Newer updated' })

      expect(items.value[0].id).toBe('2')
      expect(items.value[0].content).toBe('Newer updated')
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

  describe('create()', () => {
    it('inserts a new record and refreshes the list', async () => {
      mockTable([{ id: 'new-1', content: 'New topic', created_at: '2024-01-01T00:00:00Z' }])

      const { items, error, loading, create } = useTopics()
      await create({ content: 'New topic' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({ content: 'New topic' })
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({ content: 'New topic' })
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

      mockTable([
        { id: 'old', content: 'Old topic', created_at: '2024-01-01T00:00:00Z' },
        { id: 'new', content: 'New topic', created_at: '2024-01-02T00:00:00Z' },
      ])
      await create({ content: 'New topic', date: '2024-01-02T00:00:00Z' })

      expect(items.value[0].content).toBe('New topic')
      expect(items.value[1].id).toBe('old')
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
