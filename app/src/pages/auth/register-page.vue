<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { type RegisterSchema, registerSchema } from './config/shema'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { authClient } from '~/src/shared/models/auth-utils'
import { InputPassword } from '~/src/shared/ui/kit'

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
      :schema="registerSchema"
      :state="state"
      class="flex flex-col gap-y-5 mt-1"
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
        <InputPassword
          v-model="state.password"
          class="w-full"
        />
      </UFormField>
      <UFormField
        name="confirm"
        label="Повторите пароль"
      >
        <InputPassword
          v-model="state.confirm"
          class="w-full"
        />
      </UFormField>

      <div class="flex gap-x-4 items-baseline">
        <UButton
          type="submit"
          color="neutral"
          loading-auto
          class="w-fit mt-5"
          :disabled="!!form?.errors.length "
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
