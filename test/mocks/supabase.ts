import { vi } from 'vitest'

export const mockQueryChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  then: vi
    .fn()
    .mockImplementation((resolve: (v: unknown) => unknown) =>
      Promise.resolve(resolve({ data: [], error: null })),
    ),
}

export const mockSupabaseClient = {
  from: vi.fn().mockReturnValue(mockQueryChain),
} as unknown as import('@supabase/supabase-js').SupabaseClient

export const mockCreateClient = vi.fn(() => mockSupabaseClient)

export function resetMocks() {
  mockQueryChain.select.mockReset().mockReturnThis()
  mockQueryChain.insert.mockReset().mockReturnThis()
  mockQueryChain.update.mockReset().mockReturnThis()
  mockQueryChain.delete.mockReset().mockReturnThis()
  mockQueryChain.order.mockReset().mockReturnThis()
  mockQueryChain.eq.mockReset().mockReturnThis()
  mockQueryChain.single.mockReset().mockReturnThis()
  mockQueryChain.maybeSingle.mockReset().mockReturnThis()
  mockQueryChain.then.mockReset().mockImplementation((resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolve({ data: [], error: null })),
  )
  ;(mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReset().mockReturnValue(mockQueryChain)
  mockCreateClient.mockReset().mockImplementation(() => mockSupabaseClient)
}
