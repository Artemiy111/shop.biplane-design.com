<script setup lang="ts">
import type { InputProps, InputEmits } from '@nuxt/ui'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const props = defineProps<Omit<InputProps, 'type'>>()
const emit = defineEmits<InputEmits>()
const model = defineModel<string>()
const show = defineModel<boolean>('show', { default: false })
</script>

<template>
  <UInput
    v-bind="props"
    v-model="model"

    :type="show ? 'text' : 'password'"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template #trailing>
      <button
        type="button"
        :aria-label="show ? 'Спрятать Текст' : 'Показать текст'"
        :aria-pressed="show"
        @click="show = !show"
      >
        <EyeOffIcon
          v-if="show"
          :size="20"
        />
        <EyeIcon
          v-else
          :size="20"
        />
      </button>
    </template>
  </UInput>
</template>
