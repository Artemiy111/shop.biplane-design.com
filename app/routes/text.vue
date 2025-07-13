<script setup lang="ts">
import { authClient, useAuthUtils } from '~/shared/models/auth-utils'

const user = useAuthUtils().useUser()
const { mutate } = useMutation({
  mutation: () => authClient.signIn.anonymous(),
})
</script>

<template>
  <main class="container">
    <h1>Text</h1>

    <UButton @click="() => mutate()">
      Войти анонимно
    </UButton>

    <pre>{{ user }}</pre>
  </main>
</template>
