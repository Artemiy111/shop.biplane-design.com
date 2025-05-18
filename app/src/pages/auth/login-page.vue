<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { type LoginSchema, loginSchema } from './config/shema'
import { authClient } from '~/src/shared/models/auth-utils'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'
import { InputPassword } from '~/src/shared/ui/kit'

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
      :schema="loginSchema"
      :state="state"
      class="flex flex-col gap-y-5 mt-1"
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
            type="submit"
            color="neutral"
            loading-auto
            class="w-fit mt-5"
            :disabled="!!form?.errors.length "
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
