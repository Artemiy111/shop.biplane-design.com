<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'

import FilesTableActions from './ui/files-table-actions.vue'
import ImagesTable from './ui/images-table.vue'
import DiscountsSection from './ui/discounts-section.vue'
import { revitVersions } from '~/src/shared/config/constants'
import { updateModelSchema, type UpdateModelSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelMutation, useUploadModelImageMutation } from '~/src/shared/models/mutations'
import { useCategoriesSimple, useModelBySlug, useOptimizedImagesSubscription } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import type { FileDb } from '~~/server/db/schema'
import { dateFormatter } from '~/src/shared/lib/date-formatter'
import { ModelCard } from '~/src/shared/ui/blocks/model-card'
import { getReadableSize } from '~/src/shared/lib/get-readable-size'
import { FancyId } from '~/src/shared/ui/kit/fancy-id'

const props = defineProps<{
  slug: string
}>()

const { slug } = toRefs(props)

const { categories } = useCategoriesSimple()
const categoriesSelect = computed(() => categories.value.map(category => ({
  label: category.name,
  value: category.id,
})))

const { model, status, refresh } = useModelBySlug(slug)

const { updateModel } = useUpdateModelMutation(slug)

const updateModelForm = useTemplateRef('updateModelForm')
const updateModelState = ref<Partial<UpdateModelSchema>>({})

watchImmediate(model, () => {
  if (!model.value) return
  updateModelState.value = {
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
    if (event.data.slug !== slug.value) navigateTo(`/admin/models/${event.data.slug}`)
  }
  // eslint-disable-next-line no-empty
  catch (_) {}
}

const filesTableColumns: TableColumn<FileDb>[] = [
  {
    id: 'id',
    header: 'Id',
    cell: ({ row }) => h(FancyId, { id: row.original.id }),
  },
  {
    id: 'originalFilename',
    header: 'Имя файла',
    cell: ({ row }) => row.original.originalFilename,
  },
  {
    id: 'mimeType',
    header: 'Mime',
    cell: ({ row }) => row.original.mimeType,
  },
  {
    id: 'size',
    header: 'Размер',
    cell: ({ row }) => getReadableSize(row.original.size),
  },
  {
    id: 'createdAt',
    header: 'Дата загрузки',
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    id: 'actions',
  },
]

const { uploadImage } = useUploadModelImageMutation(model)
const { optimizedImagesSubscription, status: subStatus } = useOptimizedImagesSubscription(slug)
onUnmounted(() => optimizedImagesSubscription.unsubscribe())

const isUploading = ref(false)
const filesString = ref('')

const onUploadImage = async (event: Event) => {
  isUploading.value = true
  const target = event.target as HTMLInputElement
  const images = Array.from(target.files!)
  if (!images.length || !model.value) return
  const m = model.value

  await Promise.allSettled(images.map(async (image) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('modelId', m.id)
    formData.append('modelSlug', m.slug)
    await uploadImage(formData)
  }))
  isUploading.value = false
  filesString.value = ''
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
              ref="updateModelForm"
              :state="updateModelState"
              :schema="updateModelSchema"
              class="flex flex-col gap-y-5"
              @submit="onUpdateModel"
            >
              <UFormField
                name="name"
                label="Название"
              >
                <UInput
                  v-model="updateModelState.name"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="slug"
                label="Slug"
              >
                <UInput
                  v-model="updateModelState.slug"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="description"
                label="Описание"
              >
                <UTextarea
                  v-model="updateModelState.description"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="price"
                label="Цена"
              >
                <UInput
                  v-model="updateModelState.price"
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
                  v-model="updateModelState.revitVersion"
                  :items="revitVersions as unknown as any[]"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                name="categoryId"
                label="Категория"
              >
                <USelect
                  v-model="updateModelState.categoryId"
                  :items="categoriesSelect"
                  class="w-full"
                />
              </UFormField>

              <UButton
                type="submit"
                color="neutral"
                loading-auto
                class="w-fit mt-5"
                :disabled="!!updateModelForm?.errors.length"
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
            :columns="filesTableColumns"
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

        <DiscountsSection :model="model" />

        <section class="flex flex-col gap-y-4 col-span-2">
          <h2 class="text-subheading">
            Картинки
          </h2>

          <UInput
            v-model="filesString"
            type="file"
            variant="soft"
            size="lg"
            accept="image/*"
            class="w-full"
            multiple
            :loading="isUploading"
            @change="onUploadImage"
          />

          <ImagesTable
            :model="model"
            :optimized-sub-status="subStatus"
          />
        </section>
      </div>
    </div>
  </main>
</template>
