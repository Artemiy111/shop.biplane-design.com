<script setup lang="ts">
import { OrdersPage } from '~/pages/customer/orders'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <OrdersPage />
</template>
