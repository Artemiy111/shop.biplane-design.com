<script setup lang="ts">
import { CatalogPage } from '~pages/catalog'

const brandSlug = computed(() => useRoute('catalog-b-slug').params.slug)
</script>

<template>
  <CatalogPage :brand-slug="brandSlug" />
</template>
