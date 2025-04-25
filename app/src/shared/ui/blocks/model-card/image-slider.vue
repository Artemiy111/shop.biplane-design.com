<script setup lang="ts">
import { HeartIcon, ShoppingCart } from 'lucide-vue-next'
import type { Model } from '../HomePage.vue'
import { imageUrl } from '~/src/shared/lib/image'
import { cn } from '~/src/shared/lib/cn'

const { model, actionsEnabled = true } = defineProps<{
  actionsEnabled?: boolean
  model: Model
}>()

const emit = defineEmits<{
  'toggle:is-favorite': [modelId: string ]
  'toggle:is-in-cart': [modelId: string]
}>()

const currentImage = ref(0)
</script>

<template>
  <div
    :to="`/models/${model.slug}`"
    class="relative group"
  >
    <NuxtImg
      v-for="(image, index) in model.images"
      :key="image.id"
      :src="image.url || imageUrl(image)"
      :alt="model.name"
      :class="[currentImage === index ? 'block' : 'hidden']"
    />
    <div
      v-if="actionsEnabled"
      :class="cn('group-hover:opacity-100 transition duration-300 opacity-0 flex flex-col gap-2 absolute top-4 right-4 text-neutral-800 z-1 w-fit h-fit',
                 (model.isFavorite || model.isInCart) && 'opacity-100')"
    >
      <button @click.stop.prevent="emit('toggle:is-favorite', model.id)">
        <HeartIcon
          :size="36"
          :absolute-stroke-width="true"
          :stroke-width="1.5"
          :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                     model.isFavorite && 'fill-red-500 text-red-500 hover:fill-red-300 hover:text-red-300')"
        />
      </button>
      <button @click.stop.prevent="emit('toggle:is-in-cart', model.id)">
        <ShoppingCart
          :stroke-width="1.5"
          :size="36"
          :absolute-stroke-width="true"
          :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                     model.isInCart && 'fill-red-500 text-red-500 hover:fill-red-300 hover:text-red-300')"
        />
      </button>
    </div>
    <div
      :style="{ '--_img-cols': model.images.length }"
      class="grid grid-cols-[repeat(var(--_img-cols),1fr)] gap-2 justify-center absolute bottom-2 w-[calc(100%)-2*var(--spacing)] inset-y-0 inset-x-2"
    >
      <template v-if="model.images.length > 1">
        <div
          v-for="(image, index) in model.images"
          :key="image.id"
          class="grid grid-rows-[1fr] h-full"
        >
          <div
            class="w-full relative"
            @mouseenter="currentImage = index"
          >
            <div
              class="h-1 absolute bottom-0 inset-x-0"
              :class="currentImage === index ? 'bg-black/50' : 'bg-black/5' "
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
