<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { type RegisterSchema, registerSchema } from './config/shema'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { authClient } from '~/src/shared/models/auth-utils'

const toast = useToast()

const form = useTemplateRef('form')

const state = ref<Partial<RegisterSchema>>({
  email: undefined,
  password: undefined,
})

const onSubmit = async (event: FormSubmitEvent<RegisterSchema>) => {
  await authClient.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
  }, {
    onError: (e) => {
      toast.add({ color: 'error', title: e.error.statusText })
    },
    onSuccess: () => {
      navigateTo('/')
    },
  })
}
</script>

<template>
  <main class="flex flex-col w-sm mx-auto">
    <PageHeading>Регистрация</PageHeading>
    <UForm
      ref="form"
      :schema="registerSchema"
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
        name="confirm"
        label="Повторите пароль"
      >
        <UInput
          v-model="state.confirm"
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
