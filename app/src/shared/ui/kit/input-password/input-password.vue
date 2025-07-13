<script setup lang="ts">
import type { InputEmits, InputProps } from '@nuxt/ui/runtime/components/Input.vue.d.ts'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const props = defineProps<Omit<InputProps, 'type'>>()
const model = defineModel<string>()
const show = defineModel<boolean>('show', { default: false })
const emit = defineEmits<InputEmits>()
</script>

<template>
  <UInput
    v-bind="props"
    v-model="model"
    :type="show ? 'text' : 'password'"
    @blur="e => emit('blur', e)"
    @change="e => emit('change', e)"
  >
    <template #trailing>
      <button
        :aria-label="show ? 'Спрятать текст' : 'Показать текст'"
        :aria-pressed="show"
        type="button"
        @click="() => show = !show"
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
