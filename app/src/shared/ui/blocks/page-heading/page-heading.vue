<script setup lang="ts">
const { as = 'h1' } = defineProps<{
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p'
}>()
</script>

<template>
  <component
    :is="as"
    class="mt-6 mb-4 text-heading"
  >
    <slot />
  </component>
</template>
