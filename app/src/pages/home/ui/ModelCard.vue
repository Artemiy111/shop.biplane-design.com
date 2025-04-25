<script setup lang="ts">
import type { Model } from '../HomePage.vue'
import ImageSlider from './ImageSlider.vue'
import { formatPrice, priceAfterDiscount } from '~/src/shared/lib/price'
import { mimeToExt } from '~/src/shared/lib/image'

import { useToggleIsFavoriteMutation, useToggleIsInCartMutation } from '~/src/shared/models/mutations'

const { model } = defineProps<{
  model: Model
}>()

const { toggleIsFavorite } = useToggleIsFavoriteMutation()
const { toggleIsInCart } = useToggleIsInCartMutation()
</script>

<template>
  <div
    class="grid grid-rows-[minmax(200px,1fr)_max-content_max-content_max-content]"
  >
    <NuxtLink
      :to="`/models/${model.slug}`"
      class=""
    >
      <ImageSlider
        v-if="model.images.length"
        :model="model"
        @toggle:is-favorite="toggleIsFavorite"
        @toggle:is-in-cart="toggleIsInCart"
      />
      <div
        v-else
        :to="`/models/${model.slug}`"
        class="grid justify-center items-center h-full bg-(--ui-bg-muted)"
      >
        <UIcon
          name="i-lucide-image-off"
          size="40"
          class="stroke-1"
        />
      </div>
    </NuxtLink>
    <USeparator />
    <div
      class="flex items-baseline justify-between mt-4 gap-4"
    >
      <div
        v-if="model.discount"
        class="flex items-baseline gap-4"
      >
        <div class="text-subheading font-normal">
          {{ formatPrice(priceAfterDiscount(model.price, model.discount.discountPercentage)) }}
        </div>
        <UBadge
          color="warning"
          variant="soft"
          :ui="{ base: 'text-sm font-semibold' }"
        >
          {{ model.discount.discountPercentage }}%
        </UBadge>
        <span class="text-sm line-through text-(--ui-text-muted)">{{ model.price }}</span>
      </div>
      <div
        v-else
        class="text-subheading font-normal h-[32px]"
      >
        {{ formatPrice(model.price) }}
      </div>

      <UBadge
        variant="soft"
        color="neutral"
        :ui="{ base: 'text-sm' }"
      >
        {{ mimeToExt(model.files[0]!.mimeType) }}
      </UBadge>
    </div>

    <h6>{{ model.name }}</h6>
  </div>
</template>
