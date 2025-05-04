<script setup lang="ts">
import { useModelBySlug } from '~/src/shared/models/queries'
import { ContentLoader } from '~/src/shared/ui/blocks/content-loader'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

const { slug } = defineProps<{
  slug: string
}>()

const { model, modelSlug, status, refresh } = useModelBySlug()
watchSyncEffect(() => {
  modelSlug.value = slug
})
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
    </div>
  </main>
</template>
