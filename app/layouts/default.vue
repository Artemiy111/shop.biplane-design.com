<script setup lang="ts">
import { ru } from '@nuxt/ui/locale'
import { Header } from '~/src/widgets/header'
import { Footer } from '~/src/widgets/footer'
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
