<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { authClient } from '~/src/shared/lib/auth-client'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'

const toast = useToast()

const schema = z.object({
  email: z.email({ error: 'Неверный email' }),
  password: z.string().min(8, { error: p => `Минимум символов: ${p.minimum}` }).max(100, { error: p => `Максимум символов: ${p.maximum}` }),
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({
  email: '',
  password: '',
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: true,
    callbackURL: '/',
  }, {
    onError: (e) => {
      toast.add({ color: 'error', title: e.error.message })
    },
    onSuccess: () => {
      toast.add({ color: 'success', title: 'Вход успешен' })
    },
  })
}
</script>

<template>
  <main class="flex flex-col w-sm mx-auto">
    <PageHeading>Вход</PageHeading>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-4 "
      @submit="onSubmit"
    >
      <UFormField
        name="email"
        label="Email"
        placeholder="Email"
      >
        <UInput
          v-model="state.email"
          class="w-full"
          type="email"
        />
      </UFormField>
      <UFormField
        name="password"
        label="Пароль"
      >
        <UInput
          v-model="state.password"
          class="w-full"
          type="password"
        />
      </UFormField>

      <UButton
        type="submit"
        class="w-fit"
      >
        Войти
      </UButton>
    </UForm>
  </main>
</template>
