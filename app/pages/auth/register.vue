<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { authClient } from '~/src/shared/lib/auth-client'
import { errorMessages, minMaxString, requiredString } from '~/src/shared/config/validation/base'

const toast = useToast()

const form = useTemplateRef('form')

const schema = z.object({
  name: minMaxString(2, 50),
  email: z.email(errorMessages.email),
  password: minMaxString(8, 100),
  confirmPassword: requiredString,
}).refine(data => data.password === data.confirmPassword, 'Пароли не совпадают')

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({
  email: undefined,
  password: undefined,
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await authClient.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
    callbackURL: '/',
  }, {
    onError: (e) => {
      console.log(e)
      toast.add({ color: 'error', title: e.error.statusText })
    },
    onSuccess: () => {
      toast.add({ color: 'success', title: 'Регистрация успешена' })
    },
  })
}
</script>

<template>
  <main class="flex flex-col w-sm mx-auto">
    <PageHeading>Регистрация</PageHeading>
    <UForm
      ref="form"
      :schema="schema"
      :state="state"
      class="flex flex-col gap-y-4 "
      @submit="onSubmit"
    >
      <UFormField
        name="name"
        label="Имя"
      >
        <UInput
          v-model="state.name"
          type="text"
          class="w-full"
        />
      </UFormField>
      <UFormField
        name="email"
        label="Email"
      >
        <UInput
          v-model="state.email"
          type="email"
          class="w-full"
        />
      </UFormField>
      <UFormField
        name="password"
        label="Пароль"
      >
        <UInput
          v-model="state.password"
          type="password"
          class="w-full"
        />
      </UFormField>
      <UFormField
        name="confirmPassword"
        label="Повторите пароль"
      >
        <UInput
          v-model="state.confirmPassword"
          type="password"
          class="w-full"
        />
      </UFormField>

      <div class="flex gap-x-4 items-baseline">
        <UButton
          type="submit"
          class="w-fit mt-4"
          :disabled="!!form?.errors.length "
        >
          Зарегистрироваться
        </UButton>

        <ULink to="/auth/login">Вход</ULink>
      </div>
    </UForm>
  </main>
</template>
