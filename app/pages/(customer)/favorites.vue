<script setup lang="ts">
import { FavoritesPage } from '~/src/pages/customer/favorites'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <FavoritesPage />
</template>
