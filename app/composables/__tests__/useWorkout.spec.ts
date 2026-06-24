import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkout, _workoutStore } from '../useWorkout'

describe('useWorkout', () => {
  beforeEach(() => {
    _workoutStore.length = 0
  })

  describe('fetchList()', () => {
    it('returns all records sorted by created_at descending when no category given', async () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'bench press',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'pull up',
          intensity: 0,
          reps: 8,
          created_at: '2024-01-02T00:00:00Z',
        },
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('filters by category when category is provided', async () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'bench press',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'pull up',
          intensity: 0,
          reps: 8,
          created_at: '2024-01-02T00:00:00Z',
        },
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('chest')

      expect(items.value).toHaveLength(1)
      expect(items.value[0].category).toBe('chest')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when store is empty', async () => {
      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when no records match the category', async () => {
      _workoutStore.push({
        id: '1',
        category: 'chest',
        menu: 'bench press',
        intensity: 60,
        reps: 10,
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('legs')

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('create()', () => {
    it('adds a new record and refreshes the list', async () => {
      const { items, error, loading, create } = useWorkout()
      await create({ category: 'chest', menu: 'bench press', intensity: 60, reps: 10 })

      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({
        category: 'chest',
        menu: 'bench press',
        intensity: 60,
        reps: 10,
      })
    })

    it('refreshes with the active category filter after insert', async () => {
      _workoutStore.push({
        id: 'back-1',
        category: 'back',
        menu: 'pull up',
        intensity: 0,
        reps: 8,
        created_at: '2024-01-01T00:00:00Z',
      })

      const { items, fetchList, create } = useWorkout()
      await fetchList('chest')

      await create({ category: 'chest', menu: 'bench press', intensity: 60, reps: 10 })

      expect(items.value.every((r) => r.category === 'chest')).toBe(true)
    })

    it('uses provided date as created_at', async () => {
      const { items, create } = useWorkout()
      await create({
        category: 'back',
        menu: 'pull up',
        intensity: 0,
        reps: 8,
        date: '2024-01-15T00:00:00Z',
      })

      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })
  })
})
