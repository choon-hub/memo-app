import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicList from '../TopicList.vue'
import type { Topic } from '#shared/types/domain'

const mockItems: Topic[] = [
  { id: '1', content: 'トピック1', persons: [], created_at: '2024-01-02T00:00:00Z' },
  { id: '2', content: 'トピック2', persons: [], created_at: '2024-01-01T00:00:00Z' },
]

describe('TopicList', () => {
  it('shows empty state when items array is empty', () => {
    const wrapper = mount(TopicList, { props: { items: [] } })
    expect(wrapper.text()).toContain('まだ記録がありません')
  })

  it('shows the spinner overlay when loading is true', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems, loading: true } })
    expect(wrapper.find('.app-spinner-overlay').exists()).toBe(true)
  })

  it('does not show the spinner overlay when loading is false', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems, loading: false } })
    expect(wrapper.find('.app-spinner-overlay').exists()).toBe(false)
  })

  it('does not show empty state when items exist', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders the correct number of cards', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('renders content for each item', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    expect(wrapper.text()).toContain('トピック1')
    expect(wrapper.text()).toContain('トピック2')
  })

  it('renders multiline content with line breaks preserved', () => {
    const multilineItems: Topic[] = [
      { id: '1', content: '1行目\n2行目', persons: [], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: multilineItems } })
    expect(wrapper.find('.card-content').text()).toBe('1行目\n2行目')
  })

  it('emits remove with the item id when the delete button is clicked', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[0].trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['1']])
  })

  it('does not show person tags when persons is empty', () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    expect(wrapper.find('.person-tags').exists()).toBe(false)
  })

  it('shows persons as tags when persons is non-empty', () => {
    const itemsWithPersons: Topic[] = [
      {
        id: '1',
        content: 'トピック1',
        persons: ['田中', '鈴木'],
        created_at: '2024-01-02T00:00:00Z',
      },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    const tags = wrapper.findAll('.person-tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('田中')
    expect(tags[1].text()).toBe('鈴木')
  })

  it('populates PersonTagInput with the item persons when editing starts', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    expect(wrapper.find('.person-tag-input .tag').text()).toContain('田中')
  })

  it('emits update with edited content and persons when save is clicked', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    await wrapper.find('.tag-text-input').setValue('鈴木')
    await wrapper.find('.tag-text-input').trigger('keydown.enter')
    await wrapper.find('.edit-textarea').setValue('更新後の内容')
    await wrapper.find('.save-btn').trigger('click')
    expect(wrapper.emitted('update')).toEqual([['1', '更新後の内容', ['田中', '鈴木']]])
  })

  it('resets edit persons when cancel is clicked', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')
    await wrapper.find('.edit-btn').trigger('click')
    expect(wrapper.find('.person-tag-input .tag').text()).toContain('田中')
  })
})
