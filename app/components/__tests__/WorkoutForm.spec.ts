import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutForm from '../WorkoutForm.vue'

describe('WorkoutForm', () => {
  it('has submit button disabled when menu, intensity and reps are empty', () => {
    const wrapper = mount(WorkoutForm)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when only menu is filled', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when all workout fields are valid but date is explicitly cleared', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('10')
    await wrapper.find('input[type="date"]').setValue('')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when reps is 0', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('0')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('has submit button disabled when reps is negative', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('-1')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('enables submit button when all fields are valid', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('10')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('emits submit event with correct payload on form submission', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('  ベンチプレス  ')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('10')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual({
      menu: 'ベンチプレス',
      intensity: 60,
      reps: 10,
      date: '2024-01-15',
    })
  })

  it('clears fields after submit', async () => {
    const wrapper = mount(WorkoutForm)
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('10')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('form').trigger('submit')
    expect((wrapper.find('#wo-menu').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#wo-intensity').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#wo-reps').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('input[type="date"]').element as HTMLInputElement).value).toBe(
      new Date().toLocaleDateString('en-CA'),
    )
  })

  it('disables submit button when loading prop is true even if all fields are filled', async () => {
    const wrapper = mount(WorkoutForm, { props: { loading: true } })
    await wrapper.find('#wo-menu').setValue('ベンチプレス')
    await wrapper.find('#wo-intensity').setValue('60')
    await wrapper.find('#wo-reps').setValue('10')
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('renders candidate chips when menuCandidates prop is provided', () => {
    const wrapper = mount(WorkoutForm, {
      props: { menuCandidates: ['ベンチプレス', 'ダンベルフライ'] },
    })
    const chips = wrapper.findAll('button[type="button"]')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toBe('ベンチプレス')
    expect(chips[1].text()).toBe('ダンベルフライ')
  })

  it('does not render candidates area when menuCandidates is empty', () => {
    const wrapper = mount(WorkoutForm, { props: { menuCandidates: [] } })
    expect(wrapper.find('.candidates').exists()).toBe(false)
  })

  it('fills menu field when a candidate chip is clicked', async () => {
    const wrapper = mount(WorkoutForm, {
      props: { menuCandidates: ['ベンチプレス', 'ダンベルフライ'] },
    })
    await wrapper.findAll('button[type="button"]')[0].trigger('click')
    expect((wrapper.find('#wo-menu').element as HTMLInputElement).value).toBe('ベンチプレス')
  })
})
