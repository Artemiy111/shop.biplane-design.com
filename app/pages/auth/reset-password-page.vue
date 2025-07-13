<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

import { authClient } from '~/shared/model'
import { InputPassword, PageHeading } from '~/shared/ui'

import { resetPasswordSchema } from './config/schema'
import type { ResetPasswordSchema } from './config/schema'

const toast = useToast()
const form = useTemplateRef('form')
const route = useRoute()
const token = route.query.token?.toString() || ''

const state = ref<Partial<ResetPasswordSchema>>({
  token: undefined,
  password: undefined,
  confirm: undefined,
})

onMounted(() => {
  if (!token || route.query.error === 'invalid_token')
    form.value?.setErrors([{ name: 'token', message: 'Не удалось получить токен' }])
  else
    state.value.token = token
})

const onSubmit = async (event: FormSubmitEvent<ResetPasswordSchema>) => {
  await authClient.resetPassword({
    newPassword: event.data.password,
    token,
  }, {
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось сбросить пароль' })
    },
    onSuccess: () => {
      navigateTo('/auth/login')
    },
  })
}
</script>

<template>
  <main class="flex flex-col auth-container">
    <PageHeading size="subheading">
      Сброс пароля
    </PageHeading>
    <UForm
      ref="form"
      class="flex flex-col gap-y-5 mt-1"
      :schema="resetPasswordSchema"
      :state="state"
      @submit="e => onSubmit(e)"
    >
      <UFormField
        label="Токен"
        name="token"
      >
        <UInput
          class="w-full"
          disabled
          :model-value="state.token"
          type="text"
        />
      </UFormField>
      <UFormField
        label="Новый пароль"
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
          Поменять пароль
        </UButton>
      </div>
    </UForm>
  </main>
</template>
