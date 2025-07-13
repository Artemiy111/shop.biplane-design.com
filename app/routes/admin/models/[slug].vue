<script setup lang="ts">
import { AdminModelPage } from '~pages/admin/model'

const slug = computed(() => useRoute('admin-models-slug').params.slug)

definePageMeta({
  middleware: ['admin'],
})
</script>

<template>
  <AdminModelPage :slug="slug" />
</template>
