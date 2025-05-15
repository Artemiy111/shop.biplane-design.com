<script setup lang="ts">
const { id } = defineProps<{
  id: string
}>()

const parts = computed(() => {
  const part1 = id.slice(0, 2)
  const part2 = id.slice(3, 10)
  return [part1, part2] as const
})
</script>

<template>
  <div class="font-mono">
    <span class="text-(--ui-text)">{{ parts[0] }}</span>
    <span class="text-(--ui-text-dimmed)">{{ parts[1] }}</span>
  </div>
</template>
