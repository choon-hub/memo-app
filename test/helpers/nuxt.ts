import { vi } from 'vitest'

export async function createAsyncDataMock() {
  const { ref } = await import('vue')
  return {
    useAsyncData: vi.fn(async (_key: unknown, fn?: () => unknown) => {
      const result = typeof fn === 'function' ? await fn() : null
      return { data: ref(result ?? null), pending: ref(false), refresh: vi.fn(), execute: vi.fn() }
    }),
    useLazyAsyncData: vi.fn(),
    useNuxtData: vi.fn(() => ({ data: ref(null) })),
    refreshNuxtData: vi.fn(),
    clearNuxtData: vi.fn(),
    createUseAsyncData: vi.fn(),
  }
}
