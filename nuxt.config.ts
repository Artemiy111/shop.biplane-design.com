// https://nuxt.com/docs/api/configuration/nuxt-config
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

  ],
  devtools: { enabled: true },
  app: { head: { htmlAttrs: { lang: 'ru' } } },
  css: ['./app/src/shared/assets/main.css'],

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
  build: {
    transpile: ['trpc-nuxt'],
  },

  future: {
    compatibilityVersion: 4,
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
})
