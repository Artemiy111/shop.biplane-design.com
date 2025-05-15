<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import { parseDate, type DateValue } from '@internationalized/date'
import { EllipsisVerticalIcon } from 'lucide-vue-next'
import FilesTableActions from './ui/files-table-actions.vue'
import ImagesTableActions from './ui/images-table-actions.vue'
import { revitVersions } from '~/src/shared/config/constants'
import { updateModelSchema, type UpdateModelSchema } from '~/src/shared/config/validation/db'
import { useSelectModelDiscountMutation, useUpdateModelImageOrderMutation, useUpdateModelMutation, useUploadModelImageMutation } from '~/src/shared/models/mutations'
import { useCategoriesSimple, useDiscounts, useModelBySlug } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import type { FileDb } from '~~/server/db/schema'
import { dateFormatter } from '~/src/shared/lib/date-formatter'
import { ModelCard } from '~/src/shared/ui/blocks/model-card'
import { imageUrl } from '~/src/shared/lib/image'

const { slug } = defineProps<{
  slug: string
}>()

const isDiscountActive = (discount: { startDate: string | null, endDate: string | null }) => {
  const today = new Date().toISOString().split('T')[0]!
  if (!discount.startDate && !discount.endDate) return true
  else if (discount.startDate && discount.endDate && discount.startDate <= today && today <= discount.endDate) return true
  return false
}

const { categories } = useCategoriesSimple()
const categoriesSelect = computed(() => categories.value.map(category => ({
  label: category.name,
  value: category.id,
})))

const { discounts } = useDiscounts()
const discountDates = computed(() => discounts.value.map((discount) => {
  const start = discount.startDate ? parseDate(discount.startDate) : undefined
  const end = discount.endDate ? parseDate(discount.endDate) : undefined
  return {
    ...discount,
    start,
    end,
    isActive: isDiscountActive(discount),
  }
}).toSorted((a, b) => a.discountPercentage - b.discountPercentage))

type DiscountDate = typeof discountDates.value[0]

const { model, status, refresh } = useModelBySlug(toRef(() => slug))

const getDayDiscounts = (day: DateValue) => {
  return discountDates.value.filter((d) => {
    if (!d.start && !d.end) return true
    else if (d.start && d.end && d.start.compare(day) <= 0 && day.compare(d.end) <= 0) return true
    return false
  })
}

const { updateModel } = useUpdateModelMutation(() => slug)
const form = useTemplateRef('form')
const state = ref<Partial<UpdateModelSchema>>({})

watchImmediate(model, () => {
  if (!model.value) return
  state.value = {
    id: model.value.id,
    categoryId: model.value.categoryId,
    name: model.value.name,
    slug: model.value.slug,
    description: model.value.description,
    price: model.value.price,
    revitVersion: model.value.revitVersion,
    discountId: model.value.discountId,
  }
})

const onUpdateModel = async (event: FormSubmitEvent<UpdateModelSchema>) => {
  try {
    await updateModel(event.data)
    if (event.data.slug !== slug) navigateTo(`/admin/models/${event.data.slug}`)
  }
  // eslint-disable-next-line no-empty
  catch (_) {}
}

const filesTable: TableColumn<FileDb>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => row.getValue('id'),
  },
  {
    accessorKey: 'originalFilename',
    header: 'Имя файла',
    cell: ({ row }) => row.getValue('originalFilename'),
  },
  {
    accessorKey: 'mimeType',
    header: 'Mime Тип',
    cell: ({ row }) => row.getValue('mimeType'),
  },
  {
    accessorKey: 'size',
    header: 'Размер в байтах',
    cell: ({ row }) => row.getValue('size'),
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата загрузки',
    cell: ({ row }) => dateFormatter.format(new Date(row.getValue<string>('createdAt'))),
  },
  {
    id: 'actions',
  },
]

const selectedDay = ref<DateValue | null>(null)
const { selectDiscount } = useSelectModelDiscountMutation(() => slug)

const onSelectDiscount = async (discountId: string | null) => {
  try {
    await selectDiscount(discountId)
  }
  finally {
    selectedDay.value = null
  }
}

const discountViewTab = ref<'table' | 'calendar'>('table')

