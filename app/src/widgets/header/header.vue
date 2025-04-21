<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useApi } from '~/src/shared/api'

const route = useRoute()
const api = useApi()
const colorMode = useColorMode()

const items = ref<NavigationMenuItem[]>([
  {
    to: '/profile',
    icon: 'i-lucide-user',
  },
  {
    to: '/orders',
    icon: 'i-lucide-container',
  },
  {
    to: '/favorites',
    icon: 'i-lucide-heart',
  },
  {
    to: '/cart',
    icon: 'i-lucide-shopping-cart',
  },
])

// const toastMessages = {
//   success: 'Вы вышли из аккаунта',
//   error: 'Не удалось выйти из аккаунта',
// }

// async function singOut() {
//   try {
//     await api.auth.logout.query()
//     user.value = null
//     toast.success(toastMessages.success)
//     if (useRoute().path.includes('admin')) await navigateTo('/admin/auth')
//   }
//   catch (_e) {
//     toast.error(toastMessages.error)
//   }
// }
</script>

<template>
  <header
    id="header"
    class="container z-50 flex h-(--header-height) flex-col"
  >
    <div class="z-50 flex h-full items-center justify-between">
      <NuxtLink
        class="flex items-center gap-4"
        to="/"
      >
        <img
          alt="Логотип"
          class="h-10 dark:invert-[70%] max-md:h-8"
          src="/logo.svg"
        >
        <span class="max-sm:hidden">Biplane-Design</span>
      </NuxtLink>
      <div class="flex gap-2 items-center">
        <UButton
          class="w-fit h-fit cursor-pointer"
          :ui="{ leadingIcon: 'text-3xl' }"
          :icon="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
          :variant="'ghost'"
          @click="colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'"
        />
        <USeparator
          :orientation="'vertical'"
          class="h-8"
        />
        <UNavigationMenu
          :ui="{ linkLeadingIcon: 'text-3xl text-(--ui-text) ' }"
          :items="items"
        />
      </div>
    </div>
    <USeparator />
  </header>
</template>
