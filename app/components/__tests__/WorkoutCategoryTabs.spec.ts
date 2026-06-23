import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutCategoryTabs from '../WorkoutCategoryTabs.vue'

describe('WorkoutCategoryTabs', () => {
  it('renders three tabs', () => {
    const wrapper = mount(WorkoutCategoryTabs, { props: { modelValue: 'chest' } })
    expect(wrapper.findAll('button')).toHaveLength(3)
  })

  it('marks the active tab with active class', () => {
    const wrapper = mount(WorkoutCategoryTabs, { props: { modelValue: 'back' } })
    const buttons = wrapper.findAll('button')
    expect(buttons[1].classes()).toContain('active')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[2].classes()).not.toContain('active')
  })

  it('emits update:modelValue with "chest" when first tab is clicked', async () => {
    const wrapper = mount(WorkoutCategoryTabs, { props: { modelValue: 'back' } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('chest')
  })

  it('emits update:modelValue with "back" when second tab is clicked', async () => {
    const wrapper = mount(WorkoutCategoryTabs, { props: { modelValue: 'chest' } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('back')
  })

  it('emits update:modelValue with "legs" when third tab is clicked', async () => {
    const wrapper = mount(WorkoutCategoryTabs, { props: { modelValue: 'chest' } })
    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('legs')
  })
})
