import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNavigation from '../AppNavigation.vue'

const NuxtLinkStub = {
  template: '<a :href="to" :data-to="to" :data-active-class="exactActiveClass"><slot /></a>',
  props: ['to', 'exactActiveClass'],
}

describe('AppNavigation', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(AppNavigation, {
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
  })

  it('renders three navigation links', () => {
    expect(wrapper.findAll('a')).toHaveLength(3)
  })

  it('links to correct paths', () => {
    const links = wrapper.findAll('a')
    expect(links[0].attributes('data-to')).toBe('/one-new')
    expect(links[1].attributes('data-to')).toBe('/topics')
    expect(links[2].attributes('data-to')).toBe('/workout')
  })

  it('passes exact-active-class to all nav links', () => {
    wrapper.findAll('a').forEach((link) => {
      expect(link.attributes('data-active-class')).toBe('nav-item--active')
    })
  })
})
