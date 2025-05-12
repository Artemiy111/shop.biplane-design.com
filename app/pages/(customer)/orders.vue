<script setup lang="ts">
import { OrdersPage } from '~/src/pages/customer/orders'

definePageMeta({
  middleware: ['customer'],
})
</script>

<template>
  <OrdersPage />
</template>