const discountsTable: TableColumn<DiscountDate>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => {
      if (row.original.id === model.value?.discountId) row.toggleSelected(true)
      else row.toggleSelected(false)
      return row.original.id
    },
  },
  {
    accessorKey: 'discountPercentage',
    header: '%',
    cell: ({ row }) => `${row.getValue('discountPercentage')}%`,
  },
  {
    accessorKey: 'label',
    header: 'Название',
    cell: ({ row }) => row.getValue('label'),
  },
  {
    accessorFn: row => ({ startDate: row.startDate, endDate: row.endDate }),
    header: 'Период действия',
    cell: ({ row }) => {
      const start = row.original.startDate
      const end = row.original.endDate
      if (!start && !end) return 'Бессрочно'
      else if (start && end) return dateFormatter.formatRange(new Date(start), new Date(end))
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Действует',
    cell: ({ row }) => row.original.isActive ? 'Да' : 'Нет',
    sortingFn: (a, b) => {
      return a.original.isActive && b.original.isActive ? 0 : a.original.isActive ? -1 : 1
    },
  },
  {
    id: 'actions',
  },
]

const images = computed(() => model.value?.images || [])

type ImageDbWithOptimized = Exclude<typeof model.value, undefined | null>['images'][0]

const imagesTable: TableColumn<ImageDbWithOptimized>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'img',
    header: 'Картинка',
  },
  {
    accessorKey: 'originalFilename',
    header: 'Имя файла',
    cell: ({ row }) => row.original.originalFilename,
  },
  {
    accessorKey: 'alt',
    header: 'Подпись',
    cell: ({ row }) => row.original.alt,
  },
  {
    accessorKey: 'mimeType',
    header: 'Mime Тип',
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
    header: 'Размер/Б',
    cell: ({ row }) => row.original.size,
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата загрузки',
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    id: 'actions',
  },
]

const { uploadImage } = useUploadModelImageMutation(model)

const isUploading = ref(false)
const filesString = ref('')
const onUploadImage = async (event: Event) => {
  isUploading.value = true
  console.log(filesString.value)
  const target = event.target as HTMLInputElement
  const images = Array.from(target.files!)
  if (!images.length || !model.value) return
  const modelId = model.value.id

  await Promise.allSettled(images.map(async (image) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('modelId', modelId)
    console.log(formData)
    await uploadImage(formData)
  }))
  isUploading.value = false
  filesString.value = ''
}

const { updateImageOrder } = useUpdateModelImageOrderMutation(model)

const onUpdateImageOrder = async (modelId: string, imageId: string, newSortOrder: number) => {
  try {
    await updateImageOrder({ modelId: modelId, imageId, newSortOrder })
  }
  catch (_) {}
}
</script>

