<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { EditIcon, EllipsisVerticalIcon, LinkIcon, TrashIcon } from 'lucide-vue-next'

import { updateImageSchema } from '~/shared/config/validation'
import type { UpdateImageSchema } from '~/shared/config/validation'
import { imageUrl } from '~/shared/lib'
import { useDeleteModelImage, useUpdateModelImage } from '~/shared/model'

import type { ImageDbWithOptimized } from '~server/db/schema'

const { model, image } = defineProps<{
  model: { id: string, slug: string }
  image: ImageDbWithOptimized
}>()

const editForm = useTemplateRef('editForm')
const isEditModalOpen = ref(false)
const isDeleteOpen = ref(false)

const editState = ref<UpdateImageSchema>({
  id: image.id,
  originalFilename: image.originalFilename,
  alt: image.alt,
})

watchDeep(() => image, () => {
  editState.value = {
    id: image.id,
    originalFilename: image.originalFilename,
    alt: image.alt,
  }
})

const { updateImage } = useUpdateModelImage(model)
const { deleteImage } = useDeleteModelImage(model)

const onUpdateImage = async (event: FormSubmitEvent<UpdateImageSchema>) => {
  await updateImage(event.data)
  isEditModalOpen.value = false
}

// const closeEditModal = (value: boolean) => {
//   isEditModalOpen.value = value
// }

const onDeleteImage = async () => {
  await deleteImage(image.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <UPopover
    :ui="{ content: 'p-4' }"
  >
    <UButton
      color="neutral"
      square
      variant="ghost"
    >
      <EllipsisVerticalIcon
        absolute-stroke-width
        class="size-6"
        :stroke-width="1.5"
      />
    </UButton>
    <template #content>
      <div class="flex gap-y-2">
        <UModal
          v-model:open="isEditModalOpen"
        >
          <UButton
            color="neutral"
            square
            variant="ghost"
          >
            <EditIcon
              absolute-stroke-width
              class="size-6"
              :stroke-width="1.5"
            />
          </UButton>
          <template #content>
            <UForm
              ref="editForm"
              class="flex flex-col gap-y-5 m-8"
              :schema="updateImageSchema"
              :state="editState"
              @submit="e => onUpdateImage(e)"
            >
              <UFormField
                label="Имя файла"
                name="originalFilename"
              >
                <UInput
                  v-model="editState.originalFilename"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Подпись"
                name="alt"
              >
                <UInput
                  v-model="editState.alt"
                  class="w-full"
                />
              </UFormField>
              <UButton
                class="w-fit "
                color="neutral"
                :disabled="!!editForm?.errors.length"
                loading-auto
                type="submit"
              >
                Сохранить
              </UButton>
            </UForm>
          </template>
        </UModal>
        <UModal v-model:open="isDeleteOpen">
          <UButton
            color="neutral"
            square
            variant="ghost"
          >
            <TrashIcon
              absolute-stroke-width
              class="size-6"
              :stroke-width="1.5"
            />
          </UButton>
          <template #content>
            <div class="flex flex-col gap-y-4 m-8">
              Точно хотите удалить картинку?
              <UButton
                class="w-fit"
                color="error"
                :disabled="!!editForm?.errors.length"
                loading-auto
                type="submit"
                @click="() => onDeleteImage()"
              >
                Да
              </UButton>
            </div>
          </template>
        </UModal>
        <UButton
          color="neutral"
          rel="noopener noreferrer"
          square
          target="_blank"
          :to="image.url ? image.url : imageUrl(image)"
          variant="ghost"
        >
          <LinkIcon
            absolute-stroke-width
            class="size-6"
            :stroke-width="1.5"
          />
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
