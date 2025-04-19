<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { authClient } from '~/src/shared/lib/auth-client'

const toast = useToast()

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({
  email: undefined,
  password: undefined,
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const res = await authClient.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
  })
  if (res.error) {
    console.log(res.error)
    toast.add({ color: 'error', title: res.error.message })
    return
  }
  toast.add({ color: 'success', title: 'Вход успешен' })
  navigateTo('/')
}
</script>

<template>
  <main>
    <UForm
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <UFormField
        name="name"
        label="Имя"
      >
        <UInput
          v-model="state.name"
          type="text"
        />
      </UFormField>
      <UFormField
        name="email"
        label="Email"
      >
        <UInput
          v-model="state.email"
          type="email"
        />
      </UFormField>
      <UFormField
        name="password"
        label="Пароль"
      >
        <UInput
          v-model="state.password"
          type="password"
        />
      </UFormField>
      <UButton type="submit">
        Зарегистрироваться
      </UButton>
    </UForm>
  </main>
</template>
