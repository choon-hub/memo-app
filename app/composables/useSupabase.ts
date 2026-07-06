import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'

export const createSupabaseClient = (url: string, key: string): SupabaseClient<Database> => {
  if (!url || !key) {
    throw new Error(
      'Supabase environment variables (SUPABASE_URL, SUPABASE_KEY) are not configured.',
    )
  }
  return createClient<Database>(url, key)
}

// SupabaseClient は Nuxt payload にシリアライズできないため useState ではなく
// モジュールスコープのシングルトンで保持する
let client: SupabaseClient<Database> | null = null

export const useSupabase = (): SupabaseClient<Database> => {
  if (!client) {
    const config = useRuntimeConfig()
    client = createSupabaseClient(config.public.supabaseUrl, config.public.supabaseKey)
  }
  return client
}
