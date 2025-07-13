<script setup lang="ts">
import { CartPage } from '~/pages/customer/cart'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <CartPage />
</template>
