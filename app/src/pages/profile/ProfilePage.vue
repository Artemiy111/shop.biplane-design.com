<script setup lang="ts">
import { BadgeCheckIcon, LoaderCircleIcon } from 'lucide-vue-next'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { errorMessages, minMaxString } from '~/src/shared/config/validation/base'
import { authClient } from '~/src/shared/lib/auth-client'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { InputPassword } from '~/src/shared/ui/kit'

const toast = useToast()
const session = authClient.useSession()
const user = computed(() => session.value?.data?.user || null)

const userSettingsForm = useTemplateRef('userSettingsForm')
const changePasswordForm = useTemplateRef('changePasswordForm')

const changeUserSettingsSchema = z.object({
  name: minMaxString(2, 100),
  email: z.email(errorMessages.email),
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
  authClient.updateUser({
    name: event.data.name,
  }, {
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить настройки', description: 'Попробуйте позже' })
    },
    onSuccess: () => {
      toast.add({ color: 'success', title: 'Настройки изменены' })
    },
  })
}

const changePasswordSchema = z.object({
  currentPassword: minMaxString(2, 100),
  newPassword: minMaxString(2, 100),
  confirmPassword: minMaxString(2, 100),
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
    await authClient.sendVerificationEmail({ email: user.value.email })
  },
  onError: () => {
    toast.add({ color: 'error', title: 'Не удалось отправить письмо для подтверждения почты', description: 'Попробуйте позже' })
  },
  onSuccess: () => {
    toast.add({ color: 'success', title: 'Письмо для подтверждения почты отправлено', description: 'Пожалуйста, проверьте почту' })
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
        // description: 'Пожалуйста, проверьте почту',
      })
    },
  })
}
</script>

<template>
  <main class="container">
    <PageHeading>Профиль</PageHeading>
    <div
      v-if="!user"
      class="grid justify-center items-center h-full"
    >
      <LoaderCircleIcon class="animate-spin" />
    </div>
    <div
      v-else
      class="flex gap-x-16 gap-y-16 flex-wrap"
    >
      <UForm
        ref="userSettingsForm"
        :schema="changeUserSettingsSchema"
        :state="userSettingsState"
        class="flex flex-col h-fit gap-y-4 w-[380px] max-sm:w-full"
        loading-auto
        @submit="onSubmit"
      >
        <UFormField
          name="id"
          label="Id"
          class="w-full"
        >
          <InputPassword
            v-model="user.id"
            :show="true"
            variant="soft"
            disabled
            class="w-full"
            :ui="{ base: 'disabled:cursor-default! aria-disabled:cursor-default!' }"
          />
        </UFormField>

        <UFormField
          name="user"
          label="Имя"
          class="w-full"
        >
          <UInput
            v-model="userSettingsState.name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Email"
          name="email"
          class="w-full"
          :help="user.emailVerified ? 'Почта подтверждена' : 'Почта не подтверждена'"
        >
          <div class="flex gap-x-4 items-center relative">
            <UInput
              v-model="userSettingsState.email"
              class="w-full"
              trailing
            >
              <template #trailing>
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
          type="button"
          variant="outline"
          class="cursor-pointer w-fit"
          :disabled="!!userSettingsForm?.dirtyFields.size"
          @click="sendVerificationEmail()"
        >
          Отправить письмо подтверждения почты
        </UButton>

        <UButton
          type="submit"
          class="cursor-pointer mt-4 w-fit"
          :disabled="!userSettingsForm?.dirtyFields.size || !!userSettingsForm?.errors.length"
          loading-auto
          :trailing="true"
          loading-icon="i-lucide-loader-2"
        >
          Сохранить
        </UButton>
      </UForm>

      <UForm
        ref="changePasswordForm"
        :schema="changePasswordSchema"
        :state="changePasswordState"
        class="flex flex-col h-fit gap-y-4 w-[380px] max-sm:w-full"
        @submit="changePassword"
      >
        <UFormField
          name="currentPassword"
          label="Текущий пароль"
          class="w-full"
        >
          <InputPassword
            v-model="changePasswordState.currentPassword"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="newPassword"
          label="Новый пароль"
          class="w-full"
        >
          <InputPassword
            v-model="changePasswordState.newPassword"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="confirmPassword"
          label="Подтвердить пароль"
          class="w-full"
        >
          <InputPassword
            v-model="changePasswordState.confirmPassword"
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          variant="soft"
          class="cursor-pointer mt-4 w-fit"
          :disabled="!changePasswordForm?.dirtyFields.size || !!changePasswordForm?.errors.length"
          loading-auto
          trailing
          loading-icon="i-lucide-loader-2"
        >
          Изменить пароль
        </UButton>
      </UForm>
    </div>
  </main>
</template>
