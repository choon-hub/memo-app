import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyNewForm from '../DailyNewForm.vue'

describe('DailyNewForm', () => {
  it('has submit button disabled when all fields are empty', () => {
    const wrapper = mount(DailyNewForm)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when only title is filled', async () => {
    const wrapper = mount(DailyNewForm)
    await wrapper.find('input[type="text"]').setValue('タイトル')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when title and content are filled but date is missing', async () => {
    const wrapper = mount(DailyNewForm)
    await wrapper.find('input[type="text"]').setValue('タイトル')
    await wrapper.find('textarea').setValue('内容です')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('enables submit button when all fields are filled', async () => {
    const wrapper = mount(DailyNewForm)
    await wrapper.find('input[type="text"]').setValue('タイトル')
    await wrapper.find('textarea').setValue('内容です')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('emits submit event with trimmed values on form submission', async () => {
    const wrapper = mount(DailyNewForm)
    await wrapper.find('input[type="text"]').setValue('  タイトル  ')
    await wrapper.find('textarea').setValue('  内容です  ')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual({ title: 'タイトル', content: '内容です', date: '2024-01-15' })
  })

  it('clears fields after submit', async () => {
    const wrapper = mount(DailyNewForm)
    await wrapper.find('input[type="text"]').setValue('タイトル')
    await wrapper.find('textarea').setValue('内容です')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('input[type="date"]').element as HTMLInputElement).value).toBe('')
  })

  it('disables submit button when loading prop is true even if all fields are filled', async () => {
    const wrapper = mount(DailyNewForm, { props: { loading: true } })
    await wrapper.find('input[type="text"]').setValue('タイトル')
    await wrapper.find('textarea').setValue('内容です')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
