import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockQueryChain, mockSupabaseClient, resetMocks } from '../../../test/mocks/supabase'
import { useWorkout } from '../useWorkout'
import type { WorkoutRecord } from '#shared/types/domain'

vi.mock('~/composables/useSupabase', () => ({
  useSupabase: () => mockSupabaseClient,
}))

function mockTable(rows: WorkoutRecord[]) {
  mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolve({ data: rows, error: null })),
  )
}

describe('useWorkout', () => {
  beforeEach(async () => {
    resetMocks()
    const { items, loading, error, sortOrder, lastCategory, fetchMenuRecords } = useWorkout()
    // 空テーブルを fetch してモジュールスコープの menuRecords をクリアする
    await fetchMenuRecords()
    items.value = []
    loading.value = false
    error.value = null
    sortOrder.value = 'desc'
    lastCategory.value = undefined
    resetMocks()
  })

  describe('fetchList()', () => {
    it('returns all records sorted by created_at descending when no category given', async () => {
      mockTable([
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
          menu: '懸垂',
          intensity: 0,
          reps: 8,
          created_at: '2024-01-02T00:00:00Z',
        },
      ])

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('workout_records')
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.eq).not.toHaveBeenCalled()
      expect(items.value[0].id).toBe('2')
      expect(items.value[1].id).toBe('1')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('filters by category on the DB query when category is provided', async () => {
      mockTable([
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('chest')

      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.eq).toHaveBeenCalledWith('category', 'chest')
      expect(items.value).toHaveLength(1)
      expect(items.value[0].category).toBe('chest')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when the table is empty', async () => {
      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('returns empty array when no records match the category', async () => {
      mockTable([])

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList('legs')

      expect(mockQueryChain.eq).toHaveBeenCalledWith('category', 'legs')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('sets error when fetch fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'fetch failed' } })),
      )

      const { items, loading, error, fetchList } = useWorkout()
      await fetchList()

      expect(error.value).toBe('fetch failed')
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })

  describe('toggleSortOrder()', () => {
    it('defaults sortOrder to desc', () => {
      const { sortOrder } = useWorkout()
      expect(sortOrder.value).toBe('desc')
    })

    it('switches to asc and re-sorts the list', async () => {
      mockTable([
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
          menu: 'ダンベルフライ',
          intensity: 20,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      ])

      const { items, sortOrder, fetchList, toggleSortOrder } = useWorkout()
      await fetchList()
      expect(items.value[0].id).toBe('2')

      await toggleSortOrder()
      expect(sortOrder.value).toBe('asc')
      expect(items.value[0].id).toBe('1')
    })

    it('preserves the active category filter when toggling sort', async () => {
      mockTable([
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { items, fetchList, toggleSortOrder } = useWorkout()
      await fetchList('chest')
      expect(items.value).toHaveLength(1)

      await toggleSortOrder()
      expect(mockQueryChain.eq).toHaveBeenLastCalledWith('category', 'chest')
      expect(items.value.every((r) => r.category === 'chest')).toBe(true)
    })
  })

  describe('menuSuggestions', () => {
    it('returns empty array before anything is fetched', () => {
      const { menuSuggestions } = useWorkout()
      expect(menuSuggestions.value).toEqual([])
    })

    it('returns unique sorted menu names from fetched records', async () => {
      mockTable([
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
      ])

      const { menuSuggestions, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      expect(mockQueryChain.select).toHaveBeenCalledWith('menu, category')
      expect(menuSuggestions.value).toEqual(['スクワット', 'ベンチプレス'])
    })

    it('includes menus from all categories, not just the active filter', async () => {
      // カテゴリ絞り込みは DB 側で行われるため一覧は chest のみを返す
      mockTable([
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { menuSuggestions, fetchList, fetchMenuRecords } = useWorkout()
      await fetchList('chest')

      // 候補用クエリは絞り込みなしで全カテゴリの menu を返す
      mockTable([
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
      ])
      await fetchMenuRecords()

      expect(menuSuggestions.value).toContain('ベンチプレス')
      expect(menuSuggestions.value).toContain('ラットプルダウン')
    })
  })

  describe('getMenuCandidates()', () => {
    it('returns empty array before anything is fetched', () => {
      const { getMenuCandidates } = useWorkout()
      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual([])
    })

    it('returns deduplicated menu names for the given category', async () => {
      mockTable([
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
      ])

      const { getMenuCandidates, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual(['ベンチプレス', 'ダンベルフライ'])
    })

    it('ignores records from other categories', async () => {
      mockTable([
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
      ])

      const { getMenuCandidates, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      const candidates = getMenuCandidates(ref('chest'))
      expect(candidates.value).toEqual(['ベンチプレス'])
      expect(candidates.value).not.toContain('ラットプルダウン')
    })

    it('caps results at 5 entries', async () => {
      const rows: WorkoutRecord[] = []
      for (let i = 1; i <= 7; i++) {
        rows.push({
          id: String(i),
          category: 'legs',
          menu: `メニュー${i}`,
          intensity: 50,
          reps: 10,
          created_at: `2024-01-0${i}T00:00:00Z`,
        })
      }
      mockTable(rows)

      const { getMenuCandidates, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      const candidates = getMenuCandidates(ref('legs'))
      expect(candidates.value).toHaveLength(5)
    })

    it('returns empty array when no records match the category', async () => {
      mockTable([
        {
          id: '1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { getMenuCandidates, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      const candidates = getMenuCandidates(ref('legs'))
      expect(candidates.value).toEqual([])
    })

    it('reacts to category ref change', async () => {
      mockTable([
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
      ])

      const { getMenuCandidates, fetchMenuRecords } = useWorkout()
      await fetchMenuRecords()

      const category = ref<import('#shared/types/domain').WorkoutCategory>('chest')
      const candidates = getMenuCandidates(category)
      expect(candidates.value).toEqual(['ベンチプレス'])
      category.value = 'back'
      expect(candidates.value).toEqual(['ラットプルダウン'])
    })
  })

  describe('create()', () => {
    it('inserts a new record and reflects the returned row without re-fetching the list', async () => {
      mockTable([
        {
          id: 'new-1',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { items, error, loading, create } = useWorkout()
      await create({ category: 'chest', menu: 'ベンチプレス', intensity: 60, reps: 10 })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        category: 'chest',
        menu: 'ベンチプレス',
        intensity: 60,
        reps: 10,
      })
      // insert チェーンの .select()（引数なし）だけが呼ばれ、一覧・メニュー候補の再フェッチは行われない
      expect(mockQueryChain.select).toHaveBeenCalledTimes(1)
      expect(mockQueryChain.select).toHaveBeenCalledWith()
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('*')
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('menu, category')
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toMatchObject({
        category: 'chest',
        menu: 'ベンチプレス',
        intensity: 60,
        reps: 10,
      })
    })

    it('adds the new menu to menuSuggestions and getMenuCandidates', async () => {
      mockTable([
        {
          id: 'new-1',
          category: 'legs',
          menu: 'スクワット',
          intensity: 80,
          reps: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { menuSuggestions, getMenuCandidates, create } = useWorkout()
      expect(menuSuggestions.value).toEqual([])

      await create({ category: 'legs', menu: 'スクワット', intensity: 80, reps: 10 })

      expect(menuSuggestions.value).toContain('スクワット')
      expect(getMenuCandidates(ref('legs')).value).toContain('スクワット')
    })

    it('inserts the row into items at the sortOrder position, same as a re-fetch', async () => {
      mockTable([
        {
          id: 'chest-3',
          category: 'chest',
          menu: 'ベンチプレス',
          intensity: 60,
          reps: 10,
          created_at: '2024-01-03T00:00:00Z',
        },
        {
          id: 'chest-1',
          category: 'chest',
          menu: 'ダンベルフライ',
          intensity: 20,
          reps: 12,
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      const { items, fetchList, create } = useWorkout()
      await fetchList('chest')
      expect(items.value.map((r) => r.id)).toEqual(['chest-3', 'chest-1'])

      resetMocks()
      mockTable([
        {
          id: 'chest-2',
          category: 'chest',
          menu: 'インクラインプレス',
          intensity: 40,
          reps: 10,
          created_at: '2024-01-02T00:00:00Z',
        },
      ])
      await create({
        category: 'chest',
        menu: 'インクラインプレス',
        intensity: 40,
        reps: 10,
        date: '2024-01-02T00:00:00Z',
      })

      // 一覧の再 select（eq によるカテゴリ絞り込みクエリ）は実行されない
      expect(mockQueryChain.eq).not.toHaveBeenCalled()
      expect(mockQueryChain.select).toHaveBeenCalledTimes(1)
      // 再フェッチした場合と同じ desc 並びで途中に挿入される
      expect(items.value.map((r) => r.id)).toEqual(['chest-3', 'chest-2', 'chest-1'])
    })

    it('does not add to items when the created category differs from the active filter', async () => {
      mockTable([])

      const { items, menuSuggestions, fetchList, create } = useWorkout()
      await fetchList('chest')
      expect(items.value).toHaveLength(0)

      mockTable([
        {
          id: 'back-1',
          category: 'back',
          menu: 'ラットプルダウン',
          intensity: 50,
          reps: 12,
          created_at: '2024-01-02T00:00:00Z',
        },
      ])
      await create({ category: 'back', menu: 'ラットプルダウン', intensity: 50, reps: 12 })

      // chest 絞り込み中のため items には入らないが、メニュー候補には反映される
      expect(items.value).toHaveLength(0)
      expect(menuSuggestions.value).toContain('ラットプルダウン')
    })

    it('falls back to re-fetching when insert returns no rows', async () => {
      // デフォルトの then は { data: [], error: null } を返す＝返却行なし
      const { error, create } = useWorkout()
      await create({ category: 'chest', menu: 'ベンチプレス', intensity: 60, reps: 10 })

      // ローカル状態と DB がずれた可能性があるため一覧とメニュー候補を再フェッチする
      expect(mockQueryChain.select).toHaveBeenCalledWith('*')
      expect(mockQueryChain.select).toHaveBeenCalledWith('menu, category')
      expect(error.value).toBeNull()
    })

    it('passes provided date as created_at', async () => {
      mockTable([
        {
          id: 'new-1',
          category: 'back',
          menu: '懸垂',
          intensity: 0,
          reps: 8,
          created_at: '2024-01-15T00:00:00Z',
        },
      ])

      const { items, create } = useWorkout()
      await create({
        category: 'back',
        menu: '懸垂',
        intensity: 0,
        reps: 8,
        date: '2024-01-15T00:00:00Z',
      })

      expect(mockQueryChain.insert).toHaveBeenCalledWith({
        category: 'back',
        menu: '懸垂',
        intensity: 0,
        reps: 8,
        created_at: '2024-01-15T00:00:00Z',
      })
      expect(items.value[0].created_at).toBe('2024-01-15T00:00:00Z')
    })

    it('sets error and leaves local state untouched when insert fails', async () => {
      mockQueryChain.then.mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolve({ data: null, error: { message: 'insert failed' } })),
      )

      const { items, menuSuggestions, error, create } = useWorkout()
      await create({ category: 'chest', menu: 'ベンチプレス', intensity: 60, reps: 10 })

      expect(error.value).toBe('insert failed')
      expect(items.value).toEqual([])
      expect(menuSuggestions.value).toEqual([])
      // insert が失敗しただけなのでロールバックの再フェッチは行わない
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('*')
      expect(mockQueryChain.select).not.toHaveBeenCalledWith('menu, category')
    })
  })
})
