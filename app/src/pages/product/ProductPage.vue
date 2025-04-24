<script setup lang="ts">
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

const { isModel, isSet, slug } = defineProps<{
  isModel: boolean
  isSet: boolean
  slug: string
}>()
</script>

<template>
  <main class="container flex flex-col">
    <PageHeading>{{ slug }}</PageHeading>
  </main>
</template>
