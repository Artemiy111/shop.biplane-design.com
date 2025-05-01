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
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => row.getValue('id'),
  },
  {
    accessorKey: 'images',
    header: 'Картинка',
    cell: ({ row }) => {
      const image = row.getValue<AdminModelPreview['images']>('images')[0]!
      return h(NuxtImg, { src: image.url || imageUrl(image), class: 'max-h-20 h-auto w-auto' })
    },
  },
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => {
      const name = row.getValue<AdminModelPreview['name']>('name')
      const slug = row.getValue<AdminModelPreview['slug']>('slug')
      return h(ULink, { to: `/admin/models/${slug}` }, name)
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => row.getValue('slug'),
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    cell: ({ row }) => row.getValue<{ name: string }>('category').name,
  },
  {
    accessorKey: 'price',
    header: 'Цена без скидки',
    cell: ({ row }) => formatPrice(row.getValue<number>('price')),
  },
  {
    accessorKey: 'discount',
    header: 'Скидка',
    cell: ({ row }) => row.getValue<AdminModelPreview['discount']>('discount')?.label,
  },
  {
    accessorKey: 'discount',
    header: '%  ',
    cell: ({ row }) =>
      h('span', { class: 'text-primary font-semibold' },
        row.getValue<AdminModelPreview['discount']>('discount')?.discountPercentage),
  },
  {
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => {
      const price = row.getValue<number>('price')
      const discountPercentage = row.getValue<AdminModelPreview['discount']>('discount')?.discountPercentage
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
      />
    </div>
  </main>
</template>
