<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { HeartIcon, LoaderCircleIcon } from 'lucide-vue-next'

import { cn, formatPrice, getPriceAfterDiscount, imageUrl } from '~/shared/lib'
import { useModelBySlug, useToggleIsFavorite, useToggleIsInCart } from '~/shared/model'
import { PageHeadingSkeleton } from '~/shared/ui/blocks'

const { isModel, isSet, slug } = defineProps<{
  isModel: boolean
  isSet: boolean
  slug: string
}>()

const { model } = useModelBySlug(toRef(() => slug))

const { toggleIsFavorite } = useToggleIsFavorite()
const { toggleIsInCart } = useToggleIsInCart()

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
    class="container grid grid-cols-2 gap-x-16 max-lg:gap-x-10 max-xl:gap-14 gap-y-3"
  >
    <UBreadcrumb
      class="col-span-2"
      :items="breadcrumb"
    />
    <div class="">
      <UCarousel
        v-slot="{ item: image }"
        :arrows="model.images.length > 1"
        :dots="model.images.length > 1"
        :items="model.images"
        loop
        :ui="{
          item: 'rounded-none',
          // controls: 'w-[calc(100%-2*var(--spacing))] relative',
          arrows: '[&>button]:first:start-4 [&>button]:last:end-4 [&>button]:bg-transparent [&>button]:text-black [&>button]:hover:bg-black/30 [&>button]:ring-black ',
          dots: 'bottom-4 w-full px-4 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 justify-center',
          dot: 'rounded-none h-1 w-full',
        }"
        wheel-gestures
      >
        <NuxtImg
          :alt="model.name"
          :height="image.height || undefined"
          :src="image.url || imageUrl(image)"
          :width="image.width || undefined"
        />
      </UCarousel>
    </div>

    <div class="flex flex-col">
      <h1 class="text-subheading font-normal">
        {{ model.name }}
      </h1>
      <p
        v-if="!model.description"
        class="mt-2"
      >
        Этот товар самый лучший из всех, что вы видели
      </p>

      <div class="mt-6">
        <div
          v-if="model.discount"
          class="flex items-end gap-4"
        >
          <div class="text-heading">
            {{ formatPrice(getPriceAfterDiscount(model.price, model.discount.discountPercentage)) }}
          </div>

          <span class="text-subheading text-primary">{{ model.discount.discountPercentage }}%</span>

          <span class="line-through text-(--ui-text-muted)">{{ model.price }}</span>
        </div>
        <div
          v-else
          class="text-heading"
        >
          {{ formatPrice(model.price) }}
        </div>
      </div>

      <div class="flex gap-x-4 mt-6">
        <button
          type="button"
          @click="() => toggleIsFavorite(model.id)"
        >
          <HeartIcon
            absolute-stroke-width
            :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                       model.isFavorite && ' text-red-500  hover:text-red-300')"
            :size="32"
            :stroke-width="1.5"
          />
        </button>
        <UButton
          size="lg"
          :variant="model.isInCart ? 'soft' : 'solid'"
          @click="() => toggleIsInCart(model.id)"
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
