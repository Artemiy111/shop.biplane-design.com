<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { BadgeCheckIcon } from 'lucide-vue-next'
import { z } from 'zod'

import { emailSchema, minMaxString, passwordSchema } from '~shared/config/validation/base'
import { authClient, useAuthUtils } from '~shared/models/auth-utils'
import { ContentLoader, ContentLoaderError } from '~shared/ui/blocks/content-loader'
import { PageHeading } from '~shared/ui/blocks/page-heading'
import { InputPassword } from '~shared/ui/kit'

const authUtils = useAuthUtils()
const user = authUtils.useUser()
const toast = useToast()

const userSettingsForm = useTemplateRef('userSettingsForm')
const changePasswordForm = useTemplateRef('changePasswordForm')

const changeUserSettingsSchema = z.object({
  name: minMaxString(2, 100),
  email: emailSchema,
})

type ChangeUserSettingsSchema = z.output<typeof changeUserSettingsSchema>

const userSettingsState = ref<ChangeUserSettingsSchema>({
  name: '',
  email: '',
})

watchImmediate(user, () => {
  if (user.value) {
    userSettingsState.value.name = user.value.name
    userSettingsState.value.email = user.value.email
  }
}, { deep: true })

const onSubmit = async (event: FormSubmitEvent<ChangeUserSettingsSchema>) => {
  const currentUser = user.value
  if (!currentUser) return
  authClient.updateUser({
    name: event.data.name,
  }, {
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить имя', description: 'Неизвестная ошибка' })
    },
  })

  if (event.data.email === currentUser.email) return

  authClient.changeEmail({ newEmail: event.data.email }, {
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить email', description: 'Неизвестная ошибка' })
    },
    onSuccess: () => {
      if (currentUser.emailVerified) toast.add({ color: 'success', title: 'Email изменён, проверьте почту для подтверждения' })
    },
  })
}

const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
})

type ChangePasswordSchema = z.output<typeof changePasswordSchema>

const changePasswordState = ref<ChangePasswordSchema>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const { mutate: sendVerificationEmail } = useMutation({
  key: ['sendVerificationEmail'],
  mutation: async () => {
    if (!user.value) return
    authClient.sendVerificationEmail({ email: user.value.email },
      {
        onError: () => {
          toast.add({ color: 'error', title: 'Не удалось отправить письмо для подтверждения почты', description: 'Попробуйте позже' })
        },
        onSuccess: () => {
          toast.add({ color: 'success', title: 'Письмо для подтверждения почты отправлено', description: 'Пожалуйста, проверьте почту' })
        },
      },
    )
  },

})

const changePassword = async (event: FormSubmitEvent<ChangePasswordSchema>) => {
  await authClient.changePassword({
    currentPassword: event.data.currentPassword,
    newPassword: event.data.newPassword,
  }, {
    onError: (e) => {
      if (e.error.code == 'INVALID_PASSWORD')
        toast.add({ color: 'error', title: 'Неверный пароль' })
      else toast.add({ color: 'error', title: 'Не удалось изменить пароль', description: 'Попробуйте позже' })
    },
    onSuccess: () => {
      toast.add({
        color: 'success',
        title: 'Пароль изменен',
      })
    },
  })
}

const logout = async () => {
  await authClient.signOut()
  await navigateTo('/')
  const qc = useQueryCache()
  await qc.invalidateQueries({ key: ['categories'] })
  await qc.invalidateQueries({ key: ['favorites'] })
  await qc.invalidateQueries({ key: ['cart-items'] })
}
</script>

<template>
  <main class="container">
    <PageHeading>Профиль</PageHeading>
    <ContentLoader v-if="authUtils.sessionData.isPending" />
    <ContentLoaderError
      v-else-if="authUtils.sessionData.isError || !user"
      :show-refresh-button="false"
    />
    <div
      v-else
      class="flex gap-x-16 gap-y-16 flex-wrap"
    >
      <UForm
        ref="userSettingsForm"
        class="flex flex-col h-fit gap-y-4 w-[380px] max-sm:w-full"
        loading-auto
        :schema="changeUserSettingsSchema"
        :state="userSettingsState"
        @submit="e => onSubmit(e)"
      >
        <UFormField
          class="w-full"
          label="Id"
          name="id"
        >
          <InputPassword
            v-model="user.id"
            class="w-full"
            disabled
            :show="false"
            :ui="{ base: 'disabled:cursor-default! aria-disabled:cursor-default!' }"
            variant="soft"
          />
        </UFormField>

        <UFormField
          class="w-full"
          label="Имя"
          name="user"
        >
          <UInput
            v-model="userSettingsState.name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          class="w-full"
          :help="user.emailVerified ? 'Почта подтверждена' : 'Почта не подтверждена'"
          label="Email"
          name="email"
        >
          <div class="flex gap-x-4 items-center relative">
            <UInput
              v-model="userSettingsState.email"
              class="w-full"
              trailing
            >
              <template
                v-if="user.emailVerified"
                #trailing
              >
                <BadgeCheckIcon
                  class="text-green-500"
                  :size="20"
                />
              </template>
            </UInput>
          </div>
        </UFormField>

        <UButton
          v-if="!user.emailVerified"
          class="w-fit"
          :disabled="!!userSettingsForm?.dirtyFields.size"
          type="button"
          variant="outline"
          @click="() => sendVerificationEmail()"
        >
          Отправить письмо подтверждения почты
        </UButton>

        <UButton
          class="mt-4 w-fit"
          color="neutral"
          :disabled="!userSettingsForm?.dirtyFields.size || !!userSettingsForm?.errors.length"
          loading-auto
          loading-icon="i-lucide-loader-2"
          trailing
          type="submit"
        >
          Сохранить
        </UButton>
      </UForm>

      <UForm
        ref="changePasswordForm"
        class="flex flex-col h-fit gap-y-4 w-[380px] max-sm:w-full"
        :schema="changePasswordSchema"
        :state="changePasswordState"
        @submit="e => changePassword(e)"
      >
        <UFormField
          class="w-full"
          label="Текущий пароль"
          name="currentPassword"
        >
          <InputPassword
            v-model="changePasswordState.currentPassword"
            class="w-full"
          />
        </UFormField>
        <UFormField
          class="w-full"
          label="Новый пароль"
          name="newPassword"
        >
          <InputPassword
            v-model="changePasswordState.newPassword"
            class="w-full"
          />
        </UFormField>
        <UFormField
          class="w-full"
          label="Подтвердить пароль"
          name="confirmPassword"
        >
          <InputPassword
            v-model="changePasswordState.confirmPassword"
            class="w-full"
          />
        </UFormField>
        <UButton
          class="mt-4 w-fit"
          color="neutral"
          :disabled="!changePasswordForm?.dirtyFields.size || !!changePasswordForm?.errors.length"
          loading-auto
          loading-icon="i-lucide-loader-2"
          trailing
          type="submit"
          variant="soft"
        >
          Изменить пароль
        </UButton>
      </UForm>
      <div class="mt-7">
        <UButton
          class="w-fit"
          color="error"
          type="button"
          variant="soft"
          @click="() => logout()"
        >
          Выйти из аккаунта
        </UButton>
      </div>
    </div>
  </main>
</template>
