<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import {
  ContainerIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  ShoppingBagIcon,
  UserIcon,
  type LucideProps,
} from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'
import { useAuthUtils } from '~/src/shared/models/auth-utils'
import { useCartItemsCount, useFavoritesCount } from '~/src/shared/models/queries'
import { Logo } from '~/src/shared/ui/kit/logo'

const colorMode = useColorMode()
const authUtils = useAuthUtils()

const { favoritesCount } = useFavoritesCount()
const { cartItemsCount } = useCartItemsCount()

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
        variant="link"
        fullscreen
        :items="centerItems"
        content-orientation="vertical"
      />

      <div
        class="flex gap-3 items-center"
      >
        <UButton
          square
          class="aspect-square cursor-pointer justify-center items-center"
          color="neutral"
          variant="ghost"
          leading
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        >
          <template #leading>
            <MoonIcon
              v-if="colorMode.value === 'dark'"
              class="size-8 max-sm:size-6"
              absolute-stroke-width
              :stroke-width="1.5"
            />
            <SunIcon
              v-else
              class="size-8 max-sm:size-6"
              absolute-stroke-width
              :stroke-width="1.5"
            />
          </template>
        </UButton>
        <USeparator
          :orientation="'vertical'"
          class="h-8"
        />
        <nav class="flex gap-x-3">
          <UButton
            v-for="item in rightItems"
            :key="(item.to as string)"
            :to="item.to"
            square
            variant="ghost"
            color="neutral"
          >
            <UChip
              v-if="item.count"
              :text="item.count"
              :ui="{ base: 'size-5 text-xs-max! text-(--ui-color-primary-500) font-bold bg-(--ui-color-primary-100) dark:font-semibold dark:bg-(--ui-color-primary-700) dark:text-(--ui-color-primary-200)' }"
            >
              <component
                :is="item.iconComponent"
                absolute-stroke-width
                :stroke-width="1.5"
                class="size-8 max-sm:size-6 text-(--ui-text)"
              />
            </UChip>
            <component
              :is="item.iconComponent"
              v-else
              absolute-stroke-width
              :stroke-width="1.5"
              class="size-8 max-sm:size-6 text-(--ui-text)"
            />
          </UButton>
        </nav>
      </div>
    </div>
    <USeparator />
  </header>
</template>
