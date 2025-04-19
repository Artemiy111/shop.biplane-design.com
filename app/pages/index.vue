<script setup lang="ts">
import { authClient } from '~/src/shared/lib/auth-client'

definePageMeta({
  middleware: ['auth'],
})

const session = authClient.useSession()
</script>

<template>
  <main>
    <pre>
    {{ session }}

    </pre>
  </main>
</template>
