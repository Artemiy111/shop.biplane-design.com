<script setup lang="ts">
import ImageSlider from './image-slider.vue'
import { formatPrice, priceAfterDiscount } from '~/src/shared/lib/price'
import { mimeToExt } from '~/src/shared/lib/image'

import { useToggleIsFavoriteMutation, useToggleIsInCartMutation } from '~/src/shared/models/mutations'
import type { CategoryModel } from '~/src/shared/models/queries'
import { useIsTouchScreen } from '~/src/shared/models/device'

const { model } = defineProps<{
  model: CategoryModel
}>()
const isTouchScreen = useIsTouchScreen()

const { toggleIsFavorite } = useToggleIsFavoriteMutation()
const { toggleIsInCart } = useToggleIsInCartMutation()
</script>

<template>
  <div
    class="@container grid grid-rows-[minmax(200px,1fr)_max-content_max-content_max-content]"
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
        class="flex items-end gap-4 max-xs:gap-x-2"
      >
        <div class="text-subheading font-normal">
          {{ formatPrice(priceAfterDiscount(model.price, model.discount.discountPercentage)) }}
        </div>
        <UBadge
          color="primary"
          variant="soft"
          :ui="{ base: 'text-sm max-xs:text-xs font-bold max-xs:px-1 max-xs:py-0.5' }"
        >
          {{ model.discount.discountPercentage }}%
        </UBadge>
        <span class="text-sm max-sm:text-xs line-through text-(--ui-text-muted)">{{ model.price }}</span>
      </div>
      <div
        v-else
        class="text-subheading font-normal "
      >
        {{ formatPrice(model.price) }}
      </div>
      <!--
      <UBadge
        variant="soft"
        color="neutral"
        :ui="{ base: 'text-sm' }"
      >
        {{ mimeToExt(model.files[0]!.mimeType) }}
      </UBadge> -->
    </div>

    <h6 class="mt-1">
      {{ model.name }}
    </h6>

    <div class="max-md:block hidden mt-4">
      <UButton
        class="w-full justify-center"
        variant="soft"
        :color="model.isInCart ? 'error' : 'neutral'"
        @click="toggleIsInCart(model.id)"
      >
        {{ model.isInCart ? 'Убрать' : 'В корзину' }}
      </UButton>
    </div>
  </div>
</template>
