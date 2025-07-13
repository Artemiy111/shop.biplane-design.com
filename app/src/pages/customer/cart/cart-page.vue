<script setup lang="ts">
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { useCartItems } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { formatPrice, getPriceAfterDiscount } from '~/src/shared/lib/price'
import { imageUrl } from '~/src/shared/lib/image'

const { cartItems, status, refresh } = useCartItems()
</script>

<template>
  <div class="container grid grid-cols-[1fr_max-content] gap-8">
    <main>
      <PageHeading>Корзина</PageHeading>
      <div class="@container/content h-full">
        <ContentLoader v-if="status === 'pending'" />
        <ContentLoaderError
          v-else-if="status === 'error'"
          @refresh="() => refresh()"
        />

        <template v-else-if="status === 'success'">
          <div
            v-if="cartItems.length"
            class="grid grid-cols-[1fr,max-content]"
          >
            <template
              v-for="item in cartItems"
              :key="item.id"
            >
              <div
                v-if="'model' in item && item.model !== null"
                class="grid grid-cols-[150px_1fr_max-content] gap-x-8"
              >
                <NuxtImg
                  :src="item.model.images[0].url || imageUrl(item.model.images[0])"
                />
                <div class="">
                  {{ item.model.name }}
                </div>
                <div class="">
                  <div
                    v-if="item.model.discount"
                    class="flex items-baseline gap-4 max-xs:gap-x-2"
                  >
                    <div class="text-subheading font-normal @max-xs/card:text-base-max @max-2xs/card:text-sm-max">
                      {{ formatPrice(getPriceAfterDiscount(item.model.price, item.model.discount.discountPercentage)) }}
                    </div>
                    <UBadge
                      class="@max-3xs/card:text-xs @max-3xs/card:px-1.5 @max-3xs/card:py-0.5"
                      color="primary"
                      :ui="{ base: 'text-sm font-bold ' }"
                      variant="soft"
                    >
                      {{ item.model.discount.discountPercentage }}%
                    </UBadge>
                    <span class="@max-3xs/card:text-xs text-sm line-through text-(--ui-text-muted)">{{ item.model.price }}</span>
                  </div>
                  <div
                    v-else
                    class="text-subheading font-normal @max-xs:text-base-max @max-2xs:text-sm-max"
                  >
                    {{ formatPrice(item.model.price) }}
                  </div>
                </div>
              </div>
              <div
                v-else
                class=""
              >
                set
              </div>
            </template>
          </div>
          <h6
            v-else
            class="grid grid-rows-[repeat(7,auto)] h-full w-full items-center justify-center "
          >
            <div class="[grid-row:3] flex flex-col items-center">
              <span class="text-subheading">Пока тут пусто</span>
              <UButton
                class="w-fit mt-6"
                color="neutral"
                to="/catalog"
                variant="soft"
              >
                В каталог
              </UButton>
            </div>
          </h6>
        </template>
      </div>
    </main>
    <aside
      v-if="status === 'success' && cartItems.length"
      class="mt-8 bg-(--ui-bg-muted) rounded-xl p-10 w-[400px]"
    >
      <div class="grid grid-cols-2 gap-x-6">
        <span>Товары · 2 шт</span>
        <span class="justify-self-end">{{ formatPrice(2500) }}</span>
        <span class="text-sm mt-2">Скидка</span>
        <span class="justify-self-end text-sm mt-2">{{ formatPrice(-1200) }}</span>
        <span class="text-sm mt-1">Купон</span>
        <span class="justify-self-end text-sm mt-1">{{ formatPrice(0) }}</span>
        <span class="text-subheading mt-4">Итого</span>
        <span class="text-subheading justify-self-end mt-4">{{ formatPrice(1300) }}</span>
      </div>

      <UButton
        class="mt-6 w-full justify-center"
        size="giga"
      >
        Перейти к оплате
      </UButton>

      <UForm>
        <UFormField
          class="mt-4"
          error="Неверный купон"
          label="Купон"
        >
          <div class="flex gap-x-2">
            <UInput class="w-full" />
            <UButton
              class="w-11 justify-center aspect-square"
              color="neutral"
              icon="i-lucide-check"
              variant="outline"
            />
          </div>
        </UFormField>
      </UForm>
    </aside>
  </div>
</template>
