import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mockQueryChain,
  mockSupabaseClient,
  queueResult,
  resetMocks,
} from '../../../test/mocks/supabase'
import { useDailyNew } from '../useDailyNew'
import type { DailyNew } from '#shared/types/domain'

vi.mock('~/composables/useSupabase', () => ({
  useSupabase: () => mockSupabaseClient,
}))

function mockTable(rows: DailyNew[]) {
  mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolve({ data: rows, error: null })),
  )
}

describe('useDailyNew', () => {
  beforeEach(() => {
    resetMocks()
    const { items, loading, error, sortOrder } = useDailyNew()
    items.value = []
    loading.value = false
    error.value = null
    sortOrder.value = 'desc'
  })

  describe('fetchList()', () => {
    it('returns items sorted by created_at descending', async () => {
      mockTable([
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('daily_new')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when the table is empty', async () => {
      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('sets error when fetch fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'fetch failed' } })),
      )

      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(error.value).toBe('fetch failed')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useDailyNew()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
      mockTable([
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, sortOrder, fetchList, toggleSortOrder } = useDailyNew()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('toggles back to desc', async () => {
      mockTable([
        { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
      ])

      const { items, sortOrder, fetchList, toggleSortOrder } = useDailyNew()
      await fetchList()
      await toggleSortOrder()
      await toggleSortOrder()
      expect(sortOrder.value).toBe('desc')
      expect(items.value[0].id).toBe('2')
    })
  })

  describe('update()', () => {
    it('replaces the item with the returned row without refetching the list', async () => {
      queueResult({
        data: [
          {
            id: '1',
            title: 'Original title',
            content: 'Original content',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        error: null,
      })

      const { items, loading, error, fetchList, update } = useDailyNew()
      await fetchList()

      queueResult({
        data: [
          {
            id: '1',
            title: 'Updated title',
            content: 'Updated content',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        error: null,
      })
      await update('1', { title: 'Updated title', content: 'Updated content' })

      expect(mockQueryChain.update).toHaveBeenCalledWith({
        title: 'Updated title',
        content: 'Updated content',
      })
      expect(mockQueryChain.eq).toHaveBeenCalledWith('id', '1')
      // fetchList と update().select() の 2 回のみ（一覧の再 select なし）
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value[0].title).toBe('Updated title')
      expect(items.value[0].content).toBe('Updated content')
    })

    it('preserves sort order (desc) after update', async () => {
      queueResult({
        data: [
          { id: '1', title: 'Older', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
          { id: '2', title: 'Newer', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
        ],
        error: null,
      })

      const { items, fetchList, update } = useDailyNew()
      await fetchList()

      queueResult({
        data: [
          {
            id: '2',
            title: 'Newer updated',
            content: 'C2 updated',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        error: null,
      })
      await update('2', { title: 'Newer updated', content: 'C2 updated' })

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('2')
      expect(items.value[0].title).toBe('Newer updated')
      expect(items.value[1].id).toBe('1')
    })

    it('refetches the list when update returns no rows', async () => {
      queueResult({ data: [], error: null })
      queueResult({
        data: [{ id: '1', title: 'Refetched', content: 'C1', created_at: '2024-01-01T00:00:00Z' }],
        error: null,
      })

      const { items, update } = useDailyNew()
      await update('1', { title: 'Updated', content: 'Updated' })

      // update().select() とロールバックの fetchList で from が 2 回呼ばれる
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(items.value).toHaveLength(1)
      expect(items.value[0].title).toBe('Refetched')
    })

    it('sets error when update fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'update failed' } })),
      )

      const { error, update } = useDailyNew()
      await update('1', { title: 'Updated', content: 'Updated' })

      expect(error.value).toBe('update failed')
    })
  })

  describe('remove()', () => {
    it('removes the item locally without refetching the list', async () => {
      queueResult({
        data: [
          { id: '1', title: 'To remove', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
          { id: '2', title: 'Keep', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
        ],
        error: null,
      })

      const { items, loading, error, fetchList, remove } = useDailyNew()
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
      queueResult({
        data: [
          { id: '1', title: 'Oldest', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
          { id: '2', title: 'Middle', content: 'C2', created_at: '2024-01-02T00:00:00Z' },
          { id: '3', title: 'Newest', content: 'C3', created_at: '2024-01-03T00:00:00Z' },
        ],
        error: null,
      })

      const { items, fetchList, remove } = useDailyNew()
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

      const { items, error, remove } = useDailyNew()
      items.value = [{ id: '1', title: 'Keep', content: 'C1', created_at: '2024-01-01T00:00:00Z' }]
      await remove('1')

      expect(error.value).toBe('delete failed')
      expect(items.value).toHaveLength(1)
    })
  })

  describe('create()', () => {
    it('inserts a new record and applies the returned row without refetching the list', async () => {
      queueResult({
        data: [
          {
            id: 'new-1',
            title: 'New title',
            content: 'New content',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        error: null,
      })

      const { items, error, loading, create } = useDailyNew()
      await create({ title: 'New title', content: 'New content' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        title: 'New title',
        content: 'New content',
      })
      // insert().select() の 1 回のみ（一覧の再 select なし）
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1)
      expect(mockQueryChain.select).toHaveBeenCalledTimes(1)
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({ title: 'New title', content: 'New content' })
    })

    it('passes provided date as created_at', async () => {
      queueResult({
        data: [
          { id: 'new-1', title: 'Title', content: 'Content', created_at: '2024-01-15T00:00:00Z' },
        ],
        error: null,
      })

      const { items, create } = useDailyNew()
      await create({ title: 'Title', content: 'Content', date: '2024-01-15T00:00:00Z' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        title: 'Title',
        content: 'Content',
        created_at: '2024-01-15T00:00:00Z',
      })
      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })

    it('inserts the new item first when it has the latest created_at (desc)', async () => {
      queueResult({
        data: [{ id: 'old', title: 'Old', content: 'Old', created_at: '2024-01-01T00:00:00Z' }],
        error: null,
      })

      const { items, fetchList, create } = useDailyNew()
      await fetchList()

      queueResult({
        data: [{ id: 'new', title: 'New', content: 'New', created_at: '2024-01-02T00:00:00Z' }],
        error: null,
      })
      await create({ title: 'New', content: 'New', date: '2024-01-02T00:00:00Z' })

      // fetchList と insert().select() の 2 回のみ（一覧の再 select なし）
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(items.value).toHaveLength(2)
      expect(items.value[0].title).toBe('New')
      expect(items.value[1].id).toBe('old')
    })

    it('inserts the new item at the position matching sortOrder (asc)', async () => {
      queueResult({
        data: [{ id: 'old', title: 'Old', content: 'Old', created_at: '2024-01-01T00:00:00Z' }],
        error: null,
      })

      const { items, sortOrder, fetchList, create } = useDailyNew()
      sortOrder.value = 'asc'
      await fetchList()

      queueResult({
        data: [{ id: 'new', title: 'New', content: 'New', created_at: '2024-01-02T00:00:00Z' }],
        error: null,
      })
      await create({ title: 'New', content: 'New', date: '2024-01-02T00:00:00Z' })

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('old')
      expect(items.value[1].id).toBe('new')
    })

    it('refetches the list when insert returns no rows', async () => {
      queueResult({ data: [], error: null })
      queueResult({
        data: [
          { id: 'new-1', title: 'Refetched', content: 'C1', created_at: '2024-01-01T00:00:00Z' },
        ],
        error: null,
      })

      const { items, create } = useDailyNew()
      await create({ title: 'New title', content: 'New content' })

      // insert().select() とロールバックの fetchList で from が 2 回呼ばれる
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(items.value).toHaveLength(1)
      expect(items.value[0].title).toBe('Refetched')
    })

    it('sets error when insert fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'insert failed' } })),
      )

      const { items, error, create } = useDailyNew()
      await create({ title: 'New title', content: 'New content' })

      expect(error.value).toBe('insert failed')
      expect(items.value).toEqual([])
    })
  })
})
