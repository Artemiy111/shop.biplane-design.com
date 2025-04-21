<script setup lang="ts">
import type { Model } from '../home-page.vue'
import { formatPrice, priceAfterDiscount } from '~/src/shared/lib/price'
import { imageUrl } from '~/src/shared/lib/image'

const { model } = defineProps<{
  model: Model
}>()

const currentImage = ref(0)
</script>

<template>
  <NuxtLink
    :to="`/models/${model.slug}`"
    class="grid grid-rows-[minmax(200px,1fr)_max-content_max-content_max-content]"
  >
    <div
      v-if="model.imagesToModel.length"
      class="relative"
    >
      <NuxtImg
        v-for="(imageToModel, index) in model.imagesToModel"
        :key="imageToModel.image.id"
        :src="imageToModel.image.url || imageUrl(imageToModel.image)"
        :alt="model.name"
        :class="[currentImage === index ? 'block' : 'hidden']"
      />
      <div
        :style="{ '--_img-cols': model.imagesToModel.length }"
        class="grid grid-cols-[repeat(var(--_img-cols),1fr)] justify-center gap-2 absolute bottom-2 w-[calc(100%)-2*var(--spacing)] inset-y-0 inset-x-2"
      >
        <template v-if="model.imagesToModel.length > 1">
          <div
            v-for="(imageToModel, index) in model.imagesToModel"
            :key="imageToModel.image.id"
            class="grid grid-rows-[1fr_1fr_min-content] h-full"
          >
            <div class="" />
            <div
              class=" bg-slate-200 opacity-5 w-full"
              @mouseenter="currentImage = index"
            />
            <div
              class="h-1"
              :class="currentImage === index ? 'bg-black/50' : 'bg-black/10' "
            />
          </div>
        </template>
      </div>
    </div>
    <div
      v-else
      class="grid justify-center items-center h-full bg-(--ui-bg-muted)"
    >
      <UIcon
        name="i-lucide-image-off"
        size="40"
        class="stroke-1"
      />
    </div>
    <USeparator />
    <div
      class="flex items-baseline mt-4 gap-4"
    >
      <template v-if="model.discount">
        <span class="text-subheading">{{ formatPrice(priceAfterDiscount(model.price, model.discount.discountPercentage)) }}</span>
        <UBadge
          :variant="'soft'"
          :ui="{ base: 'text-sm' }"
        >
          {{ model.discount.discountPercentage }}%
        </UBadge>
        <span class="text-sm line-through text-(--ui-text-muted)">{{ model.price }}</span>
      </template>
      <template v-else>
        <span
          class="text-subheading h-[32px]"
        >{{ formatPrice(model.price) }}</span>
      </template>
    </div>

    <span>{{ model.name }}</span>
  </NuxtLink>
</template>
