import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicList from '../TopicList.vue'
import type { Topic } from '#shared/types/domain'

const mockItems: Topic[] = [
  { id: '1', content: 'トピック1', created_at: '2024-01-02T00:00:00Z' },
  { id: '2', content: 'トピック2', created_at: '2024-01-01T00:00:00Z' },
]

describe('TopicList', () => {
  it('shows empty state when items array is empty', () => {
    const wrapper = mount(TopicList, { props: { items: [] } })
    expect(wrapper.text()).toContain('まだ記録がありません')
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
})
