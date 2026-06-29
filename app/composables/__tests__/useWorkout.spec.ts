import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useWorkout, _workoutStore } from '../useWorkout'

describe('useWorkout', () => {
  beforeEach(() => {
    _workoutStore.length = 0
    const { items, loading, error, sortOrder, lastCategory } = useWorkout()
    items.value = []
    loading.value = false
    error.value = null
    sortOrder.value = 'desc'
    lastCategory.value = undefined
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

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useWorkout()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
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
          category: 'chest',
          menu: 'dumbbell fly',
          intensity: 20,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      )

      const { items, sortOrder, fetchList, toggleSortOrder } = useWorkout()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('preserves the active category filter when toggling sort', async () => {
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

      const { items, fetchList, toggleSortOrder } = useWorkout()
      await fetchList('chest')
      expect(items.value).toHaveLength(1)

      await toggleSortOrder()
      expect(items.value.every((r) => r.category === 'chest')).toBe(true)
    })
  })

  describe('menuSuggestions', () => {
    it('returns empty array when items is empty', () => {
      const { menuSuggestions } = useWorkout()
      expect(menuSuggestions.value).toEqual([])
    })

    it('returns unique sorted menu names from items', async () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'スクワット',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'ベンチプレス',
          intensity: 50,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          category: 'chest',
          menu: 'スクワット',
          intensity: 70,
          reps: 8,
          created_at: '2024-01-03T00:00:00Z',
        },
      )

      const { menuSuggestions, fetchList } = useWorkout()
      await fetchList()

      expect(menuSuggestions.value).toEqual(['スクワット', 'ベンチプレス'])
    })

    it('includes menus from all categories, not just the active filter', async () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'ラットプルダウン',
          intensity: 50,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      )

      const { menuSuggestions, fetchList } = useWorkout()
      await fetchList('chest')

      expect(menuSuggestions.value).toContain('ベンチプレス')
      expect(menuSuggestions.value).toContain('ラットプルダウン')
    })
  })

  describe('getMenuCandidates()', () => {
    it('returns empty array when store is empty', () => {
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual([])
    })

    it('returns deduplicated menu names for the given category', () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 80,
          reps: 8,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          category: 'chest',
          menu: 'ダンベルフライ',
          intensity: 20,
          reps: 12,
          created_at: '2024-01-03T00:00:00Z',
        },
      )
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual(['ベンチプレス', 'ダンベルフライ'])
    })

    it('ignores records from other categories', () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'ラットプルダウン',
          intensity: 50,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      )
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual(['ベンチプレス'])
      expect(candidates.value).not.toContain('ラットプルダウン')
    })

    it('caps results at 5 entries', () => {
      for (let i = 1; i <= 7; i++) {
        _workoutStore.push({
          id: String(i),
          category: 'legs',
          menu: `メニュー${i}`,
          intensity: 50,
          reps: 10,
          created_at: `2024-01-0${i}T00:00:00Z`,
        })
      }
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('legs'))
      expect(candidates.value).toHaveLength(5)
    })

    it('returns empty array when no records match the category', () => {
      _workoutStore.push({
        id: '1',
        category: 'chest',
        menu: 'ベンチプレス',
        intensity: 60,
        reps: 10,
        created_at: '2024-01-01T00:00:00Z',
      })
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('legs'))
      expect(candidates.value).toEqual([])
    })

    it('reacts to category ref change', () => {
      _workoutStore.push(
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          category: 'back',
          menu: 'ラットプルダウン',
          intensity: 50,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      )
      const category = ref<import('#shared/types/domain').WorkoutCategory>('chest')
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(category)
      expect(candidates.value).toEqual(['ベンチプレス'])
      category.value = 'back'
      expect(candidates.value).toEqual(['ラットプルダウン'])
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
