<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

import { authClient } from '~/shared/models/auth-utils'
import { PageHeading } from '~/shared/ui/blocks'
import { InputPassword } from '~/shared/ui/kit'

import { registerSchema } from './config/shema'
import type { RegisterSchema } from './config/shema'

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
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось зарегистрироваться' })
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
      Регистрация
    </PageHeading>
    <UForm
      ref="form"
      class="flex flex-col gap-y-5 mt-1"
      :schema="registerSchema"
      :state="state"
      @submit="e => onSubmit(e)"
    >
      <UFormField
        label="Имя"
        name="name"
      >
        <UInput
          v-model="state.name"
          class="w-full"
          type="text"
        />
      </UFormField>
      <UFormField
        label="Email"
        name="email"
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
      </UFormField>
      <UFormField
        label="Повторите пароль"
        name="confirm"
      >
        <InputPassword
          v-model="state.confirm"
          class="w-full"
        />
      </UFormField>

      <div class="flex gap-x-4 items-baseline">
        <UButton
          class="w-fit mt-5"
          color="neutral"
          :disabled="!!form?.errors.length "
          loading-auto
          type="submit"
        >
          Зарегистрироваться
        </UButton>

        <ULink
          class="text-sm"
          to="/auth/login"
        >Войти</ULink>
      </div>
    </UForm>
  </main>
</template>
