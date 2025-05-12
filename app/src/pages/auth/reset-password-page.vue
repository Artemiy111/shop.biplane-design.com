<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { type ResetPasswordSchema, resetPasswordSchema } from './config/shema'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { authClient } from '~/src/shared/models/auth-utils'
import { InputPassword } from '~/src/shared/ui/kit'

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
      :schema="resetPasswordSchema"
      :state="state"
      class="flex flex-col gap-y-5 mt-1"
      @submit="onSubmit"
    >
      <UFormField
        name="token"
        label="Токен"
      >
        <UInput
          :model-value="state.token"
          class="w-full"
          type="text"
          disabled
        />
      </UFormField>
      <UFormField
        name="password"
        label="Новый пароль"
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
          class="w-fit mt-5"
          loading-auto
          :disabled="!!form?.errors.length "
        >
          Поменять пароль
        </UButton>
      </div>
    </UForm>
  </main>
</template>
