import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PersonTagInput from '../PersonTagInput.vue'

describe('PersonTagInput', () => {
  it('renders a chip for each name in modelValue', () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: ['田中', '佐藤'] } })
    const chips = wrapper.findAll('.tag')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toContain('田中')
    expect(chips[1].text()).toContain('佐藤')
  })

  it('renders no chips when modelValue is empty', () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: [] } })
    expect(wrapper.findAll('.tag')).toHaveLength(0)
  })

  it('emits update:modelValue with the added name on Enter', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: ['田中'] } })
    await wrapper.find('input').setValue('佐藤')
    await wrapper.find('input').trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['田中', '佐藤'])
  })

  it('trims whitespace from the input before adding', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: [] } })
    await wrapper.find('input').setValue('  佐藤  ')
    await wrapper.find('input').trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['佐藤'])
  })

  it('clears the input after a name is added', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: [] } })
    await wrapper.find('input').setValue('佐藤')
    await wrapper.find('input').trigger('keydown.enter')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('does not emit when input is empty or whitespace only', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: [] } })
    await wrapper.find('input').trigger('keydown.enter')
    await wrapper.find('input').setValue('   ')
    await wrapper.find('input').trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not emit when the name already exists', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: ['田中'] } })
    await wrapper.find('input').setValue('田中')
    await wrapper.find('input').trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not add while IME composition is in progress', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: [] } })
    await wrapper.find('input').setValue('たなか')
    await wrapper.find('input').trigger('keydown.enter', { isComposing: true })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits update:modelValue without the removed name when × is clicked', async () => {
    const wrapper = mount(PersonTagInput, { props: { modelValue: ['田中', '佐藤'] } })
    await wrapper.findAll('.remove-btn')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['佐藤'])
  })
})
