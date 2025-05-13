<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import { parseDate, type DateValue } from '@internationalized/date'
import ChangeFileButton from './ui/change-file-button.vue'
import { revitVersions } from '~/src/shared/config/constants'
import { updateModelSchema, type UpdateModelSchema } from '~/src/shared/config/validation/db'
import { useSelectModelDiscountMutation, useUpdateModelMutation } from '~/src/shared/models/mutations'
import { useCategoriesSimple, useDiscounts, useModelBySlug } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import type { FileDb } from '~~/server/db/schema'
import { dateFormatter } from '~/src/shared/lib/date-formatter'

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

const { model, status, refresh } = useModelBySlug(() => slug)

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
    enableSorting: true,
    sortingFn: (a, b) => a.original.isActive && b.original.isActive ? 0 : a.original.isActive ? 1 : -1,
  },
  {
    id: 'actions',
  },
]
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

      <div class="grid grid-cols-[400px_minmax(0,1fr)] gap-16 mt-6">
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

        <section class="">
          <h2 class="text-subheading">
            Файлы
          </h2>

          <UTable
            :data="model.files"
            :columns="filesTable"
            class="overflow-x-auto"
          >
            <template #actions-cell="{ row }">
              <ChangeFileButton
                :model-slug="model.slug"
                :file="row.original as FileDb"
              />
            </template>
          </UTable>
        </section>

        <section class="col-span-2">
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
                Убрать текущую
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
            class="mt-4"
            :initial-state="{ sorting: [{ id: 'isActive', desc: false }] }"
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
            :ui="{ root: 'w-full mt-4', headCell: 'text-start', cell: '@container/cell grid justify-center', cellTrigger: 'w-[100cqw] m-0 h-10 p-2 rounded-lg' }"
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
      </div>
    </div>
  </main>
</template>
