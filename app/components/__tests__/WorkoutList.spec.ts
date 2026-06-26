import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutList from '../WorkoutList.vue'
import type { WorkoutRecord } from '#shared/types/domain'

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
    const wrapper = mount(WorkoutList, { props: { items: [] } })
    expect(wrapper.text()).toContain('まだ記録がありません')
  })

  it('does not show empty state when items exist', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders the correct number of cards', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems } })
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('renders menu name for each item', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems } })
    expect(wrapper.text()).toContain('ベンチプレス')
    expect(wrapper.text()).toContain('懸垂')
  })

  it('renders intensity and reps in correct format', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems } })
    expect(wrapper.text()).toContain('60kg × 10回')
    expect(wrapper.text()).toContain('0kg × 8回')
  })

  it('renders category badge with Japanese label', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems } })
    expect(wrapper.text()).toContain('胸')
    expect(wrapper.text()).toContain('背中')
  })

  it('renders a copy button for each item', () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems, sortOrder: 'desc' } })
    expect(wrapper.findAll('.copy-btn')).toHaveLength(2)
  })

  it('emits copy event with the correct record when copy button is clicked', async () => {
    const wrapper = mount(WorkoutList, { props: { items: mockItems, sortOrder: 'desc' } })
    await wrapper.findAll('.copy-btn')[0].trigger('click')
    const emitted = wrapper.emitted('copy')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(mockItems[0])
  })
})
