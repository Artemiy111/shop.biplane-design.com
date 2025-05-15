<script setup lang="ts">
import { EditIcon, TrashIcon, EllipsisVerticalIcon, LinkIcon } from 'lucide-vue-next'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ImageDbWithOptimized } from '~~/server/db/schema'
import { updateImageSchema, type UpdateImageSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelImageMutation, useDeleteModelImageMutation } from '~/src/shared/models/mutations'
import { imageUrl } from '~/src/shared/lib/image'

const props = defineProps<{
  model: { id: string, slug: string }
  image: ImageDbWithOptimized
}>()

const { model, image } = toRefs(props)

const editForm = useTemplateRef('editForm')
const isEditModalOpen = ref(false)
const isDeleteOpen = ref(false)

const editState = ref<UpdateImageSchema>({
  id: image.value.id,
  originalFilename: image.value.originalFilename,
  alt: image.value.alt,
})
watchDeep(image, () => {
  editState.value = {
    id: image.value.id,
    originalFilename: image.value.originalFilename,
    alt: image.value.alt,
  }
})

const { updateImage } = useUpdateModelImageMutation(model)
const { deleteImage } = useDeleteModelImageMutation(model)

const onUpdateImage = async (event: FormSubmitEvent<UpdateImageSchema>) => {
  await updateImage(event.data)
  isEditModalOpen.value = false
  console.log(isEditModalOpen.value)
}

// const closeEditModal = (value: boolean) => {
//   console.log(value)
//   isEditModalOpen.value = value
// }

const onDeleteImage = async () => {
  await deleteImage(image.value.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <UPopover
    :ui="{ content: 'p-4' }"
  >
    <UButton
      square
      variant="ghost"
      color="neutral"
    >
      <EllipsisVerticalIcon
        absolute-stroke-width
        :stroke-width="1.5"
        class="size-6"
      />
    </UButton>
    <template #content>
      <div class="flex gap-y-2">
        <UModal
          v-model:open="isEditModalOpen"
        >
          <UButton
            square
            variant="ghost"
            color="neutral"
          >
            <EditIcon
              absolute-stroke-width
              :stroke-width="1.5"
              class="size-6"
            />
          </UButton>
          <template #content>
            <UForm
              ref="editForm"
              :state="editState"
              :schema="updateImageSchema"
              class="flex flex-col gap-y-5 m-8"
              @submit="onUpdateImage"
            >
              <UFormField
                name="originalFilename"
                label="Имя файла"
              >
                <UInput
                  v-model="editState.originalFilename"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                name="alt"
                label="Подпись"
              >
                <UInput
                  v-model="editState.alt"
                  class="w-full"
                />
              </UFormField>
              <UButton
                type="submit"
                color="neutral"
                loading-auto
                class="w-fit "
                :disabled="!!editForm?.errors.length"
              >
                Сохранить
              </UButton>
            </UForm>
          </template>
        </UModal>
        <UModal v-model:open="isDeleteOpen">
          <UButton
            square
            variant="ghost"
            color="neutral"
          >
            <TrashIcon
              absolute-stroke-width
              :stroke-width="1.5"
              class="size-6"
            />
          </UButton>
          <template #content>
            <div class="flex flex-col gap-y-4 m-8">
              Точно хотите удалить картинку?
              <UButton
                type="submit"
                color="error"
                loading-auto
                class="w-fit"
                :disabled="!!editForm?.errors.length"
                @click="onDeleteImage"
              >
                Да
              </UButton>
            </div>
          </template>
        </UModal>
        <UButton
          square
          variant="ghost"
          color="neutral"
          :to="image.url ? image.url : imageUrl(image)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkIcon
            absolute-stroke-width
            :stroke-width="1.5"
            class="size-6"
          />
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
