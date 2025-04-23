<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { ContainerIcon, HeartIcon, ShoppingCartIcon, UserIcon, type LucideProps } from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'

const colorMode = useColorMode()
watch(colorMode, () => {
  console.log('colorMode', colorMode)
})

const mediaLessThamSmall = useMediaQuery('(max-width: 640px)')

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
const items = ref<Array<NavigationMenuItem & { iconComponent: FunctionalComponent<LucideProps, {}, any, {}> }>>([
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
  },
  {
    to: '/cart',
    icon: 'i-lucide-shopping-cart',
    iconComponent: ShoppingCartIcon,
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
            <component
              :is="item.iconComponent(
                { absoluteStrokeWidth: true, strokeWidth: mediaLessThamSmall ? 1.5 : 2, size: mediaLessThamSmall ? 24 : 30, class: 'text-(--ui-text)' }, {} as any)"
            />
          </template>
        </UNavigationMenu>
      </div>
    </div>
    <USeparator />
  </header>
</template>
