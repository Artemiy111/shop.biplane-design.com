<script setup lang="ts">
import z from 'zod'
import { revitVersions } from '~/src/shared/config/constants'
import { errorMessages, minMaxString } from '~/src/shared/config/validation/base'
import { useModelBySlug } from '~/src/shared/models/queries'
import { ContentLoader } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

const { slug } = defineProps<{
  slug: string
}>()

const { model, modelSlug, status, refresh } = useModelBySlug()
modelSlug.value = slug
// watchSyncEffect(() => {
// modelSlug.value = slug
// })

const updateModelSchema = z.object({
  categoryId: z.string(),
  name: minMaxString(2, 64),
  slug: minMaxString(2, 128),
  description: z.string().max(1024, { error: errorMessages.maxLength(1024) }).optional(),
  price: z.number().min(0),
  discountId: z.string().optional(),
  revitVersion: z.enum(revitVersions),
})

type UpdateModelSchema = z.infer<typeof updateModelSchema>

const state = ref<Partial<UpdateModelSchema>>({})

const form = useTemplateRef('form')
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

      <section>
        <UForm
          ref="form"
          :state="state"
          :schema="updateModelSchema"
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
            label="Слаг"
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
            <UInput
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
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="revitVersion"
            label="Версия Revit"
          >
            <USelect
              v-model="state.revitVersion"
              :options="revitVersions"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </section>
    </div>
  </main>
</template>
