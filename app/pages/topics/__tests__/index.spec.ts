import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import TopicsPage from '../index.vue'
import { useAsyncData } from '#app/composables/asyncData'

vi.mock('#app/composables/asyncData', async () => {
  const { createAsyncDataMock } = await import('../../../../test/helpers/nuxt')
  return createAsyncDataMock()
})

const mockFetchList = vi.fn()
const mockCreate = vi.fn()
const mockCreateMany = vi.fn()
const mockUpdate = vi.fn()
const mockItems = ref<{ id: string; content: string; persons: string[]; created_at: string }[]>([])
const mockLoading = ref(false)
const mockError = ref<string | null>(null)

vi.mock('~/composables/useTopics', () => ({
  useTopics: vi.fn(() => ({
    items: mockItems,
    loading: mockLoading,
    error: mockError,
    fetchList: mockFetchList,
    create: mockCreate,
    createMany: mockCreateMany,
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

  it('calls fetchList again when AppErrorAlert emits retry', async () => {
    mockError.value = 'データの取得に失敗しました'
    const wrapper = await mountPage()
    mockFetchList.mockClear()
    const errorAlert = wrapper.findComponent({ name: 'AppErrorAlert' })
    await errorAlert.vm.$emit('retry')
    expect(mockFetchList).toHaveBeenCalledOnce()
  })

  it('renders TopicList with items from composable', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック', persons: [], created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('トピック')
  })

  it('renders items restored from payload when useAsyncData does not re-invoke fetchList', async () => {
    const payloadItems = [
      { id: '1', content: 'Payload topic', persons: [], created_at: '2024-01-01T00:00:00Z' },
    ]
    vi.mocked(useAsyncData).mockResolvedValueOnce({
      data: ref(payloadItems),
      pending: ref(false),
      refresh: vi.fn(),
      execute: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof useAsyncData>>)

    const wrapper = await mountPage()

    expect(mockFetchList).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Payload topic')
  })

  it('renders SkeletonList instead of TopicList while loading with no items', async () => {
    mockLoading.value = true
    const wrapper = await mountPage()
    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TopicList' }).exists()).toBe(false)
  })

  it('keeps TopicList mounted while loading with existing items', async () => {
    mockLoading.value = true
    mockItems.value = [
      { id: '1', content: 'トピック', persons: [], created_at: '2024-01-01T00:00:00Z' },
    ]
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

  it('calls createMany and refreshes the list when CsvImportSection emits import', async () => {
    const wrapper = await mountPage()
    const csvImportSection = wrapper.findComponent({ name: 'CsvImportSection' })
    await csvImportSection.vm.$emit('import', [
      { content: 'CSVトピック', persons: [], created_at: '2024-01-15T00:00:00.000Z' },
    ])
    expect(mockCreateMany).toHaveBeenCalledWith([
      { content: 'CSVトピック', date: '2024-01-15T00:00:00.000Z' },
    ])
  })

  it('calls update with content and persons when TopicList emits update', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック', persons: [], created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    const topicList = wrapper.findComponent({ name: 'TopicList' })
    await topicList.vm.$emit('update', '1', '更新後の内容', ['田中'])
    expect(mockUpdate).toHaveBeenCalledWith('1', { content: '更新後の内容', persons: ['田中'] })
  })

  it('narrows TopicList items to the selected person when TopicList emits filterPerson', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
      { id: '2', content: 'トピック2', persons: ['鈴木'], created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    const topicList = wrapper.findComponent({ name: 'TopicList' })
    await topicList.vm.$emit('filter-person', '田中')
    const filtered = wrapper.findComponent({ name: 'TopicList' }).props('items')
    expect(filtered).toEqual([mockItems.value[0]])
  })

  it('shows a filter indicator with the selected person name', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    const topicList = wrapper.findComponent({ name: 'TopicList' })
    await topicList.vm.$emit('filter-person', '田中')
    expect(wrapper.find('.filter-indicator').text()).toContain('田中')
  })

  it('does not show a filter indicator when no person is selected', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    expect(wrapper.find('.filter-indicator').exists()).toBe(false)
  })

  it('clears the filter when TopicList emits filterPerson with the same person again', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
      { id: '2', content: 'トピック2', persons: ['鈴木'], created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    const topicList = wrapper.findComponent({ name: 'TopicList' })
    await topicList.vm.$emit('filter-person', '田中')
    await topicList.vm.$emit('filter-person', '田中')
    expect(wrapper.find('.filter-indicator').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicList' }).props('items')).toEqual(mockItems.value)
  })

  it('clears the filter when the clear button is clicked', async () => {
    mockItems.value = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
      { id: '2', content: 'トピック2', persons: ['鈴木'], created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    const topicList = wrapper.findComponent({ name: 'TopicList' })
    await topicList.vm.$emit('filter-person', '田中')
    await wrapper.find('.filter-clear-btn').trigger('click')
    expect(wrapper.find('.filter-indicator').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicList' }).props('items')).toEqual(mockItems.value)
  })
})
