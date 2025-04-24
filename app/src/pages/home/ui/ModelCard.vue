<script setup lang="ts">
import { HeartIcon, ShoppingCart } from 'lucide-vue-next'
import type { Model } from '../HomePage.vue'
import { formatPrice, priceAfterDiscount } from '~/src/shared/lib/price'
import { imageUrl, mimeToExt } from '~/src/shared/lib/image'
import { useApi } from '~/src/shared/api'
import { cn } from '~/src/shared/lib/cn'
import { useAuthUtils } from '~/src/shared/models/auth-utils'

const authUtils = useAuthUtils()

const { model } = defineProps<{
  model: Model
}>()

const currentImage = ref(0)

const toast = useToast()

const { mutate: toggleIsFavorite } = useMutation({
  key: () => ['toggle-is-favorite', model.id],
  mutation: async (modelId: string) => {
    if (!authUtils.isCustomer) {
      toast.add({ color: 'info', title: 'Войдите чтобы добавить в избранное', duration: 1000 })
      return
    }
    await useApi().customer.toggleIsFavorite.mutate({ modelId: modelId })
  },
  onError: () => {
    toast.add({ color: 'error', title: 'Не удалось добавить в избранное' })
  },
  onSuccess: async () => {
    const qc = useQueryCache()
    await qc.invalidateQueries({ key: ['categories'] })
    await qc.invalidateQueries({ key: ['favorites', 'count'] })
  },
})

const { mutate: toggleIsInCart } = useMutation({
  key: () => ['toggle-is-in-cart', model.id],
  mutation: async (modelId: string) => {
    if (!authUtils.isCustomer) {
      toast.add({ color: 'info', title: 'Войдите чтобы добавить в корзину', duration: 1000 })
      return
    }
    console.log('wft')
    await useApi().customer.toggleIsInCart.mutate({ modelId: modelId, setId: null })
  },
  onError: () => {
    toast.add({ color: 'error', title: 'Не удалось добавить в корзину' })
  },
  onSuccess: async () => {
    const qc = useQueryCache()
    await qc.invalidateQueries({ key: ['categories'] })
    await qc.invalidateQueries({ key: ['cart-items', 'count'] })
  },
})
</script>

<template>
  <div
    class="grid grid-rows-[minmax(200px,1fr)_max-content_max-content_max-content]"
  >
    <NuxtLink
      v-if="model.imagesToModel.length"
      :to="`/models/${model.slug}`"
      class="relative group"
    >
      <NuxtImg
        v-for="(imageToModel, index) in model.imagesToModel"
        :key="imageToModel.image.id"
        :src="imageToModel.image.url || imageUrl(imageToModel.image)"
        :alt="model.name"
        :class="[currentImage === index ? 'block' : 'hidden']"
      />
      <div
        :class="cn('group-hover:opacity-100 transition duration-300 opacity-0 flex flex-col gap-2 absolute top-4 right-4 text-neutral-800 z-1 w-fit h-fit',
                   (model.isFavorite || model.isInCart) && 'opacity-100')"
      >
        <HeartIcon
          :stroke-width="1.5"
          :size="36"
          :absolute-stroke-width="true"
          :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                     model.isFavorite && 'fill-red-500 text-red-500 hover:fill-red-300 hover:text-red-300')"
          @click.stop.prevent="toggleIsFavorite(model.id)"
        />
        <ShoppingCart
          :stroke-width="1.5"
          :size="36"
          :absolute-stroke-width="true"
          :class="cn('hover:text-red-500 duration-300 cursor-pointer',
                     model.isInCart && 'fill-red-500 text-red-500 hover:fill-red-300 hover:text-red-300')"
          @click.stop.prevent="toggleIsInCart(model.id)"
        />
      </div>
      <div
        :style="{ '--_img-cols': model.imagesToModel.length }"
        class="grid grid-cols-[repeat(var(--_img-cols),1fr)] gap-2 justify-center absolute bottom-2 w-[calc(100%)-2*var(--spacing)] inset-y-0 inset-x-2"
      >
        <template v-if="model.imagesToModel.length > 1">
          <div
            v-for="(imageToModel, index) in model.imagesToModel"
            :key="imageToModel.image.id"
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
    </NuxtLink>
    <NuxtLink
      v-else
      :to="`/models/${model.slug}`"
      class="grid justify-center items-center h-full bg-(--ui-bg-muted)"
    >
      <UIcon
        name="i-lucide-image-off"
        size="40"
        class="stroke-1"
      />
    </NuxtLink>
    <USeparator />
    <div
      class="flex items-baseline justify-between mt-4 gap-4"
    >
      <div
        v-if="model.discount"
        class="flex items-baseline gap-4"
      >
        <h6 class="text-subheading font-normal">
          {{ formatPrice(priceAfterDiscount(model.price, model.discount.discountPercentage)) }}
        </h6>
        <UBadge
          :color="'warning'"
          :variant="'soft'"
          :ui="{ base: 'text-sm font-semibold' }"
        >
          {{ model.discount.discountPercentage }}%
        </UBadge>
        <span class="text-sm line-through text-(--ui-text-muted)">{{ model.price }}</span>
      </div>
      <h6
        v-else
        class="text-subheading font-normal h-[32px]"
      >
        {{ formatPrice(model.price) }}
      </h6>

      <UBadge
        variant="soft"
        color="neutral"
        :ui="{ base: 'text-sm' }"
      >
        {{ mimeToExt(model.files[0]!.mimeType) }}
      </UBadge>
    </div>

    <span>{{ model.name }}</span>
  </div>
</template>
