import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

const mockRoute = { path: '/' }

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute),
}))

describe('AppHeader', () => {
  let wrapper: ReturnType<typeof mount>

  describe('route to title mapping', () => {
    it('displays "1日1新" for /one-new', () => {
      mockRoute.path = '/one-new'
      wrapper = mount(AppHeader)
      expect(wrapper.find('.header-title').text()).toBe('1日1新')
    })

    it('displays "日々のトピック" for /topics', () => {
      mockRoute.path = '/topics'
      wrapper = mount(AppHeader)
      expect(wrapper.find('.header-title').text()).toBe('日々のトピック')
    })

    it('displays "筋トレ" for /workout', () => {
      mockRoute.path = '/workout'
      wrapper = mount(AppHeader)
      expect(wrapper.find('.header-title').text()).toBe('筋トレ')
    })

    it('displays empty string for unknown routes', () => {
      mockRoute.path = '/unknown'
      wrapper = mount(AppHeader)
      expect(wrapper.find('.header-title').text()).toBe('')
    })
  })

  it('renders a header element', () => {
    mockRoute.path = '/one-new'
    wrapper = mount(AppHeader)
    expect(wrapper.find('header.header').exists()).toBe(true)
  })
})
