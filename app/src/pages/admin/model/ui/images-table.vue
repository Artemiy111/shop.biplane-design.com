<script setup lang="ts">
import { ChevronDownIcon, GripVerticalIcon, LinkIcon } from 'lucide-vue-next'
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable'

import ImagesTableActions from './images-table-actions.vue'
import { imageUrl, mimeToExt } from '~/src/shared/lib/image'
import { useUpdateModelImageOrderMutation } from '~/src/shared/models/mutations'
import type { ModelDto } from '~/src/shared/models/queries'
import { dateFormatter } from '~/src/shared/lib/date-formatter'
import { getReadableSize } from '~/src/shared/lib/get-readable-size'
import { FancyId } from '~/src/shared/ui/kit/fancy-id'

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
type ImageForTableOptimized = ImageForTableOriginal['optimized'][number]
type ImageForTable = ImageForTableOriginal | ImageForTableOptimized
const isOriginal = (image: ImageForTable): image is ImageForTableOriginal => ('optimized' in image)
const isOptimized = (image: ImageForTable): image is ImageForTableOptimized => !('optimized' in image)

useSortable('.sortable-body', imagesForTable, {
  handle: '[data-sortable]',
  draggable: 'tr:has([data-main-row])',
  animation: 150,
  onUpdate: (e) => {
    const el = e.item.querySelector('[data-sortable]') as HTMLElement
    const id = el.getAttribute('data-sortable') as string
    const oldIndex = e.oldIndex!
    const newIndex = e.newIndex!
    const currOrder = oldIndex + 1
    const newOrder = newIndex + 1

    onUpdateImageOrder(model.value.id, id, newOrder)
    nextTick(() => {
      const makeImages = () => {
        const imgs = [...model.value.images]
        if (newOrder === currOrder) return imgs
        else if (newOrder > currOrder) {
          imgs.forEach((img) => {
            if (img.imageToModel.sortOrder > currOrder && img.imageToModel.sortOrder <= newOrder) img.imageToModel.sortOrder -= 1
          })
        }
        else {
          imgs.forEach((img) => {
            if (img.imageToModel.sortOrder >= newOrder && img.imageToModel.sortOrder < currOrder) img.imageToModel.sortOrder += 1
          })
        }
        imgs[oldIndex]!.imageToModel.sortOrder = newOrder
        return imgs
      }
      const qc = useQueryCache()
      qc.setQueryData(['models', { slug: model.value.slug }], { ...model.value, images: makeImages() })
    })
  },
})

const imagesTableRef = useTemplateRef('imagesTableRef')

const imagesTableColumns: TableColumn<ImageForTable>[] = [
  {
    id: 'sortOrder',
    accessorFn: row => isOriginal(row) ? row.imageToModel.sortOrder : row.original.imageToModel.sortOrder,
    header: '№',
    enableHiding: false,
    cell: '',
  },
  {
    id: 'id',
    accessorFn: row => isOriginal(row) ? row.id : row.original.id,
    header: 'Id',
    cell: ({ row }) => h(FancyId, { id: row.original.id }),
  },
  {
    id: 'img',
    header: 'Картинка',
  },
  {
    accessorKey: 'originalFilename',
    header: 'Имя файла',
  },
  {
    id: 'isGrouped',
    enableHiding: false,
  },
  {
    accessorKey: 'alt',
    header: 'Подпись',
    cell: ({ row }) => isOriginal(row.original) ? row.original.alt : '',
  },
  {
    accessorKey: 'mimeType',
    header: 'Ext',
    cell: ({ row }) => h('p', { class: 'w-[4ch]' }, mimeToExt(row.original.mimeType)),
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
    id: 'actions',
    header: '',
    enableHiding: false,
  },
]

const columnPinning = ref({
  left: ['sortOrder'],
  right: ['actions'],
})
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
    :sorting="[{ id: 'sortOrder', desc: false }]"
    :get-row-id="row => row.id"
    :column-pinning="columnPinning"
    class="border-(--ui-border) border-1 rounded-md"
    :ui="{
      tbody: 'sortable-body',
      th: 'whitespace-nowrap',
      tr: 'has-[[data-sub-row]]:starting:opacity-0 transition-discrete transition-all duration-300',
      td: 'empty:p-0',
    }"
  >
    <template #sortOrder-cell="{ row }">
      <div
        v-if="isOriginal(row.original)"
        class="flex items-center gap-x-2"
        :data-sortable="row.original.id"
        data-main-row
        @pointerdown="row.toggleExpanded(false)"
      >
        <UButton
          variant="ghost"
          color="neutral"
          square
          class="not-hover:text-(--ui-text-dimmed)"
        >
          <GripVerticalIcon
            absolute-stroke-width
            :stroke-width="1.5"
            class="size-6"
          />
        </UButton>
        {{ row.original.imageToModel.sortOrder }}
      </div>
      <div
        v-else
        data-sub-row
      />
    </template>

    <template #originalFilename-cell="{ row }">
      <div class="max-w-60 truncate hover:relative hover:overflow-auto scrollbar-thin">
        {{ isOriginal(row.original) ? row.original.originalFilename : '' }}
      </div>
    </template>

    <template #img-cell="{ row }">
      <div
        v-if="isOriginal(row.original)"
        class="bg-black/1 w-max"
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
          absolute-stroke-width
          :stroke-width="1.5"
          class="size-6 transition duration-100"
          :class="[row.getIsExpanded() && 'rotate-180']"
        />
        <!-- <ChevronUpIcon
          v-else
          absolute-stroke-width
          :stroke-width="1.5"
          class="size-6"
        /> -->
      </UButton>
    </template>

    <template #actions-cell="{ row }">
      <ImagesTableActions
        v-if="isOriginal(row.original)"
        :model="model"
        :image="row.original"
      />
      <UButton
        v-else-if="isOptimized(row.original)"
        square
        variant="ghost"
        color="neutral"
        :to="imageUrl({ imageId: row.original.imageId, width: row.original.width, mimeType: row.original.mimeType })"
        target="_blank"
        rel="noopener noreferrer"
        class="not-hover:text-(--ui-text-dimmed)"
      >
        <LinkIcon
          absolute-stroke-width
          :stroke-width="1.5"
          class="size-6"
        />
      </UButton>
    </template>
  </UTable>
</template>
