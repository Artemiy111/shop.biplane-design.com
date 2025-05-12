<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import ChangeFileButton from './ui/change-file-button.vue'
import { revitVersions } from '~/src/shared/config/constants'
import { updateModelSchema, type UpdateModelSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelMutation } from '~/src/shared/models/mutations'
import { useCategoriesSimple, useModelBySlug } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

import type { FileDb } from '~~/server/db/schema'
import { dateFormatter } from '~/src/shared/lib/date-formatter'

const { slug } = defineProps<{
  slug: string
}>()

const { model, modelSlug, status, refresh } = useModelBySlug()
const { categories } = useCategoriesSimple()
const categoriesSelect = computed(() => categories.value.map(category => ({
  label: category.name,
  value: category.id,
})))
modelSlug.value = slug
// watchSyncEffect(() => {
// modelSlug.value = slug
// })

const { updateModel } = useUpdateModelMutation(toRef(() => slug))

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

const form = useTemplateRef('form')

const onUpdateModel = async (event: FormSubmitEvent<UpdateModelSchema>) => {
  try {
    const slug = model.value!.slug
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

      <div class="grid grid-cols-[500px_1fr] gap-16">
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
        <div class="">
          <h2 class="text-subheading">
            Файлы
          </h2>

          <UTable
            :data="model.files"
            :columns="filesTable"
          >
            <template #actions-cell="{ row }">
              <ChangeFileButton
                :model-slug="model.slug"
                :file="row.original as FileDb"
              />
            </template>
          </UTable>
        </div>
      </div>
    </div>
  </main>
</template>
