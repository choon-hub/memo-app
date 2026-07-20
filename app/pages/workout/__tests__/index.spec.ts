import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref, computed, type Ref } from 'vue'
import WorkoutPage from '../index.vue'
import type { WorkoutCategory, WorkoutRecord } from '#shared/types/domain'

vi.mock('#app/composables/asyncData', async () => {
  const { createAsyncDataMock } = await import('../../../../test/helpers/nuxt')
  return createAsyncDataMock()
})

const mockFetchList = vi.fn()
const mockFetchMenuRecords = vi.fn()
const mockCreate = vi.fn()
const mockToggleSortOrder = vi.fn()
const mockItems = ref<WorkoutRecord[]>([])
const mockLoading = ref(false)
const mockError = ref<string | null>(null)
const mockSortOrder = ref<'asc' | 'desc'>('desc')
const mockMenuSuggestions = ref<string[]>([])
const mockMenuRecords = ref<{ menu: string; category: WorkoutCategory }[]>([])
const mockGetMenuCandidates = vi.fn((category: Ref<WorkoutCategory>) =>
  computed(() =>
    mockMenuRecords.value.filter((r) => r.category === category.value).map((r) => r.menu),
  ),
)

vi.mock('~/composables/useWorkout', () => ({
  useWorkout: vi.fn(() => ({
    items: mockItems,
    loading: mockLoading,
    error: mockError,
    sortOrder: mockSortOrder,
    menuSuggestions: mockMenuSuggestions,
    getMenuCandidates: mockGetMenuCandidates,
    fetchList: mockFetchList,
    fetchMenuRecords: mockFetchMenuRecords,
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

function makeRecord(overrides: Partial<WorkoutRecord> = {}): WorkoutRecord {
  return {
    id: '1',
    category: 'chest',
    menu: 'ベンチプレス',
    intensity: 60,
    reps: 10,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('workout page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems.value = []
    mockLoading.value = false
    mockError.value = null
    mockSortOrder.value = 'desc'
    mockMenuSuggestions.value = []
    mockMenuRecords.value = []
  })

  it('calls fetchList and fetchMenuRecords on mount', async () => {
    await mountPage()
    expect(mockFetchList).toHaveBeenCalledOnce()
    expect(mockFetchMenuRecords).toHaveBeenCalledOnce()
  })

  it('shows error message when error is set', async () => {
    mockError.value = 'データの取得に失敗しました'
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('データの取得に失敗しました')
  })

  it('renders WorkoutList with items from composable', async () => {
    mockItems.value = [makeRecord()]
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('ベンチプレス')
  })

  it('renders SkeletonList instead of WorkoutList while loading with no items', async () => {
    mockLoading.value = true
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(false)
  })

  it('keeps WorkoutList mounted while loading with existing items', async () => {
    mockLoading.value = true
    mockItems.value = [makeRecord()]
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(true)
  })

  it('hides SkeletonList when loading is false', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WorkoutList' }).exists()).toBe(true)
  })

  it('defaults to the chest category tab on initial render', async () => {
    const wrapper = await mountPage()
    const tabs = wrapper.findComponent({ name: 'WorkoutCategoryTabs' })
    expect(tabs.props('modelValue')).toBe('chest')
  })

  it('switches category and filters menu candidates accordingly when tabs change', async () => {
    mockMenuRecords.value = [
      { menu: 'ベンチプレス', category: 'chest' },
      { menu: 'デッドリフト', category: 'back' },
    ]
    const wrapper = await mountPage()
    const tabs = wrapper.findComponent({ name: 'WorkoutCategoryTabs' })

    let form = wrapper.findComponent({ name: 'WorkoutForm' })
    expect(form.props('menuCandidates')).toEqual(['ベンチプレス'])

    await tabs.vm.$emit('update:modelValue', 'back')
    await flushPromises()

    expect(wrapper.findComponent({ name: 'WorkoutCategoryTabs' }).props('modelValue')).toBe('back')
    form = wrapper.findComponent({ name: 'WorkoutForm' })
    expect(form.props('menuCandidates')).toEqual(['デッドリフト'])
  })

  it('calls create with category and ISO timestamp when form submits', async () => {
    const wrapper = await mountPage()
    const form = wrapper.findComponent({ name: 'WorkoutForm' })
    await form.vm.$emit('submit', {
      menu: 'スクワット',
      intensity: 80,
      reps: 8,
      date: '2024-01-15',
    })
    expect(mockCreate).toHaveBeenCalledWith({
      category: 'chest',
      menu: 'スクワット',
      intensity: 80,
      reps: 8,
      date: '2024-01-15T00:00:00.000Z',
    })
  })

  it('submits create with the currently selected category after switching tabs', async () => {
    const wrapper = await mountPage()
    const tabs = wrapper.findComponent({ name: 'WorkoutCategoryTabs' })
    await tabs.vm.$emit('update:modelValue', 'legs')
    await flushPromises()

    const form = wrapper.findComponent({ name: 'WorkoutForm' })
    await form.vm.$emit('submit', {
      menu: 'レッグプレス',
      intensity: 100,
      reps: 12,
      date: '2024-01-20',
    })
    expect(mockCreate).toHaveBeenCalledWith({
      category: 'legs',
      menu: 'レッグプレス',
      intensity: 100,
      reps: 12,
      date: '2024-01-20T00:00:00.000Z',
    })
  })

  it('calls toggleSortOrder when the list emits toggle-sort', async () => {
    const wrapper = await mountPage()
    const list = wrapper.findComponent({ name: 'WorkoutList' })
    await list.vm.$emit('toggle-sort')
    expect(mockToggleSortOrder).toHaveBeenCalledOnce()
  })

  it('prefills category and form fields when the list emits copy', async () => {
    mockItems.value = [makeRecord({ category: 'back', menu: 'デッドリフト' })]
    const wrapper = await mountPage()
    const list = wrapper.findComponent({ name: 'WorkoutList' })
    await list.vm.$emit('copy', makeRecord({ category: 'back', menu: 'デッドリフト' }))
    await flushPromises()

    expect(wrapper.findComponent({ name: 'WorkoutCategoryTabs' }).props('modelValue')).toBe('back')
    const form = wrapper.findComponent({ name: 'WorkoutForm' })
    expect(form.props('prefill')).toMatchObject({ category: 'back', menu: 'デッドリフト' })
  })
})
