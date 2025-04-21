<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { type LoginSchema, loginSchema } from './confg/shema'
import { authClient } from '~/src/shared/lib/auth-client'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'

const toast = useToast()

const form = useTemplateRef('form')

const state = ref<Partial<LoginSchema>>({
  email: '',
  password: '',
})

const onSubmit = async (event: FormSubmitEvent<LoginSchema>) => {
  await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: true,
    callbackURL: '/',
  }, {
    onError: (e) => {
      console.log(e)
      toast.add({ color: 'error', title: e.error.statusText })
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
      ref="form"
      :schema="loginSchema"
      :state="state"
      class="flex flex-col gap-y-4 "
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
      <div class="flex gap-x-4 items-baseline">
        <UButton
          type="submit"
          loading-auto
          class="w-fit mt-4"
          :disabled="!!form?.errors.length "
        >
          Войти
        </UButton>

        <ULink to="/auth/register">Регистрация</ULink>
      </div>
    </UForm>
  </main>
</template>
