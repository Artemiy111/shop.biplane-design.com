<script setup lang="ts">
import { EditIcon, TrashIcon, DownloadIcon } from 'lucide-vue-next'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FileDb } from '~~/server/db/schema'
import { updateFileSchema, type UpdateFileSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelFileMutation, useDeleteModelFileMutation } from '~/src/shared/models/mutations'

const { file, modelSlug } = defineProps<{
  modelSlug: string
  file: FileDb
}>()

const editForm = useTemplateRef('editForm')
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const editState = ref<UpdateFileSchema>({
  id: file.id,
  originalFilename: file.originalFilename,
})

const { updateFile } = useUpdateModelFileMutation(() => modelSlug)
const { deleteFile } = useDeleteModelFileMutation(() => modelSlug)

const onEditSubmit = async (event: FormSubmitEvent<UpdateFileSchema>) => {
  await updateFile(event.data)
  isEditOpen.value = false
}

const onDeleteFile = async () => {
  await deleteFile(file.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="flex gap-x-2">
    <UModal v-model:open="isEditOpen">
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
          :schema="updateFileSchema"
          class="flex flex-col gap-y-5 m-8"
          @submit="onEditSubmit"
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
          Вы уверены, что хотите удалить файл?
          <UButton
            type="submit"
            color="error"
            loading-auto
            class="w-fit"
            :disabled="!!editForm?.errors.length"
            @click="onDeleteFile"
          >
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
    <UButton
      square
      variant="ghost"
      color="neutral"
    >
      <DownloadIcon
        absolute-stroke-width
        :stroke-width="1.5"
        class="size-6"
      />
    </UButton>
  </div>
</template>
