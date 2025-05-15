<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useAdminModelsPreview, type AdminModelPreview } from './model'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { getPriceAfterDiscount, formatPrice } from '~/src/shared/lib/price'
import { NuxtImg, ULink } from '#components'
import { imageUrl } from '~/src/shared/lib/image'

const { models, status } = useAdminModelsPreview()

const columns: TableColumn<AdminModelPreview>[] = [
  {
    id: 'id',
    header: 'Id',
    cell: ({ row }) => h('div', { class: 'font-mono' }, row.original.id),
  },
  {
    id: 'image',
    header: 'Картинка',
  },
  {
    id: 'name',
    header: 'Название',
    cell: ({ row }) => h(ULink, { to: `/admin/models/${row.original.slug}` }, row.original.name),
  },
  {
    id: 'slug',
    header: 'Slug',
    cell: ({ row }) => row.original.slug,
  },
  {
    id: 'category',
    header: 'Категория',
    cell: ({ row }) => row.original.category.name,
  },
  {
    id: 'price',
    header: 'Цена без скидки',
    cell: ({ row }) => formatPrice(row.original.price),
  },
  {
    id: 'discount',
    header: 'Скидка',
    cell: ({ row }) => row.original.discount?.label,
  },
  {
    id: 'discount %',
    header: '%  ',
    cell: ({ row }) => h('span', { class: 'text-primary font-semibold' }, row.original.discount?.discountPercentage),
  },
  {
    id: 'price',
    header: 'Цена',
    cell: ({ row }) => {
      const price = row.original.price
      const discountPercentage = row.original.discount?.discountPercentage
      const priceAfterDiscount = discountPercentage ? getPriceAfterDiscount(price, discountPercentage) : price
      return formatPrice(priceAfterDiscount)
    },
  },
]
</script>

<template>
  <main class="container">
    <PageHeading>Модели</PageHeading>
    <ContentLoader v-if="status === 'pending'" />
    <ContentLoaderError v-else-if="status === 'error'" />
    <div v-else>
      <UTable
        class="overflow-auto"
        :data="models"
        :columns
      >
        <template #image-cell="{ row }">
          <NuxtImg
            :src="row.original.images[0]!.url || imageUrl(row.original.images[0]!)"
            class="max-w-30 h-auto w-auto aspect-square"
          />
        </template>
      </UTable>
    </div>
  </main>
</template>
