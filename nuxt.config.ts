// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/scripts',
  ],
  devtools: { enabled: true },

  css: ['./app/src/shared/assets/main.css'],

  build: {
    transpile: ['trpc-nuxt'],
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  eslint: {
    config: {
      stylistic: {
        semi: false,
      },
    },
  },
})
