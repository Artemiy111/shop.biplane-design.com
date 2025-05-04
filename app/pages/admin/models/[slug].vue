<script setup lang="ts">
import { AdminModelPage } from '~/src/pages/admin/model'

const slug = computed(() => useRoute('admin-models-slug').params.slug)
</script>

<template>
  <AdminModelPage :slug="slug" />
</template>
