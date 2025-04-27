<script setup lang="ts">
import { FrownIcon } from 'lucide-vue-next'

const { showRefreshButton = true } = defineProps<{ showRefreshButton?: boolean }>()

const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div
    class="flex flex-col h-full justify-center items-center w-full"
  >
    <FrownIcon
      absolute-stroke-width
      :stroke-width="1.5"
      class="size-10"
    />
    <h3 class="text-subheading mt-2">
      Не удалось загрузить
    </h3>

    <UButton
      v-if="showRefreshButton"
      color="neutral"
      variant="soft"
      class="w-fit mt-6"
      loading-auto
      @click="emit('refresh')"
    >
      Попробовать снова
    </UButton>
  </div>
</template>
