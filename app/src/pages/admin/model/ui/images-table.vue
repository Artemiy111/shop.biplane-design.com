<script setup lang="ts">
import { ArrowUpIcon, ArrowDownIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import type { TableColumn } from '@nuxt/ui'
import ImagesTableActions from './images-table-actions.vue'
import { imageUrl } from '~/src/shared/lib/image'
import { useUpdateModelImageOrderMutation } from '~/src/shared/models/mutations'
import type { ModelDto } from '~/src/shared/models/queries'
import { dateFormatter } from '~/src/shared/lib/date-formatter'
import { getReadableSize } from '~/src/shared/lib/get-readable-size'

const props = defineProps<{
  model: ModelDto
}>()

const { model } = toRefs(props)

const { updateImageOrder } = useUpdateModelImageOrderMutation(model)

const onUpdateImageOrder = async (modelId: string, imageId: string, newSortOrder: number) => {
  try {
    await updateImageOrder({ modelId: modelId, imageId, newSortOrder })
  }
  // eslint-disable-next-line no-empty
  catch (_) {}
}

const imagesForTable = computed(() => model.value.images
  ? model.value.images.flatMap((image) => {
      return {
        ...image,
        optimized: image.optimized.map(o => ({ ...o, original: image })),
      }
    })
  : [])

type ImageForTableOriginal = typeof imagesForTable.value[number]
type ImageForTable = ImageForTableOriginal | ImageForTableOriginal['optimized'][number]
const isOriginal = (image: ImageForTable): image is ImageForTableOriginal => ('optimized' in image)
// const isOptimized = (image: ImageForTable): ImageOptimizedDb => !('optimized' in image)

const imagesTableRef = useTemplateRef('imagesTableRef')

const imagesTableColumns: TableColumn<ImageForTable>[] = [
  {
    id: 'sortOrder',
    header: '№',
    enableHiding: false,
  },
  {
    id: 'id',
    accessorFn: row => isOriginal(row) ? row.id : row.original.id,
    header: 'Id',
    cell: ({ row }) => h('div', { class: 'font-mono' }, row.original.id),
  },
  {
    id: 'img',
    header: 'Картинка',
  },
  {
    accessorKey: 'originalFilename',
    header: 'Имя файла',
    cell: ({ row }) => isOriginal(row.original) ? row.original.originalFilename : '',
  },
  {
    id: 'isGrouped',
    header: 'Мини',
  },
  {
    accessorKey: 'alt',
    header: 'Подпись',
    cell: ({ row }) => isOriginal(row.original) ? row.original.alt : '',
  },
  {
    accessorKey: 'mimeType',
    header: 'Mime',
    cell: ({ row }) => row.original.mimeType,
  },
  {
    accessorKey: 'width',
    header: 'Ширина',
    cell: ({ row }) => row.original.width,
  },
  {
    accessorKey: 'height',
    header: 'Высота',
    cell: ({ row }) => row.original.height,
  },
  {
    accessorKey: 'size',
    header: 'Размер',
    cell: ({ row }) => row.original.size ? getReadableSize(row.original.size) : '',
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата загрузки',
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    header: '',
    id: 'actions',
    enableHiding: false,
  },
]
</script>

<template>
  <UDropdownMenu
    :items="imagesTableRef?.tableApi?.getAllColumns().filter(column => column.getCanHide()).map(column => ({
      label: column.columnDef.header as string,
      type: 'checkbox' as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        imagesTableRef?.tableApi?.getColumn(column.id)?.toggleVisibility(checked)
      },
      onSelect(e?: Event) {
        e?.preventDefault()
      },
    }))"
    :content="{ align: 'end' }"
  >
    <UButton
      label="Колонки"
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-down"
      class="ml-auto"
    />
  </UDropdownMenu>

  <UTable
    ref="imagesTableRef"
    :data="imagesForTable"
    :get-sub-rows="(row) => {
      if (isOriginal(row)) return row.optimized
      return undefined
    }"
    :columns="imagesTableColumns"
    class="border-(--ui-border) border-1 rounded-md "
    :ui="{
      td: 'empty:p-0',
    }"
  >
    <template #sortOrder-cell="{ row }">
      <div
        v-if="isOriginal(row.original)"
        class="flex items-center gap-x-2"
      >
        <UButton
          variant="ghost"
          color="neutral"
          square
          :disabled="row.original.imageToModel.sortOrder === 1"
          @click="onUpdateImageOrder(model.id, row.original.id, row.original.imageToModel.sortOrder - 1)"
        >
          <ArrowUpIcon
            absolute-stroke-width
            :stroke-width="1.5"
            class="size-6"
          />
        </UButton>

        {{ row.original.imageToModel.sortOrder }}

        <UButton
          variant="ghost"
          color="neutral"
          square
          :disabled="row.original.imageToModel.sortOrder === model.images.length"
          @click="onUpdateImageOrder(model.id, row.original.id, row.original.imageToModel.sortOrder + 1)"
        >
          <ArrowDownIcon
            absolute-stroke-width
            :stroke-width="1.5"
            class="size-6"
          />
        </UButton>
      </div>
    </template>

    <template #img-cell="{ row }">
      <div
        v-if="isOriginal(row.original)"
        class="bg-black/1"
      >
        <NuxtImg
          class="w-40 mix-blend-multiply aspect-square"
          :src="row.original.url ? row.original.url : imageUrl(row.original)"
          :alt="row.original.alt || ''"
        />
      </div>
    </template>

    <template #isGrouped-cell="{ row }">
      <UButton
        v-if="isOriginal(row.original) && row.original.optimized.length > 1"
        variant="ghost"
        color="neutral"
        square
        @click="row.toggleExpanded()"
      >
        <ChevronDownIcon
          v-if="!row.getIsExpanded()"
          absolute-stroke-width
          :stroke-width="1.5"
          class="size-6"
        />
        <ChevronUpIcon
          v-else
          absolute-stroke-width
          :stroke-width="1.5"
          class="size-6"
        />
      </UButton>
    </template>

    <template #actions-cell="{ row }">
      <ImagesTableActions
        v-if="isOriginal(row.original)"
        :model="model"
        :image="row.original"
      />
    </template>
  </UTable>
</template>
