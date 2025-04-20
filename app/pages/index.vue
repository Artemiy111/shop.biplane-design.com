<script setup lang="ts">
import { useApi } from '~/src/shared/api'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'

const api = useApi()

const categories = await api.categories.query()
// const hello = await api.hello.query()
// console.log(hello)
// import { authClient } from '~/src/shared/lib/auth-client'

// definePageMeta({
//   middleware: ['auth'],
// })

// const session = authClient.useSession()
</script>

<template>
  <main class="container flex flex-col">
    <PageHeading>Каталог</PageHeading>
    <pre>{{ categories }}</pre>
    https://storage.yandexcloud.net/biplane-design/77/4fc4dcf2-7876-4caf-bc99-82b1ea418569.jpeg
    <!-- {{ session }} -->
  </main>
</template>
