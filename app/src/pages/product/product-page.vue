<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { HeartIcon, LoaderCircleIcon } from 'lucide-vue-next'
import { imageUrl } from '~/src/shared/lib/image'
import { useModelBySlug } from '~/src/shared/models/queries'
import { PageHeadingSkeleton } from '~/src/shared/ui/blocks/page-heading'
import { formatPrice, getPriceAfterDiscount } from '~/src/shared/lib/price'
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
    class="container grid grid-cols-2 gap-x-16 max-lg:gap-x-10 max-xl:gap-14 gap-y-3"
  >
    <UBreadcrumb
      class="col-span-2"
      :items="breadcrumb"
    />
    <div class="">
      <UCarousel
        v-slot="{ item: image }"
        loop
        :arrows="model.images.length > 1"
        :dots="model.images.length > 1"
        wheel-gestures
        :items="model.images"
        :ui="{
          item: 'rounded-none',
          // controls: 'w-[calc(100%-2*var(--spacing))] relative',
          arrows: '[&>button]:first:start-4 [&>button]:last:end-4 [&>button]:bg-transparent [&>button]:text-black [&>button]:hover:bg-black/30 [&>button]:ring-black ',
          dots: 'bottom-4 w-full px-4 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 justify-center',
          dot: 'rounded-none h-1 w-full',
        }"
      >
        <NuxtImg
          :src="image.url || imageUrl(image)"
          :alt="model.name"
          :width="image.width || undefined"
          :height="image.height || undefined"
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
        {{ 'Этот товар самый лучший из всех, что вы видели' }}
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
        <button @click="toggleIsFavorite(model.id)">
          <HeartIcon
            :size="32"
            :absolute-stroke-width="true"
            :stroke-width="1.5"
            :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                       model.isFavorite && ' text-red-500  hover:text-red-300')"
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
