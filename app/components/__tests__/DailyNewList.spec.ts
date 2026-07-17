import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyNewList from '../DailyNewList.vue'
import type { DailyNew } from '#shared/types/domain'

const mockItems: DailyNew[] = [
  { id: '1', title: 'First', content: 'Content 1', created_at: '2024-01-02T00:00:00Z' },
  { id: '2', title: 'Second', content: 'Content 2', created_at: '2024-01-01T00:00:00Z' },
]

describe('DailyNewList', () => {
  it('shows empty state when items array is empty', () => {
    const wrapper = mount(DailyNewList, { props: { items: [] } })
    expect(wrapper.text()).toContain('まだ記録がありません')
  })

  it('does not show empty state when items exist', () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders the correct number of cards', () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('renders title and content for each item', () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Content 1')
    expect(wrapper.text()).toContain('Second')
    expect(wrapper.text()).toContain('Content 2')
  })

  it('switches to edit mode with prefilled values when edit button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    const input = wrapper.find('.edit-input')
    const textarea = wrapper.find('.edit-textarea')
    expect(input.exists()).toBe(true)
    expect(textarea.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('First')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Content 1')
  })

  it('returns to view mode without emitting update when cancel button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.edit-btn')[0].trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')

    expect(wrapper.find('.edit-input').exists()).toBe(false)
    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('emits update with id and trimmed values when save button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.edit-btn')[0].trigger('click')
    await wrapper.find('.edit-input').setValue('  新しいタイトル  ')
    await wrapper.find('.edit-textarea').setValue('  新しい内容  ')
    await wrapper.find('.save-btn').trigger('click')

    const emitted = wrapper.emitted('update')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['1', '新しいタイトル', '新しい内容'])
    expect(wrapper.find('.edit-input').exists()).toBe(false)
  })

  it('shows inline confirmation without emitting remove on first delete click', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.text()).toContain('削除しますか？')
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(true)
    expect(wrapper.find('.cancel-btn').exists()).toBe(true)
  })

  it('emits remove with the item id when confirm button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['2'])
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
  })

  it('returns to view mode without emitting remove when cancel button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.findAll('.delete-btn')).toHaveLength(2)
  })

  it('resets delete confirmation when edit is started on another item', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('moves delete confirmation to the other item when its delete button is clicked', async () => {
    const wrapper = mount(DailyNewList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.delete-btn').trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['1'])
  })
})
