<script setup lang="ts">
import { FrownIcon } from 'lucide-vue-next'

const { showRefreshButton = true } = defineProps<{ showRefreshButton?: boolean }>()

const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div
    class="grid grid-rows-[repeat(7,auto)] h-full w-full items-center justify-center"
  >
    <div class="[grid-row:3] flex flex-col items-center">
      <FrownIcon
        absolute-stroke-width
        :stroke-width="1.5"
        class="size-10"
      />
      <h6 class="text-subheading mt-2">
        Не удалось загрузить
      </h6>

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
  </div>
</template>
