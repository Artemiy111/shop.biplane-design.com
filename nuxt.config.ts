// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@pinia/colada-nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@tresjs/nuxt',
  ],

  components: {
    dirs: [],
  },

  // imports: {
  //   scan: false,
  // },

  devtools: { enabled: true },
  app: { head: { htmlAttrs: { lang: 'ru' } } },
  css: ['./app/shared/assets/main.css'],

  colorMode: {
    storage: 'cookie',
  },

  runtimeConfig: {
    public: {
      s3Region: process.env.S3_REGION,
      s3Bucket: process.env.S3_BUCKET,
      s3BucketEndpointUrl: process.env.S3_BUCKET_ENDPOINT_URL,
    },
  },

  dir: {
    pages: '_routes',
    middleware: '_middleware',
  },

  alias: {
    // '~app': fileURLToPath(new URL('./app/app', import.meta.url)),
    // '~layouts': fileURLToPath(new URL('./app/layouts', import.meta.url)),
    // '~pages': fileURLToPath(new URL('./app/pages', import.meta.url)),
    // '~widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
    // '~features': fileURLToPath(new URL('./app/features', import.meta.url)),
    // '~entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
    // '~shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
    '~server': fileURLToPath(new URL('./server', import.meta.url)),
  },
  build: {
    transpile: ['trpc-nuxt'],
  },

  experimental: {
    typedPages: true,
    crossOriginPrefetch: true,
    // asyncContext: true,
  },

  compatibilityDate: '2024-11-01',

  telemetry: { enabled: false },

  eslint: {
    config: {
      nuxt: {
        sortConfigKeys: true,
      },
      stylistic: {
        semi: false,
      },
    },
  },

  tres: {
    devtools: true,
  },
})
