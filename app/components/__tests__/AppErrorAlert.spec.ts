import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppErrorAlert from '../AppErrorAlert.vue'

describe('AppErrorAlert', () => {
  it('renders the message prop', () => {
    const wrapper = mount(AppErrorAlert, { props: { message: 'エラーが発生しました' } })
    expect(wrapper.text()).toContain('エラーが発生しました')
  })

  it('has role="alert" on its root element', () => {
    const wrapper = mount(AppErrorAlert, { props: { message: 'エラー' } })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('emits retry when the retry button is clicked', async () => {
    const wrapper = mount(AppErrorAlert, { props: { message: 'エラー' } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('hides the alert and emits close when the close button is clicked', async () => {
    const wrapper = mount(AppErrorAlert, { props: { message: 'エラー' } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
