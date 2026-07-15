import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicForm from '../TopicForm.vue'

describe('TopicForm', () => {
  it('has submit button disabled when content is empty', () => {
    const wrapper = mount(TopicForm)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when content is filled but date is explicitly cleared', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('input[type="date"]').setValue('')
    await wrapper.find('textarea').setValue('今日あったこと')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when only date is filled', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('enables submit button when both content and date are filled', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('textarea').setValue('今日あったこと')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('emits submit event with trimmed content on form submission', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('textarea').setValue('  今日あったこと  ')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual({ content: '今日あったこと', date: '2024-01-15' })
  })

  it('emits submit event preserving internal line breaks in content', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('textarea').setValue('  1行目\n2行目  ')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual({ content: '1行目\n2行目', date: '2024-01-15' })
  })

  it('clears fields after submit', async () => {
    const wrapper = mount(TopicForm)
    await wrapper.find('textarea').setValue('今日あったこと')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('input[type="date"]').element as HTMLInputElement).value).toBe(
      new Date().toLocaleDateString('en-CA'),
    )
  })

  it('disables submit button when loading prop is true even if all fields are filled', async () => {
    const wrapper = mount(TopicForm, { props: { loading: true } })
    await wrapper.find('textarea').setValue('今日あったこと')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
