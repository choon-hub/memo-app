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

  it('shows inline confirmation without emitting remove on first delete click', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.text()).toContain('削除しますか？')
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(true)
    expect(wrapper.find('.cancel-btn').exists()).toBe(true)
  })

  it('emits remove with the item id when confirm button is clicked', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['2'])
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
  })

  it('returns to view mode without emitting remove when cancel button is clicked', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.findAll('.delete-btn')).toHaveLength(2)
  })

  it('resets delete confirmation when edit is started on another item', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('moves delete confirmation to the other item when its delete button is clicked', async () => {
    const wrapper = mount(TopicList, { props: { items: mockItems } })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.delete-btn').trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['1'])
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

  it('emits filterPerson with the clicked person name', async () => {
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
    await tags[1].trigger('click')
    expect(wrapper.emitted('filterPerson')).toEqual([['鈴木']])
  })

  it('adds the active class to the tag matching activePerson', () => {
    const itemsWithPersons: Topic[] = [
      {
        id: '1',
        content: 'トピック1',
        persons: ['田中', '鈴木'],
        created_at: '2024-01-02T00:00:00Z',
      },
    ]
    const wrapper = mount(TopicList, {
      props: { items: itemsWithPersons, activePerson: '田中' },
    })
    const tags = wrapper.findAll('.person-tag')
    expect(tags[0].classes()).toContain('active')
    expect(tags[1].classes()).not.toContain('active')
  })

  it('populates PersonTagInput with the item persons when editing starts', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    expect(wrapper.find('.person-tag-input .tag').text()).toContain('田中')
  })

  it('emits update with edited content, persons and created_at when save is clicked', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    await wrapper.find('.tag-text-input').setValue('鈴木')
    await wrapper.find('.tag-text-input').trigger('keydown.enter')
    await wrapper.find('.edit-textarea').setValue('更新後の内容')
    await wrapper.find('.save-btn').trigger('click')
    expect(wrapper.emitted('update')).toEqual([
      ['1', '更新後の内容', ['田中', '鈴木'], '2024-01-02T00:00:00.000Z'],
    ])
  })

  it('populates the date input with the item created_at when editing starts', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    expect((wrapper.find('.edit-date-input').element as HTMLInputElement).value).toBe('2024-01-02')
  })

  it('emits update with the edited created_at when the date input is changed', async () => {
    const itemsWithPersons: Topic[] = [
      { id: '1', content: 'トピック1', persons: ['田中'], created_at: '2024-01-02T00:00:00Z' },
    ]
    const wrapper = mount(TopicList, { props: { items: itemsWithPersons } })
    await wrapper.find('.edit-btn').trigger('click')
    await wrapper.find('.edit-date-input').setValue('2024-03-15')
    await wrapper.find('.save-btn').trigger('click')
    expect(wrapper.emitted('update')).toEqual([
      ['1', 'トピック1', ['田中'], '2024-03-15T00:00:00.000Z'],
    ])
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
