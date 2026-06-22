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
})
