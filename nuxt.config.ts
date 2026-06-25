import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  srcDir: 'app/',
  css: ['~/assets/global.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  typescript: {
    strict: true,
  },
  alias: {
    '#shared': resolve('./shared'),
  },
  routeRules: {
    '/': { redirect: '/one-new' },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseKey: process.env.SUPABASE_KEY ?? '',
    },
  },
})