<template>
  <main class="container">
    <ContentLoader
      v-if="status === 'pending'"
      @refresh="refresh"
    />
    <ContentLoaderError v-else-if="status === 'error'" />
    <div
      v-else-if="status === 'success' && model"
      class=""
    >
      <PageHeading>{{ model.name }}</PageHeading>

      <div class="flex flex-col gap-y-12 mt-6">
        <div class="grid grid-cols-[400px_minmax(0,1fr)] gap-16">
          <section class="flex flex-col gap-y-4">
            <h2 class="text-subheading">
              Параметры
            </h2>
            <UForm
              ref="form"
              :state="state"
              :schema="updateModelSchema"
              class="flex flex-col gap-y-5"
              @submit="onUpdateModel"
            >
              <UFormField
                name="name"
                label="Название"
              >
                <UInput
                  v-model="state.name"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="slug"
                label="Slug"
              >
                <UInput
                  v-model="state.slug"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="description"
                label="Описание"
              >
                <UTextarea
                  v-model="state.description"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="price"
                label="Цена"
              >
                <UInput
                  v-model="state.price"
                  type="number"
                  class="w-full"
                  :step="100"
                  :min="0"
                  :max="100_000"
                />
              </UFormField>

              <UFormField
                name="revitVersion"
                label="Версия Revit"
              >
                <USelect
                  v-model="state.revitVersion"
                  :items="revitVersions as unknown as any[]"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="categoryId"
                label="Категория"
              >
                <USelect
                  v-model="state.categoryId"
                  :items="categoriesSelect"
                  class="w-full"
                />
              </UFormField>

              <UButton
                type="submit"
                color="neutral"
                loading-auto
                class="w-fit mt-5"
                :disabled="!!form?.errors.length"
              >
                Сохранить
              </UButton>
            </UForm>
          </section>

          <ModelCard
            :model="model"
            class="max-w-140"
          />
        </div>

        <section class="flex flex-col gap-y-4">
          <h2 class="text-subheading">
            Файлы
          </h2>

          <UTable
            :data="model.files"
            :columns="filesTable"
            class="overflow-x-auto"
          >
            <template #actions-cell="{ row }">
              <FilesTableActions
                :model-slug="model.slug"
                :file="row.original as FileDb"
              />
            </template>
          </UTable>
        </section>

        <section class="col-span-2 flex flex-col gap-y-4">
          <div class="flex justify-between items-baseline gap-x-6">
            <div class="flex gap-x-4">
              <h2 class="text-subheading">
                Скидки
              </h2>
              <UButton
                v-if="model.discountId"
                variant="soft"
                color="neutral"
                loading-auto
                size="sm"
                @click="onSelectDiscount(null)"
              >
                Убрать
              </UButton>
            </div>
            <UTabs
              v-model="discountViewTab"
              color="neutral"
              :ui="{
                indicator: 'bg-(--ui-bg)',
                trigger: 'data-[state=active]:text-(--ui-text)',
              }"
              :items="[{ icon: 'i-lucide-list', value: 'table' }, { icon: 'i-lucide-calendar', value: 'calendar' }]"
            />
          </div>
          <UTable
            v-if="discountViewTab === 'table'"
            :data="discountDates"
            :columns="discountsTable"
            :sorting="[{ id: 'isActive', desc: false }]"
          >
            <template #actions-cell="{ row }">
              <UButton
                variant="soft"
                color="neutral"
                loading-auto
                size="sm"
                :disabled="!row.original.isActive"
                @click="onSelectDiscount(row.original.id)"
              >
                Выбрать
              </UButton>
            </template>
          </UTable>

          <UCalendar
            v-else
            :year-controls="false"
            :ui="{ root: 'w-full', headCell: 'text-start', cell: '@container/cell grid justify-center', cellTrigger: 'w-[100cqw] m-0 h-10 p-2 rounded-lg' }"
          >
            <template #day="{ day }">
              <UPopover>
                <div class="grid grid-cols-[24px_1fr] gap-x-2 w-full justify-start items-baseline">
                  <span class="text-start">{{ day.day }}</span>
                  <div class="flex gap-x-1">
                    <div
                      v-for="discount in getDayDiscounts(day)"
                      :key="discount.id"
                      class="text-xs"
                    >
                      {{ discount.discountPercentage }}%
                    </div>
                  </div>
                </div>
                <template #content>
                  <div class="grid grid-cols-[repeat(4,max-content)] gap-x-4 gap-y-6 p-8">
                    <div
                      v-for="discount in getDayDiscounts(day)"
                      :key="discount.id"
                      class="grid grid-cols-subgrid col-span-4 w-fit items-center"
                      :class="{ 'text-(--ui-text-dimmed)': !discount.isActive }"
                    >
                      <span>{{ discount.discountPercentage }}%</span>
                      <span>{{ discount.label }}</span>
                      <span v-if="!discount.startDate && !discount.endDate">
                        Бессрочно
                      </span>
                      <span v-else-if="discount.startDate && discount.endDate">
                        {{ dateFormatter.formatRange(new Date(discount.startDate), new Date(discount.endDate)) }}
                      </span>
                      <UButton
                        variant="soft"
                        size="sm"
                        color="neutral"
                        loading-auto
                        :disabled="!discount.isActive"
                        @click="onSelectDiscount(discount.id)"
                      >
                        Выбрать
                      </UButton>
                    </div>
                  </div>
                </template>
              </UPopover>
            </template>
          </UCalendar>
        </section>

        <section class="flex flex-col gap-y-4 col-span-2">
          <h2 class="text-subheading">
            Картинки
          </h2>

          <UInput
            v-model="filesString"
            type="file"
            accept="image/*"
            class="w-full"
            multiple
            :loading="isUploading"
            @change="onUploadImage"
          />

          <UTable
            :data="images"
            :columns="imagesTable"
          >
            <template #img-cell="{ row }">
              <div class="bg-black/1 ">
                <NuxtImg
                  class="w-40 mix-blend-multiply"
                  :src="row.original.url ? row.original.url : imageUrl(row.original)"
                  :alt="row.original.alt || ''"
                />
              </div>
            </template>
            <template #actions-cell="{ row }">
              <ImagesTableActions
                :model="model"
                :image="row.original"
              />
            </template>
          </UTable>
        </section>
      </div>
    </div>
  </main>
</template>
