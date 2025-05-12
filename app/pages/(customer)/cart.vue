<script setup lang="ts">
import { CartPage } from '~/src/pages/customer/cart'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <CartPage />
</template>
