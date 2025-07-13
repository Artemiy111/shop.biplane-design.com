<script setup lang="ts">
import { ProductPage } from '~/src/pages/product'

const route = useRoute('sets-slug')
const slug = computed(() => route.params.slug)
</script>

<template>
  <ProductPage
    :is-model="false"
    is-set
    :slug="slug"
  />
</template>
