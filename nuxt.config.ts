import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  srcDir: 'app/',
  css: ['~/assets/global.css'],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:image', content: '/images/memo-icon.png' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:image', content: '/images/memo-icon.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/memo-icon.png' },
        { rel: 'apple-touch-icon', href: '/images/memo-icon.png' },
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
