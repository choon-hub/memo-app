import { vi } from 'vitest'

export async function createAsyncDataMock() {
  const { ref } = await import('vue')
  return {
    useAsyncData: vi.fn(async (_key: unknown, fn?: () => unknown) => {
      if (typeof fn === 'function') await fn()
      return { data: ref(null), pending: ref(false), refresh: vi.fn(), execute: vi.fn() }
    }),
    useLazyAsyncData: vi.fn(),
    useNuxtData: vi.fn(() => ({ data: ref(null) })),
    refreshNuxtData: vi.fn(),
    clearNuxtData: vi.fn(),
    createUseAsyncData: vi.fn(),
  }
}
