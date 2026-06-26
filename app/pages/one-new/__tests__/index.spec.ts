import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import OneNewPage from '../index.vue'

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
const mockItems = ref<{ id: string; title: string; content: string; created_at: string }[]>([])
const mockLoading = ref(false)
const mockError = ref<string | null>(null)

vi.mock('~/composables/useDailyNew', () => ({
  useDailyNew: vi.fn(() => ({
    items: mockItems,
    loading: mockLoading,
    error: mockError,
    fetchList: mockFetchList,
    create: mockCreate,
  })),
}))

async function mountPage() {
  const wrapper = mount(
    defineComponent({ render: () => h(Suspense, null, { default: () => h(OneNewPage) }) }),
  )
  await flushPromises()
  return wrapper
}

describe('one-new page', () => {
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

  it('renders DailyNewList with items from composable', async () => {
    mockItems.value = [
      { id: '1', title: 'テスト', content: '内容', created_at: '2024-01-01T00:00:00Z' },
    ]
    const wrapper = await mountPage()
    expect(wrapper.text()).toContain('テスト')
  })

  it('calls create with ISO timestamp when form submits', async () => {
    const wrapper = await mountPage()
    const form = wrapper.findComponent({ name: 'DailyNewForm' })
    await form.vm.$emit('submit', { title: 'タイトル', content: '内容', date: '2024-01-15' })
    expect(mockCreate).toHaveBeenCalledWith({
      title: 'タイトル',
      content: '内容',
      date: '2024-01-15T00:00:00.000Z',
    })
  })
})
