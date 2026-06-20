import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  srcDir: 'app/',
  typescript: {
    strict: true,
  },
  alias: {
    '#shared': resolve('./shared'),
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseKey: process.env.SUPABASE_KEY ?? '',
    },
  },
})
