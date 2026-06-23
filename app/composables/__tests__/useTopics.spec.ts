import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockQueryChain, mockSupabaseClient, resetMocks } from '../../../test/mocks/supabase'
import { useTopics } from '../useTopics'

vi.mock('../useSupabase', () => ({
  useSupabase: vi.fn(() => mockSupabaseClient),
}))

describe('useTopics', () => {
  beforeEach(() => {
    resetMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchList()', () => {
    it('fetches topics records and stores them in descending order', async () => {
      const mockData = [
        { id: '1', content: 'Topic A', created_at: '2024-01-02T00:00:00Z' },
        { id: '2', content: 'Topic B', created_at: '2024-01-01T00:00:00Z' },
      ]
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: mockData, error: null })),
      )

      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(items.value).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('topics')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('returns empty array when no records exist', async () => {
      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('topics')
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'DB error' } })),
      )

      const { items, loading, error, fetchList } = useTopics()
      await fetchList()

      expect(error.value).toBe('DB error')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('create()', () => {
    it('inserts a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useTopics()
      await create({ content: 'New topic' })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toEqual([])
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('topics')
      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        content: 'New topic',
      })
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
    })

    it('inserts with created_at when date is provided', async () => {
      const { create } = useTopics()
      await create({ content: 'Topic with date', date: '2024-01-15T00:00:00Z' })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        content: 'Topic with date',
        created_at: '2024-01-15T00:00:00Z',
      })
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'Insert failed' } })),
      )

      const { error, loading, create } = useTopics()
      await create({ content: 'Topic' })

      expect(error.value).toBe('Insert failed')
      expect(loading.value).toBe(false)
    })
  })
})
