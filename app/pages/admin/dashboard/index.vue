<script setup lang="ts">
import { DashboardPage } from '~pages/admin/dashboard'

definePageMeta({
  path: '/admin',
  middleware: ['admin'],
})

const title = 'Админка'
const description = 'Очевидно только для админов'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})
</script>

<template>
  <DashboardPage />
</template>
