<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { HeartIcon, LoaderCircleIcon } from 'lucide-vue-next'
import { imageUrl } from '~/src/shared/lib/image'
import { useModelBySlug } from '~/src/shared/models/queries'
import { PageHeadingSkeleton } from '~/src/shared/ui/blocks/page-heading'
import { formatPrice, priceAfterDiscount } from '~/src/shared/lib/price'
import { cn } from '~/src/shared/lib/cn'
import { useToggleIsFavoriteMutation, useToggleIsInCartMutation } from '~/src/shared/models/mutations'

const { isModel, isSet, slug } = defineProps<{
  isModel: boolean
  isSet: boolean
  slug: string
}>()

const { modelSlug, model, status, asyncStatus } = useModelBySlug()
watchEffect(() => {
  modelSlug.value = slug
})

const { toggleIsFavorite } = useToggleIsFavoriteMutation()
const { toggleIsInCart } = useToggleIsInCartMutation()

const breadcrumb = computed<BreadcrumbItem[]>(() => model.value
  ? [
      {
        label: 'Каталог',
        to: '/',
      },
      {
        label: 'Модели',
        to: `/?category=${model.value.category.slug}`,
      },
      {
        label: model.value.name,
        to: `/models/${model.value.slug}`,
        active: true,
      },
    ]
  : [])
</script>

<template>
  <main
    v-if="model"
    class="container grid grid-cols-2 gap-16"
  >
    <div class="">
      <UBreadcrumb
        :items="breadcrumb"
      />
      <UCarousel
        v-slot="{ item: image }"
        class="mt-2"
        loop
        :arrows="model.images.length > 1"
        :dots="model.images.length > 1"
        wheel-gestures
        :items="model.images"
        :ui="{
          // controls: 'w-[calc(100%-2*var(--spacing))] relative',
          arrows: '[&>button]:first:start-4 [&>button]:last:end-4 [&>button]:bg-transparent [&>button]:hover:bg-black/30 [&>button]:ring-black ',
          dots: 'bottom-4 w-full px-4 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 justify-center',
          dot: 'rounded-none h-1 w-full',
        }"
      >
        <NuxtImg
          :src="image.url || imageUrl(image)"
          :alt="model.name"
          :width="image.width || undefined"
          :height="image.height || undefined"
          class="rounded-lg"
        />
      </UCarousel>
    </div>

    <div class="flex flex-col">
      <h1 class="text-subheading mt-8">
        {{ model.name }}
      </h1>
      <p
        v-if="model.description"
        class="mt-2"
      >
        {{ 'Этот товар самый лучший из всех, что вы видели' }}
      </p>

      <div class="mt-8">
        <div
          v-if="model.discount"
          class="flex items-end gap-4"
        >
          <div class="text-heading font-bold">
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
          class="text-heading font-bold h-[32px]"
        >
          {{ formatPrice(model.price) }}
        </div>
      </div>

      <div class="flex gap-x-4 mt-8">
        <button @click="toggleIsFavorite(model.id)">
          <HeartIcon
            :size="36"
            :absolute-stroke-width="true"
            :stroke-width="1.5"
            :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                       model.isFavorite && 'fill-red-500 text-red-500 hover:fill-red-300 hover:text-red-300')"
          />
        </button>
        <UButton
          size="lg"
          :variant="model.isInCart ? 'soft' : 'solid'"
          @click="toggleIsInCart(model.id)"
        >
          {{ model.isInCart ? 'Удалить из корзины' : 'Добавить в корзину' }}
        </UButton>
      </div>
    </div>
  </main>
  <main
    v-else
    class="container justify-center items-center"
  >
    <!-- <PageHeading>{{ model.name }}</PageHeading> -->
    <PageHeadingSkeleton />
    <div class="grid justify-center items-center h-full">
      <LoaderCircleIcon
        class="animate-spin"
        :size="40"
      />
    </div>
  </main>
</template>
