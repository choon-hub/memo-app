import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import TopicsPage from '../index.vue'

vi.mock('#app/composables/asyncData', async () => {
  const { createAsyncDataMock } = await import('../../../../test/helpers/nuxt')
  return createAsyncDataMock()
})

const mockFetchList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockItems = ref<{ id: string; content: string; created_at: string }[]>([])
const mockLoading = ref(false)
const mockError = ref<string | null>(null)

vi.mock('~/composables/useTopics', () => ({
  useTopics: vi.fn(() => ({
    items: mockItems,
    loading: mockLoading,
    error: mockError,
    fetchList: mockFetchList,
    create: mockCreate,
    update: mockUpdate,
  })),
}))

async function mountPage() {
  const wrapper = mount(
    defineComponent({ render: () => h(Suspense, null, { default: () => h(TopicsPage) }) }),
  )
  await flushPromises()
  return wrapper
}

describe('topics page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems.value = []
    mockLoading.value = false
    mockError.value = null
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

  it('renders TopicList with items from composable', async () => {
    mockItems.value = [{ id: '1', content: 'トピック', created_at: '2024-01-01T00:00:00Z' }]
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('トピック')
  })

  it('renders SkeletonList instead of TopicList while loading with no items', async () => {
    mockLoading.value = true
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TopicList' }).exists()).toBe(false)
  })

  it('keeps TopicList mounted while loading with existing items', async () => {
    mockLoading.value = true
    mockItems.value = [{ id: '1', content: 'トピック', created_at: '2024-01-01T00:00:00Z' }]
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicList' }).exists()).toBe(true)
  })

  it('hides SkeletonList when loading is false', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicList' }).exists()).toBe(true)
  })

  it('calls create with ISO timestamp when form submits', async () => {
    const wrapper = await mountPage()
    const form = wrapper.findComponent({ name: 'TopicForm' })
    await form.vm.$emit('submit', { content: '今日あったこと', date: '2024-01-15' })
    expect(mockCreate).toHaveBeenCalledWith({
      content: '今日あったこと',
      date: '2024-01-15T00:00:00.000Z',
    })
  })
})
