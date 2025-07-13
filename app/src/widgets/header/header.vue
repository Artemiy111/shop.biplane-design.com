<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import {
  ContainerIcon,
  HeartIcon,
  MoonIcon,
  ShoppingBagIcon,
  SunIcon,
  UserIcon,

} from 'lucide-vue-next'
import type { LucideProps } from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'

import { useAuthUtils } from '~shared/models/auth-utils'
import { useCartItems, useFavoriteModels } from '~shared/models/queries'
import { Logo } from '~shared/ui/kit/logo'

const colorMode = useColorMode()
const authUtils = useAuthUtils()

const { favoritesCount } = useFavoriteModels()
const { cartItemsCount } = useCartItems()

const centerItems = computed(() => {
  const base: NavigationMenuItem[] = [
    {
      to: '/catalog',
      label: 'Каталог',
    },
  ]

  if (authUtils.isAdmin) {
    base.push({
      to: '/admin',
      label: 'Админка',
      value: 'admin',
      children: [
        {
          to: '/admin/models',
          label: 'Модели',
        },
        {
          to: '/admin/sets',
          label: 'Наборы',
        },
        {
          to: '/admin/discounts',
          label: 'Скидки',
        },
        {
          to: '/admin/promocodes',
          label: 'Промокоды',
        },
      ],
    })
  }

  return base
})

const rightItems = computed<
  Array<
    NavigationMenuItem & {
      count?: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
      iconComponent: FunctionalComponent<LucideProps, {}, any, {}>
    }
  >
>(() => {
  const base = [
    {
      to: '/profile',
      icon: 'i-lucide-user',
      iconComponent: UserIcon,
    },
  ]
  const customer = [
    {
      to: '/orders',
      icon: 'i-lucide-container',
      iconComponent: ContainerIcon,
    },
    {
      to: '/favorites',
      icon: 'i-lucide-heart',
      iconComponent: HeartIcon,
      count: favoritesCount.value,
    },
    {
      to: '/cart',
      icon: 'i-lucide-shopping-cart',
      iconComponent: ShoppingBagIcon,
      count: cartItemsCount.value,
    },
  ]
  return authUtils.isAdmin ? base : [...base, ...customer]
})
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
        <Logo />
        <span class="max-sm:hidden">Biplane-Design Shop</span>
      </NuxtLink>

      <UNavigationMenu
        color="neutral"
        content-orientation="vertical"
        fullscreen
        :items="centerItems"
        variant="link"
      />

      <div
        class="flex gap-3 items-center"
      >
        <UButton
          class="aspect-square cursor-pointer justify-center items-center"
          color="neutral"
          leading
          square
          variant="ghost"
          @click="() => colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        >
          <template #leading>
            <MoonIcon
              v-if="colorMode.value === 'dark'"
              absolute-stroke-width
              class="size-8 max-sm:size-6"
              :stroke-width="1.5"
            />
            <SunIcon
              v-else
              absolute-stroke-width
              class="size-8 max-sm:size-6"
              :stroke-width="1.5"
            />
          </template>
        </UButton>
        <USeparator
          class="h-8"
          orientation="vertical"
        />
        <nav class="flex gap-x-3">
          <UButton
            v-for="item in rightItems"
            :key="(item.to as string)"
            color="neutral"
            square
            :to="item.to"
            variant="ghost"
          >
            <UChip
              v-if="item.count"
              :text="item.count"
              :ui="{ base: 'size-5 text-xs-max! text-(--ui-color-primary-500) font-bold bg-(--ui-color-primary-100) dark:font-semibold dark:bg-(--ui-color-primary-700) dark:text-(--ui-color-primary-200)' }"
            >
              <component
                :is="item.iconComponent"
                absolute-stroke-width
                class="size-8 max-sm:size-6 text-(--ui-text)"
                :stroke-width="1.5"
              />
            </UChip>
            <component
              :is="item.iconComponent"
              v-else
              absolute-stroke-width
              class="size-8 max-sm:size-6 text-(--ui-text)"
              :stroke-width="1.5"
            />
          </UButton>
        </nav>
      </div>
    </div>
    <USeparator />
  </header>
</template>
