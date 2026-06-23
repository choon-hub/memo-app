import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockQueryChain, mockSupabaseClient, resetMocks } from '../../../test/mocks/supabase'
import { useDailyNew } from '../useDailyNew'

vi.mock('../useSupabase', () => ({
  useSupabase: vi.fn(() => mockSupabaseClient),
}))

describe('useDailyNew', () => {
  beforeEach(() => {
    resetMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchList()', () => {
    it('fetches daily_new records and stores them in descending order', async () => {
      const mockData = [
        { id: '1', title: 'First', content: 'Content 1', created_at: '2024-01-02T00:00:00Z' },
        { id: '2', title: 'Second', content: 'Content 2', created_at: '2024-01-01T00:00:00Z' },
      ]
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: mockData, error: null })),
      )

      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(items.value).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('daily_new')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('returns empty array when no records exist', async () => {
      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('daily_new')
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'DB error' } })),
      )

      const { items, loading, error, fetchList } = useDailyNew()
      await fetchList()

      expect(error.value).toBe('DB error')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('create()', () => {
    it('inserts a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useDailyNew()
      await create({ title: 'New title', content: 'New content' })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toEqual([])
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('daily_new')
      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        title: 'New title',
        content: 'New content',
      })
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
    })

    it('inserts with created_at when date is provided', async () => {
      const { create } = useDailyNew()
      await create({ title: 'Title', content: 'Content', date: '2024-01-15T00:00:00Z' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        title: 'Title',
        content: 'Content',
        created_at: '2024-01-15T00:00:00Z',
      })
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'Insert failed' } })),
      )

      const { error, loading, create } = useDailyNew()
      await create({ title: 'Title', content: 'Content' })

      expect(error.value).toBe('Insert failed')
      expect(loading.value).toBe(false)
    })
  })
})
