import { vi } from 'vitest'

export type MockQueryResult = {
  data: unknown
  error: { message: string } | null
}

/**
 * await されるたびに先頭から 1 件ずつ消費される結果キュー。
 * 空のときは従来どおり `{ data: [], error: null }` を返すため、
 * `then` を直接 mockImplementation で上書きする既存テストとも共存できる。
 */
const queuedResults: MockQueryResult[] = []

export function queueResult(result: MockQueryResult) {
  queuedResults.push(result)
}

function resolveNextResult(resolve: (v: unknown) => unknown) {
  const result = queuedResults.shift() ?? { data: [], error: null }
  return Promise.resolve(resolve(result))
}

export const mockQueryChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  then: vi.fn().mockImplementation(resolveNextResult),
}

export const mockSupabaseClient = {
  from: vi.fn().mockReturnValue(mockQueryChain),
} as unknown as import('@supabase/supabase-js').SupabaseClient

export const mockCreateClient = vi.fn(() => mockSupabaseClient)

export function resetMocks() {
  queuedResults.length = 0
  mockQueryChain.select.mockReset().mockReturnThis()
  mockQueryChain.insert.mockReset().mockReturnThis()
  mockQueryChain.update.mockReset().mockReturnThis()
  mockQueryChain.delete.mockReset().mockReturnThis()
  mockQueryChain.order.mockReset().mockReturnThis()
  mockQueryChain.eq.mockReset().mockReturnThis()
  mockQueryChain.single.mockReset().mockReturnThis()
  mockQueryChain.maybeSingle.mockReset().mockReturnThis()
  mockQueryChain.then.mockReset().mockImplementation(resolveNextResult)
  ;(mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReset().mockReturnValue(mockQueryChain)
  mockCreateClient.mockReset().mockImplementation(() => mockSupabaseClient)
}
