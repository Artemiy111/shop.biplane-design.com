<script setup lang="ts">
import { HeartIcon, ShoppingBagIcon } from 'lucide-vue-next'
import type { CategoryModel } from '~/src/shared/models/queries'
import { imageUrl } from '~/src/shared/lib/image'
import { cn } from '~/src/shared/lib/cn'
import { useIsTouchScreen } from '~/src/shared/models/device'

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
      :src="image.url || imageUrl(image)"
      :alt="model.name"
      :class="[currentImage === index || images.length === 1 ? 'block mix-blend-multiply' : 'hidden']"
    />
    <div
      v-if="actionsEnabled"
      :class="cn('flex flex-col gap-3 absolute top-4 right-4 @max-3xs/slider:right-2 @max-3xs/slider:top-2 text-neutral-800 z-1 w-fit h-fit')"
    >
      <button @click.stop.prevent="emit('toggle:is-favorite', model.id)">
        <HeartIcon
          absolute-stroke-width
          :stroke-width="1.5"
          :class="cn('size-8 @max-3xs/slider:size-7 @max-4xs/slider:size-6 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none pointer-coarse:opacity-100 ',
                     'hover:text-red-500 duration-base cursor-pointer',
                     model.isFavorite && 'opacity-100 text-red-500 hover:text-red-300')"
        />
      </button>
      <button @click.stop.prevent="emit('toggle:is-in-cart', model.id)">
        <ShoppingBagIcon
          absolute-stroke-width
          :stroke-width="1.5"
          :class="cn('size-8 @max-3xs/slider:size-7 @max-4xs/slider:size-6 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none pointer-coarse:opacity-100 ',
                     'hover:text-red-500 duration-base cursor-pointer',
                     model.isInCart && 'opacity-100 text-red-500 hover:text-red-300',
                     '@max-xs/slider:hidden',
          )"
        />
      </button>
    </div>
    <div
      :style="{ '--_img-cols': images.length }"
      class="grid grid-cols-[repeat(var(--_img-cols),1fr)] gap-2 justify-center absolute bottom-0 w-[calc(100%)-2*var(--spacing)] inset-y-0 inset-x-2"
    >
      <template v-if="images.length > 1">
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
              class="h-0.5 absolute bottom-0 inset-x-0"
              :class="currentImage === index ? 'bg-neutral-400' : 'bg-(--ui-border)' "
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
