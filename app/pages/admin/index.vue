<script setup lang="ts">
import { DashboardPage } from '~/src/pages/admin/dashboard'

const title = 'Админка'
const description = 'Очевидно только для админов'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

definePageMeta({
  middleware: ['admin'],
})
</script>

<template>
  <DashboardPage />
</template>
