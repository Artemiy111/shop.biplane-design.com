<script setup lang="ts">
import { LoaderCircleIcon } from 'lucide-vue-next'
</script>

<template>
  <div
    class="grid justify-center items-center h-full w-full"
  >
    <LoaderCircleIcon
      absolute-stroke-width
      class="animate-spin size-8"
      :stroke-width="1.5"
    />
  </div>
</template>
