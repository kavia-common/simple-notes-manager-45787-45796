export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    '~/assets/css/theme.css',
  ],
  app: {
    head: {
      title: 'Notes • Ocean Professional',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#2563EB' },
        { name: 'description', content: 'A modern notes manager built with Nuxt 3' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // PUBLIC_INTERFACE
      /** apiBase for future backend integration; uses NUXT_PUBLIC_API_BASE. If empty, app falls back to localStorage. */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
  },
  vite: {
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      port: 3000,
    },
  },
});
