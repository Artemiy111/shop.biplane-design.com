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
import { useCartItemsCount, useFavoritesCount } from '~/src/shared/models/queries'
import { Logo } from '~/src/shared/ui/kit/logo'

const colorMode = useColorMode()

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
    iconComponent: ShoppingBagIcon,
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
        <Logo />
        <!-- <img
          alt="Логотип"
          class="h-10 dark:invert-[70%] max-md:h-8"
          src="/logo.svg"
        > -->
        <span class="max-sm:hidden">Biplane-Design</span>
      </NuxtLink>
      <div class="flex gap-2 items-center">
        <UButton
          class="w-[50px] aspect-square cursor-pointer justify-center items-center"
          color="neutral"
          variant="ghost"
          leading
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        >
          <template #leading>
            <MoonIcon
              v-if="colorMode.value === 'dark'"
              :size="mediaLessThamSmall ? 24 : 32"
              :absolute-stroke-width="true"
              :stroke-width="mediaLessThamSmall ? 1.5 : 2"
            />
            <SunIcon
              v-else
              :size="mediaLessThamSmall ? 24 : 32"
              :absolute-stroke-width="true"
              :stroke-width="mediaLessThamSmall ? 1.5 : 2"
            />
          </template>
        </UButton>
        <USeparator
          :orientation="'vertical'"
          class="h-8"
        />
        <UNavigationMenu
          :ui="{ link: 'aspect-square', item: 'py-0', linkLeadingIcon: 'text-3xl text-(--ui-text)' }"
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
                    size: mediaLessThamSmall ? 24 : 32,
                    class: 'text-(--ui-text)' }, {} as any)"
              />
            </UChip>
            <component
              :is="item.iconComponent({
                strokeWidth: 1.5,
                size: mediaLessThamSmall ? 24 : 32,
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
