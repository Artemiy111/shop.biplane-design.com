<script setup lang="ts">
import { ImageOffIcon } from 'lucide-vue-next'
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
    class="@container/card grid card-grid"
  >
    <NuxtLink
      :to="`/models/${model.slug}`"
      class="[grid-area:image]"
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
        <ImageOffIcon
          :absolute-stroke-width="true"
          :stroke-width="1.5"
          name="i-lucide-image-off"
          class="size-8 stroke-1"
        />
      </div>
    </NuxtLink>
    <div class="[grid-area:image] z-1 justify-self-end self-end bottom-4 right-4 relative flex gap-x-3  @max-3xs/card:right-2 @max-3xs/card:bottom-2">
      <UBadge
        v-for="file in model.files"
        :key="file.id"
        variant="soft"
        color="neutral"
        :ui="{ base: 'text-xs px-1.5 py-0.5' }"
      >
        {{ mimeToExt(file.mimeType) }}
      </UBadge>
    </div>
    <USeparator
      class="[grid-area:separator] h-min"
      :ui="{ border: 'h-min' }"
    />
    <section class="[grid-area:content]">
      <div
        class="flex items-baseline justify-between mt-4 gap-4"
      >
        <div
          v-if="model.discount"
          class="flex items-baseline gap-4 max-xs:gap-x-2"
        >
          <div class="text-subheading font-normal @max-xs/card:text-base-max @max-2xs/card:text-sm-max">
            {{ formatPrice(priceAfterDiscount(model.price, model.discount.discountPercentage)) }}
          </div>
          <UBadge
            color="primary"
            variant="soft"
            class="@max-3xs/card:text-xs @max-3xs/card:px-1.5 @max-3xs/card:py-0.5"
            :ui="{ base: 'text-sm font-bold ' }"
          >
            {{ model.discount.discountPercentage }}%
          </UBadge>
          <span class="@max-3xs/card:text-xs text-sm line-through text-(--ui-text-muted)">{{ model.price }}</span>
        </div>
        <div
          v-else
          class="text-subheading font-normal @max-xs:text-base-max @max-2xs:text-sm-max"
        >
          {{ formatPrice(model.price) }}
        </div>
      </div>

      <h6 class="mt-1 @max-xs/card:text-sm">
        {{ model.name }}
      </h6>

      <div class="@max-xs/card:block hidden mt-4 @max-3xs/card:mt-3">
        <UButton
          class="w-full justify-center @max-3xs/card:text-xs"
          variant="soft"
          :color="model.isInCart ? 'error' : 'neutral'"
          @click="toggleIsInCart(model.id)"
        >
          {{ model.isInCart ? 'Убрать' : 'В корзину' }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.card-grid {
  grid-template-areas:
  "image"
  "separator"
  "content";
}
</style>
