<script setup lang="ts">
import ModelsPage from '~/src/pages/admin/models/models-page.vue'

definePageMeta({
  middleware: ['admin'],
})
</script>

<template>
  <ModelsPage />
</template>
