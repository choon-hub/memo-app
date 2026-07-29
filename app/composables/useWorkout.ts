import { ref, computed, type Ref } from 'vue'
import type { WorkoutRecord, WorkoutCategory } from '#shared/types/domain'
import { sortByDate } from '~/utils/sort'
import { withLoading } from '~/utils/withLoading'
import { useSupabase } from '~/composables/useSupabase'

const items = ref<WorkoutRecord[]>([])
// メニュー候補はカテゴリ絞り込み中でも全カテゴリのメニューを対象とするため、
// 候補算出に必要な列だけを items とは別に保持する（取得は初回のみ。create 成功時は返却行を直接反映）
const menuRecords = ref<Pick<WorkoutRecord, 'menu' | 'category'>[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastCategory = ref<WorkoutCategory | undefined>(undefined)
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useWorkout = () => {
  async function fetchList(category?: WorkoutCategory) {
    lastCategory.value = category
    loading.value = true
    error.value = null
    try {
      let query = useSupabase().from('workout_records').select('*')
      if (category) query = query.eq('category', category)
      const { data, error: fetchError } = await query
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      items.value = sortByDate(data ?? [], sortOrder.value)
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuRecords() {
    const { data, error: fetchError } = await useSupabase()
      .from('workout_records')
      .select('menu, category')
    if (fetchError) {
      error.value = fetchError.message
      return
    }
    menuRecords.value = data ?? []
  }

  async function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    await fetchList(lastCategory.value)
  }

  async function create(payload: {
    category: WorkoutCategory
    menu: string
    intensity: number
    reps: number
    date?: string
  }) {
    await withLoading(loading, error, async () => {
      const { data, error: insertError } = await useSupabase()
        .from('workout_records')
        .insert({
          category: payload.category,
          menu: payload.menu,
          intensity: payload.intensity,
          reps: payload.reps,
          ...(payload.date ? { created_at: payload.date } : {}),
        })
        .select()
      if (insertError) {
        error.value = insertError.message
        return
      }
      const inserted = data?.[0]
      if (!inserted) {
        // 返却行が得られずローカル状態と DB がずれた可能性があるため、再フェッチで復旧する
        await fetchList(lastCategory.value)
        await fetchMenuRecords()
        return
      }
      menuRecords.value = [
        ...menuRecords.value,
        { menu: inserted.menu, category: inserted.category },
      ]
      if (!lastCategory.value || inserted.category === lastCategory.value) {
        items.value = sortByDate([...items.value, inserted], sortOrder.value)
      }
    })
  }

  async function createMany(
    payloads: {
      category: WorkoutCategory
      menu: string
      intensity: number
      reps: number
      date?: string
    }[],
  ) {
    await withLoading(loading, error, async () => {
      const { error: insertError } = await useSupabase()
        .from('workout_records')
        .insert(
          payloads.map((payload) => ({
            category: payload.category,
            menu: payload.menu,
            intensity: payload.intensity,
            reps: payload.reps,
            ...(payload.date ? { created_at: payload.date } : {}),
          })),
        )
      if (insertError) {
        error.value = insertError.message
        return
      }
      await fetchList(lastCategory.value)
      await fetchMenuRecords()
    })
  }

  async function update(
    id: string,
    payload: { menu: string; intensity: number; reps: number; date?: string },
  ) {
    await withLoading(loading, error, async () => {
      const before = items.value.find((item) => item.id === id)
      const { data, error: updateError } = await useSupabase()
        .from('workout_records')
        .update({
          menu: payload.menu,
          intensity: payload.intensity,
          reps: payload.reps,
          ...(payload.date ? { created_at: payload.date } : {}),
        })
        .eq('id', id)
        .select()
      if (updateError) {
        error.value = updateError.message
        return
      }
      const updated = data?.[0]
      if (!updated) {
        // 返却行が得られずローカル状態と DB がずれた可能性があるため再フェッチする
        await fetchList(lastCategory.value)
        await fetchMenuRecords()
        return
      }
      items.value = sortByDate(
        items.value.map((item) => (item.id === updated.id ? updated : item)),
        sortOrder.value,
      )
      if (before) {
        // menuRecords は id を持たないため、更新前の menu/category の組み合わせで一致するエントリを探す
        const idx = menuRecords.value.findIndex(
          (r) => r.menu === before.menu && r.category === before.category,
        )
        if (idx !== -1) {
          menuRecords.value = menuRecords.value.map((r, i) =>
            i === idx ? { menu: updated.menu, category: updated.category } : r,
          )
        }
      }
    })
  }

  const menuSuggestions = computed(() =>
    [...new Set(menuRecords.value.map((r) => r.menu))].sort((a, b) => a.localeCompare(b)),
  )

  function getMenuCandidates(category: Ref<WorkoutCategory>) {
    return computed(() =>
      [
        ...new Set(
          menuRecords.value.filter((r) => r.category === category.value).map((r) => r.menu),
        ),
      ].slice(0, 5),
    )
  }

  return {
    items,
    loading,
    error,
    sortOrder,
    lastCategory,
    menuSuggestions,
    getMenuCandidates,
    fetchList,
    fetchMenuRecords,
    toggleSortOrder,
    create,
    createMany,
    update,
  }
}
