import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TopicsPage from '../index.vue'

const mockFetchList = vi.fn()
const mockCreate = vi.fn()
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
  })),
}))

describe('topics page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems.value = []
    mockLoading.value = false
    mockError.value = null
  })

  it('calls fetchList on mount', () => {
    mount(TopicsPage)
    expect(mockFetchList).toHaveBeenCalledOnce()
  })

  it('shows error message when error is set', () => {
    mockError.value = 'データの取得に失敗しました'
    const wrapper = mount(TopicsPage)
    expect(wrapper.text()).toContain('データの取得に失敗しました')
  })

  it('renders TopicList with items from composable', () => {
    mockItems.value = [{ id: '1', content: 'トピック', created_at: '2024-01-01T00:00:00Z' }]
    const wrapper = mount(TopicsPage)
    expect(wrapper.text()).toContain('トピック')
  })

  it('calls create with ISO timestamp when form submits', async () => {
    const wrapper = mount(TopicsPage)
    const form = wrapper.findComponent({ name: 'TopicForm' })
    await form.vm.$emit('submit', { content: '今日あったこと', date: '2024-01-15' })
    expect(mockCreate).toHaveBeenCalledWith({
      content: '今日あったこと',
      date: '2024-01-15T00:00:00.000Z',
    })
  })
})
