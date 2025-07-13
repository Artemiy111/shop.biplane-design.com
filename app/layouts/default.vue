<script setup lang="ts">
import { ru } from '@nuxt/ui/locale'

import { Footer } from '~widgets/footer'
import { Header } from '~widgets/header'

defineSlots<{
  default: () => unknown
}>()
</script>

<template>
  <UApp :locale="ru">
    <NuxtRouteAnnouncer />
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] text-base text-(--ui-text) font-normal">
      <Header />
      <slot />
      <Footer />
    </div>
  </UApp>
</template>
