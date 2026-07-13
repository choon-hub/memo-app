import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref, computed } from 'vue'
import WorkoutPage from '../index.vue'
import type { WorkoutRecord } from '#shared/types/domain'

vi.mock('#app/composables/asyncData', async () => {
  const { ref } = await import('vue')
  return {
    useAsyncData: vi.fn(async (_key: unknown, fn?: () => unknown) => {
      if (typeof fn === 'function') await fn()
      return { data: ref(null), pending: ref(false), refresh: vi.fn(), execute: vi.fn() }
    }),
    useLazyAsyncData: vi.fn(),
    useNuxtData: vi.fn(() => ({ data: ref(null) })),
    refreshNuxtData: vi.fn(),
    clearNuxtData: vi.fn(),
    createUseAsyncData: vi.fn(),
  }
})

const mockFetchList = vi.fn()
const mockCreate = vi.fn()
const mockToggleSortOrder = vi.fn()
const mockItems = ref<WorkoutRecord[]>([])
const mockLoading = ref(false)
const mockError = ref<string | null>(null)
const mockSortOrder = ref<'asc' | 'desc'>('desc')

vi.mock('~/composables/useWorkout', () => ({
  useWorkout: vi.fn(() => ({
    items: mockItems,
    loading: mockLoading,
    error: mockError,
    sortOrder: mockSortOrder,
    menuSuggestions: computed(() => []),
    getMenuCandidates: vi.fn(() => computed(() => [])),
    fetchList: mockFetchList,
    create: mockCreate,
    toggleSortOrder: mockToggleSortOrder,
  })),
}))

async function mountPage() {
  const wrapper = mount(
    defineComponent({ render: () => h(Suspense, null, { default: () => h(WorkoutPage) }) }),
  )
  await flushPromises()
  return wrapper
}

describe('workout page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems.value = []
    mockLoading.value = false
    mockError.value = null
    mockSortOrder.value = 'desc'
  })

  it('calls fetchList on mount', async () => {
    await mountPage()
    expect(mockFetchList).toHaveBeenCalledOnce()
  })

  it('shows error message when error is set', async () => {
    mockError.value = 'データの取得に失敗しました'
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('データの取得に失敗しました')
  })

  it('renders SkeletonList instead of WorkoutList while loading with no items', async () => {
    mockLoading.value = true
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(false)
  })

  it('keeps WorkoutList mounted while loading with existing items', async () => {
    mockLoading.value = true
    mockItems.value = [
      {
        id: '1',
        category: 'chest',
        menu: 'ベンチプレス',
        intensity: 60,
        reps: 10,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(true)
  })

  it('hides SkeletonList when loading is false', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(true)
  })
})
