import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockQueryChain, mockSupabaseClient, resetMocks } from '../../../test/mocks/supabase'
import { useWorkout } from '../useWorkout'

vi.mock('../useSupabase', () => ({
  useSupabase: vi.fn(() => mockSupabaseClient),
}))

describe('useWorkout', () => {
  beforeEach(() => {
    resetMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchList()', () => {
    it('fetches all workout records in descending order when no category given', async () => {
      const mockData = [
        {
          id: '1',
          category: 'chest',
          menu: 'bench press',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'pull up',
          intensity: 0,
          reps: 8,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: mockData, error: null })),
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(items.value).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('workout_records')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.eq).not.toHaveBeenCalled()
      expect(mockQueryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('filters by category when category is provided', async () => {
      const mockData = [
        {
          id: '1',
          category: 'chest',
          menu: 'bench press',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: mockData, error: null })),
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('chest')

      expect(items.value).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('workout_records')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.eq).toHaveBeenCalledWith('category', 'chest')
      expect(mockQueryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('returns empty array when no records exist', async () => {
      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('workout_records')
    })

    it('returns empty array when no records match the category', async () => {
      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('legs')

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockQueryChain.eq).toHaveBeenCalledWith('category', 'legs')
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'DB error' } })),
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(error.value).toBe('DB error')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('create()', () => {
    it('inserts a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useWorkout()
      await create({ category: 'chest', menu: 'bench press', intensity: 60, reps: 10 })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toEqual([])
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('workout_records')
      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        category: 'chest',
        menu: 'bench press',
        intensity: 60,
        reps: 10,
      })
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
    })

    it('refreshes with the active category filter after insert', async () => {
      const { fetchList, create } = useWorkout()
      await fetchList('chest')
      mockQueryChain.eq.mockClear()

      await create({ category: 'chest', menu: 'bench press', intensity: 60, reps: 10 })

      expect(mockQueryChain.eq).toHaveBeenCalledWith('category', 'chest')
    })

    it('inserts with created_at when date is provided', async () => {
      const { create } = useWorkout()
      await create({
        category: 'back',
        menu: 'pull up',
        intensity: 0,
        reps: 8,
        date: '2024-01-15T00:00:00Z',
      })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        category: 'back',
        menu: 'pull up',
        intensity: 0,
        reps: 8,
        created_at: '2024-01-15T00:00:00Z',
      })
    })

    it('sets error state when Supabase returns an error', async () => {
      mockQueryChain.then.mockImplementationOnce((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'Insert failed' } })),
      )

      const { error, loading, create } = useWorkout()
      await create({ category: 'legs', menu: 'squat', intensity: 80, reps: 5 })

      expect(error.value).toBe('Insert failed')
      expect(loading.value).toBe(false)
    })
  })
})
