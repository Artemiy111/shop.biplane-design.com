<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import {
  ContainerIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  type LucideProps,
} from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'
import { useCartItemsCount, useFavoritesCount } from '~/src/shared/models/queries'

const colorMode = useColorMode()
watch(colorMode, () => {
  console.log('colorMode', colorMode)
})

const { favoritesCount } = useFavoritesCount()
const { cartItemsCount } = useCartItemsCount()

const mediaLessThamSmall = useMediaQuery('(max-width: 640px)')

const items = ref<
  Array<
    NavigationMenuItem & {
      count?: Ref<number | undefined>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
      iconComponent: FunctionalComponent<LucideProps, {}, any, {}>
    }
  >
>([
  {
    to: '/profile',
    icon: 'i-lucide-user',
    iconComponent: UserIcon,
  },
  {
    to: '/orders',
    icon: 'i-lucide-container',
    iconComponent: ContainerIcon,
  },
  {
    to: '/favorites',
    icon: 'i-lucide-heart',
    iconComponent: HeartIcon,
    count: favoritesCount,
  },
  {
    to: '/cart',
    icon: 'i-lucide-shopping-cart',
    iconComponent: ShoppingCartIcon,
    count: cartItemsCount,
  },
])
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
          mode="svg"
          :icon="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
          :variant="'ghost'"
          @click="colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'"
        />
        <USeparator
          :orientation="'vertical'"
          class="h-8"
        />
        <UNavigationMenu
          :ui="{ linkLeadingIcon: 'text-3xl text-(--ui-text)' }"
          :items="items"
        >
          <template #item-leading="{ item }">
            <UChip
              v-if="item.count"
              :text="item.count"
              :ui="{ base: 'size-5 text-xs text-(--ui-color-primary-500) font-bold bg-(--ui-color-primary-200) dark:font-semibold dark:bg-(--ui-color-primary-700) dark:text-(--ui-color-primary-200)' }"
            >
              <component
                :is="item.iconComponent(
                  { absoluteStrokeWidth: true,
                    strokeWidth: mediaLessThamSmall ? 1.5 : 2,
                    size: mediaLessThamSmall ? 24 : 30,
                    class: 'text-(--ui-text)' }, {} as any)"
              />
            </UChip>
            <component
              :is="item.iconComponent(
                { absoluteStrokeWidth: true,
                  strokeWidth: mediaLessThamSmall ? 1.5 : 2,
                  size: mediaLessThamSmall ? 24 : 30,
                  class: 'text-(--ui-text)' }, {} as any)"
              v-else
            />
          </template>
        </UNavigationMenu>
      </div>
    </div>
    <USeparator />
  </header>
</template>
