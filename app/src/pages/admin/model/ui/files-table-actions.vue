<script setup lang="ts">
import { EditIcon, TrashIcon, DownloadIcon, EllipsisVerticalIcon } from 'lucide-vue-next'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FileDb } from '~~/server/db/schema'
import { updateFileSchema } from '~/src/shared/config/validation/db'
import type { UpdateFileSchema } from '~/src/shared/config/validation/db'
import { useUpdateModelFile, useDeleteModelFile } from '~/src/shared/models/mutations'

const { modelSlug, file } = defineProps<{
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
watchDeep(file, () => {
  editState.value = {
    id: file.id,
    originalFilename: file.originalFilename,
  }
})

const { updateFile } = useUpdateModelFile(modelSlug)
const { deleteFile } = useDeleteModelFile(modelSlug)

const onUpdateFile = async (event: FormSubmitEvent<UpdateFileSchema>) => {
  await updateFile(event.data)
  isEditOpen.value = false
}

const onDeleteFile = async () => {
  await deleteFile(file.id)
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
      <div class="flex gap-x-2">
        <UModal v-model:open="isEditOpen">
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
              :schema="updateFileSchema"
              :state="editState"
              @submit="(e) => onUpdateFile(e)"
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
              Точно хотите удалить файл?
              <UButton
                class="w-fit"
                color="error"
                :disabled="!!editForm?.errors.length"
                loading-auto
                type="submit"
                @click="e => onDeleteFile()"
              >
                Да
              </UButton>
            </div>
          </template>
        </UModal>
        <UButton
          color="neutral"
          square
          variant="ghost"
        >
          <DownloadIcon
            absolute-stroke-width
            class="size-6"
            :stroke-width="1.5"
          />
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
