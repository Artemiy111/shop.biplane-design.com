<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

import { authClient } from '~/shared/model'
import { InputPassword, PageHeading } from '~/shared/ui'

import { loginSchema } from './config/schema'
import type { LoginSchema } from './config/schema'

const toast = useToast()

const form = useTemplateRef('form')

const state = ref<Partial<LoginSchema>>({
  email: undefined,
  password: undefined,
})

const onSubmit = async (event: FormSubmitEvent<LoginSchema>) => {
  await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: true,
  }, {
    onError: (ctx) => {
      if (ctx.error.code === 'INVALID_EMAIL_OR_PASSWORD') {
        toast.add({ color: 'error', title: 'Неверный email или пароль' })
      }
      else toast.add({ color: 'error', title: 'Не удалось войти', description: 'Неизвестная ошибка' })
    },
    onSuccess: () => {
      navigateTo('/')
    },
  })
}
</script>

<template>
  <main class="flex flex-col auth-container">
    <PageHeading size="subheading">
      Вход
    </PageHeading>
    <UForm
      ref="form"
      class="flex flex-col gap-y-5 mt-1"
      :schema="loginSchema"
      :state="state"
      @submit="(e) => onSubmit(e)"
    >
      <UFormField
        label="Email"
        name="email"
        placeholder="Email"
      >
        <UInput
          v-model="state.email"
          class="w-full"
          type="email"
        />
      </UFormField>
      <UFormField
        label="Пароль"
        name="password"
      >
        <InputPassword
          v-model="state.password"
          class="w-full"
        />
        <template #hint>
          <ULink
            class="text-sm"
            to="/auth/forget-password"
          >Забыли пароль?</ULink>
        </template>
      </UFormField>
      <div class="flex flex-col gap-4">
        <div class="flex gap-x-4 items-baseline">
          <UButton
            class="w-fit mt-5"
            color="neutral"
            :disabled="!!form?.errors.length "
            loading-auto
            type="submit"
          >
            Войти
          </UButton>

          <ULink
            class="text-sm"
            to="/auth/register"
          >Зарегистрироваться</ULink>
        </div>
      </div>
    </UForm>
  </main>
</template>
