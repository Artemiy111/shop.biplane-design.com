<script setup lang="ts">
import { PageHeading } from '~/shared/ui'

const error = useError()
</script>

<template>
  <NuxtLayout name="default">
    <main class="container">
      <PageHeading>Ошибка {{ error?.statusCode }}</PageHeading>

      <p>{{ error?.message }}</p>

      <pre class="mt-4 whitespace-pre-wrap text-sm">{{ JSON.stringify(error, null, 2) }}</pre>
    </main>
  </NuxtLayout>
</template>
