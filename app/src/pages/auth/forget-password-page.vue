<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

import { authClient } from '~/src/shared/models/auth-utils'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

import { forgetPasswordSchema } from './config/shema'
import type { ForgetPasswordSchema } from './config/shema'

const toast = useToast()
const form = useTemplateRef('form')

const state = ref<Partial<ForgetPasswordSchema>>({
  email: undefined,
})

const onSubmit = async (event: FormSubmitEvent<ForgetPasswordSchema>) => {
  await authClient.forgetPassword({
    email: event.data.email,
    redirectTo: '/auth/reset-password',
  }, {
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось отправить email' })
    },
    onSuccess: () => {
      toast.add({ color: 'success', title: 'Email отправлен', description: 'Перейдите по ссылке в письме' })
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
      :schema="forgetPasswordSchema"
      :state="state"
      @submit="e => onSubmit(e)"
    >
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

      <div class="flex flex-wrap gap-y-6 gap-x-8 items-baseline ">
        <UButton
          class="w-fit mt-4"
          color="neutral"
          :disabled="!!form?.errors.length "
          loading-auto
          type="submit"
        >
          Сбросить пароль
        </UButton>

        <div class="flex gap-x-4">
          <ULink
            class="text-sm"
            to="/auth/login"
          >Вход</ULink>

          <ULink
            class="text-sm"
            to="/auth/register"
          >Регистрация</ULink>
        </div>
      </div>
    </UForm>
  </main>
</template>
