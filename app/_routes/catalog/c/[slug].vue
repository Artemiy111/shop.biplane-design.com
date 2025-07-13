<script setup lang="ts">
import { CatalogPage } from '~/pages/catalog'

const categorySlug = computed(() => useRoute('catalog-c-slug').params.slug)
</script>

<template>
  <CatalogPage :category-slug="categorySlug" />
</template>
