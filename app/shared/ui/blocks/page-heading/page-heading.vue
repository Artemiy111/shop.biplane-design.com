<script setup lang="ts">
defineSlots<{
  default: () => unknown
}>()

const { as = 'h1', size = 'heading' } = defineProps<{
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p'
  size?: 'heading' | 'subheading'
}>()
</script>

<template>
  <component
    :is="as"
    class="mt-6 mb-4 font-semibold"
    :class="size === 'heading' ? 'text-heading' : 'text-subheading'"
  >
    <slot />
  </component>
</template>
