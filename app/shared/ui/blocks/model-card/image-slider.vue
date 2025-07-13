<script setup lang="ts">
import { HeartIcon, ShoppingBagIcon } from 'lucide-vue-next'

import { cn, imageUrl } from '~/shared/lib'
import type { CategoryModel } from '~/shared/model'
import { useIsTouchScreen } from '~/shared/model'

const { model, actionsEnabled = true } = defineProps<{
  actionsEnabled?: boolean
  model: CategoryModel
}>()

const emit = defineEmits<{
  'toggle:is-favorite': [modelId: string ]
  'toggle:is-in-cart': [modelId: string]
}>()

const currentImage = ref(0)

const isTouchScreen = useIsTouchScreen()

const images = computed(() => isTouchScreen.value ? [model.images[0]!] : model.images)
</script>

<template>
  <div
    class="relative group h-full @container/slider bg-black/1"
  >
    <NuxtImg
      v-for="(image, index) in images"
      :key="image.id"
      :alt="model.name"
      class="aspect-square w-full object-contain"
      :class="[currentImage === index || images.length === 1 ? 'block mix-blend-multiply' : 'hidden']"
      :src="image.url || imageUrl(image)"
    />
    <div
      v-if="actionsEnabled"
      :class="cn('flex flex-col gap-3 absolute top-4 right-4 @max-3xs/slider:right-2 @max-3xs/slider:top-2 text-neutral-800 z-1 w-fit h-fit')"
    >
      <button
        type="button"
        @click.stop.prevent="() => emit('toggle:is-favorite', model.id)"
      >
        <HeartIcon
          absolute-stroke-width
          :class="cn('size-8 @max-3xs/slider:size-7 @max-4xs/slider:size-6 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none pointer-coarse:opacity-100 ',
                     'hover:text-red-500 duration-base cursor-pointer',
                     model.isFavorite && 'opacity-100 text-red-500 hover:text-red-300')"
          :stroke-width="1.5"
        />
      </button>
      <button
        type="button"
        @click.stop.prevent="() => emit('toggle:is-in-cart', model.id)"
      >
        <ShoppingBagIcon
          absolute-stroke-width
          :class="cn('size-8 @max-3xs/slider:size-7 @max-4xs/slider:size-6 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none pointer-coarse:opacity-100 ',
                     'hover:text-red-500 duration-base cursor-pointer',
                     model.isInCart && 'opacity-100 text-red-500 hover:text-red-300',
                     '@max-xs/slider:hidden',
          )"
          :stroke-width="1.5"
        />
      </button>
    </div>
    <div
      class="grid grid-cols-[repeat(var(--_img-cols),1fr)] gap-2 justify-center absolute bottom-0 w-[calc(100%)-2*var(--spacing)] inset-y-0 inset-x-2"
      :style="{ '--_img-cols': images.length }"
    >
      <template v-if="images.length > 1">
        <div
          v-for="(image, index) in model.images"
          :key="image.id"
          class="grid grid-rows-[1fr] h-full"
        >
          <div
            class="w-full relative"
            @mouseenter="() => currentImage = index"
          >
            <div
              class="h-0.5 absolute bottom-0 inset-x-0"
              :class="currentImage === index ? 'bg-neutral-400' : 'bg-(--ui-border)' "
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
