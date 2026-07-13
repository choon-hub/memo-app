import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonList from '../SkeletonList.vue'

describe('SkeletonList', () => {
  it('renders 3 rows by default', () => {
    const wrapper = mount(SkeletonList)
    expect(wrapper.findAll('.skeleton-row')).toHaveLength(3)
  })

  it('renders the number of rows given by the rows prop', () => {
    const wrapper = mount(SkeletonList, { props: { rows: 5 } })
    expect(wrapper.findAll('.skeleton-row')).toHaveLength(5)
  })

  it('is hidden from assistive technology', () => {
    const wrapper = mount(SkeletonList)
    expect(wrapper.find('.skeleton-list').attributes('aria-hidden')).toBe('true')
  })
})
