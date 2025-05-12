<script setup lang="ts">
import { ProductPage } from '~/src/pages/product'

const route = useRoute('models-slug')
const slug = computed(() => route.params.slug)

definePageMeta({
  middleware: ['admin'],
})
</script>

<template>
  <ProductPage
    :is-model="true"
    :is-set="false"
    :slug="slug"
  />
</template>
