<script setup lang="ts">
import { CatalogPage } from '~/src/pages/catalog'

const categorySlug = computed(() => useRoute('catalog-c-slug').params.slug)
</script>

<template>
  <CatalogPage :category-slug="categorySlug" />
</template>
