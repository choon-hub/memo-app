import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockCreateClient, mockSupabaseClient } from '../../../test/mocks/supabase'
import { createSupabaseClient } from '../useSupabase'

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('createSupabaseClient', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates and returns a Supabase client when env vars are set', () => {
    const client = createSupabaseClient('https://test.supabase.co', 'test-anon-key')

    expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key')
    expect(client).toBe(mockSupabaseClient)
  })

  it('throws an error when SUPABASE_URL is missing', () => {
    expect(() => createSupabaseClient('', 'test-anon-key')).toThrow('SUPABASE_URL')
  })

  it('throws an error when SUPABASE_KEY is missing', () => {
    expect(() => createSupabaseClient('https://test.supabase.co', '')).toThrow('SUPABASE_KEY')
  })
})
