import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutList from '../WorkoutList.vue'
import type { WorkoutRecord } from '#shared/types/domain'
import { toDateInputValue } from '~/utils/date'

const mockItems: WorkoutRecord[] = [
  {
    id: '1',
    category: 'chest',
    menu: 'ベンチプレス',
    intensity: 60,
    reps: 10,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '2',
    category: 'back',
    menu: '懸垂',
    intensity: 0,
    reps: 8,
    created_at: '2024-01-01T00:00:00Z',
  },
]

describe('WorkoutList', () => {
  it('shows empty state when items array is empty', () => {
    const wrapper = mount(WorkoutList, { props: { items: [], sortOrder: 'desc', loading: false } })
    expect(wrapper.text()).toContain('まだ記録がありません')
  })

  it('does not show empty state when items exist', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders the correct number of cards', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('renders menu name for each item', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.text()).toContain('ベンチプレス')
    expect(wrapper.text()).toContain('懸垂')
  })

  it('renders intensity and reps in correct format', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.text()).toContain('60kg × 10回')
    expect(wrapper.text()).toContain('0kg × 8回')
  })

  it('renders category badge with Japanese label', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.text()).toContain('胸')
    expect(wrapper.text()).toContain('背中')
  })

  it('renders a copy button for each item', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.findAll('.copy-btn')).toHaveLength(2)
  })

  it('emits copy event with the correct record when copy button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.copy-btn')[0].trigger('click')
    const emitted = wrapper.emitted('copy')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(mockItems[0])
  })

  it('renders an edit button for each item', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.findAll('.edit-btn')).toHaveLength(2)
  })

  it('switches to edit mode with prefilled values when edit button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    const inputs = wrapper.findAll('.edit-input')
    expect((inputs[0].element as HTMLInputElement).value).toBe('ベンチプレス')
    expect((inputs[1].element as HTMLInputElement).value).toBe('60')
    expect((inputs[2].element as HTMLInputElement).value).toBe('10')
    expect((inputs[3].element as HTMLInputElement).value).toBe(
      toDateInputValue(mockItems[0].created_at),
    )
  })

  it('does not show a category selector in edit mode', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    expect(wrapper.find('select').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('胸')
  })

  it('returns to view mode without emitting update when cancel button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.edit-btn')[0].trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')

    expect(wrapper.find('.edit-input').exists()).toBe(false)
    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('emits update with id and edited values when save button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    const inputs = wrapper.findAll('.edit-input')
    await inputs[0].setValue('インクラインプレス')
    await inputs[1].setValue('65')
    await inputs[2].setValue('8')
    await inputs[3].setValue('2024-02-01')
    await wrapper.find('.save-btn').trigger('click')

    expect(wrapper.emitted('update')).toEqual([
      ['1', { menu: 'インクラインプレス', intensity: 65, reps: 8, date: '2024-02-01' }],
    ])
  })

  it('does not emit update when menu is blank', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    const inputs = wrapper.findAll('.edit-input')
    await inputs[0].setValue('   ')
    await wrapper.find('.save-btn').trigger('click')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('renders a delete button for each item', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.findAll('.delete-btn')).toHaveLength(2)
  })

  it('shows inline confirmation without emitting remove on first delete click', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.delete-btn')[1].trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.text()).toContain('削除しますか？')
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(true)
    expect(wrapper.find('.cancel-btn').exists()).toBe(true)
  })

  it('emits remove with the item id when confirm button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['2'])
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
  })

  it('returns to view mode without emitting remove when cancel button is clicked on delete confirmation', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.cancel-btn').trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.findAll('.delete-btn')).toHaveLength(2)
  })

  it('resets delete confirmation when edit is started on another item', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.findAll('.edit-btn')[0].trigger('click')

    expect(wrapper.find('.confirm-delete-btn').exists()).toBe(false)
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('moves delete confirmation to the other item when its delete button is clicked', async () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    await wrapper.findAll('.delete-btn')[1].trigger('click')
    await wrapper.find('.delete-btn').trigger('click')
    await wrapper.find('.confirm-delete-btn').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['1'])
  })

  it('shows the spinner overlay when loading is true', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: true },
    })
    expect(wrapper.find('.app-spinner-overlay').exists()).toBe(true)
  })

  it('does not show the spinner overlay when loading is false', () => {
    const wrapper = mount(WorkoutList, {
      props: { items: mockItems, sortOrder: 'desc', loading: false },
    })
    expect(wrapper.find('.app-spinner-overlay').exists()).toBe(false)
  })
})
