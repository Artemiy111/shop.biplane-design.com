<script setup lang="ts">
import { ProfilePage } from '~/pages/profile'

definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <ProfilePage />
</template>
