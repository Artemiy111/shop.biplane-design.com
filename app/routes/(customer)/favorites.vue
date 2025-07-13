<script setup lang="ts">
import { FavoritesPage } from '~/pages/customer/favorites'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <FavoritesPage />
</template>
