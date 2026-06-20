import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export const createSupabaseClient = (url: string, key: string): SupabaseClient => {
  if (!url || !key) {
    throw new Error(
      'Supabase environment variables (SUPABASE_URL, SUPABASE_KEY) are not configured.',
    )
  }
  return createClient(url, key)
}

export const useSupabase = (): SupabaseClient => {
  const config = useRuntimeConfig()
  return useState<SupabaseClient>('supabase-client', () =>
    createSupabaseClient(config.public.supabaseUrl, config.public.supabaseKey),
  ).value
}
