<script setup lang="ts">
import { EditIcon, TrashIcon, DownloadIcon, EllipsisVerticalIcon } from 'lucide-vue-next'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FileDb } from '~~/server/db/schema'
import { updateFileSchema, type UpdateFileSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelFileMutation, useDeleteModelFileMutation } from '~/src/shared/models/mutations'

const props = defineProps<{
  modelSlug: string
  file: FileDb
}>()

const { modelSlug, file } = toRefs(props)

const editForm = useTemplateRef('editForm')
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const editState = ref<UpdateFileSchema>({
  id: file.value.id,
  originalFilename: file.value.originalFilename,
})
watchDeep(file, () => {
  editState.value = {
    id: file.value.id,
    originalFilename: file.value.originalFilename,
  }
})

const { updateFile } = useUpdateModelFileMutation(modelSlug)
const { deleteFile } = useDeleteModelFileMutation(modelSlug)

const onUpdateFile = async (event: FormSubmitEvent<UpdateFileSchema>) => {
  await updateFile(event.data)
  isEditOpen.value = false
}

const onDeleteFile = async () => {
  await deleteFile(file.value.id)
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
              @submit="onUpdateFile"
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
              Точно хотите удалить файл?
              <UButton
                type="submit"
                color="error"
                loading-auto
                class="w-fit"
                :disabled="!!editForm?.errors.length"
                @click="onDeleteFile"
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
        >
          <DownloadIcon
            absolute-stroke-width
            :stroke-width="1.5"
            class="size-6"
          />
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
