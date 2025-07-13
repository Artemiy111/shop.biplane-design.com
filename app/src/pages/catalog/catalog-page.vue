<script setup lang="ts">
import { useModels } from '~/src/shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~/src/shared/ui/blocks/content-loader'
// import type { UnwrapRef } from 'vue'
import { ModelCard } from '~/src/shared/ui/blocks/model-card'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'

const props = defineProps<{
  categorySlug?: string
  brandSlug?: string
}>()

const { models, categories, status, refresh } = useModels()

// export type Categories = UnwrapRef<typeof categories>
// export type Model = Categories[0]['models'][0]

const filter = computed(() => {
  if (!categories.value.length || !brands.value.length) return { categorySlug: props.categorySlug, brandSlug: props.brandSlug }

  if (props.categorySlug) {
    const category = categories.value.find(c => c.slug === props.categorySlug)
    if (category) return { categorySlug: props.categorySlug, brandSlug: undefined }
    return { categorySlug: categories.value[0]!.slug, brandSlug: undefined }
  }
  if (props.brandSlug) {
    const brand = brands.value.find(b => b.slug === props.brandSlug)
    if (brand) return { categorySlug: undefined, brandSlug: props.brandSlug }
    return { categorySlug: undefined, brandSlug: brands.value[0]!.slug }
  }

  return { categorySlug: undefined, brandSlug: undefined }
})

const filteredModels = computed(() => {
  if (filter.value.categorySlug) {
    return models.value.filter(m => m.category.slug === filter.value.categorySlug)
  }
  if (filter.value.brandSlug) {
    return models.value.filter(m => 'brand' in m && m.brand.slug === filter.value.brandSlug)
  }
  return models.value
})

type Brand = {
  id: string
  name: string
  slug: string
  // logo: string
}
const brands = ref<Brand[]>([
  { id: '1', name: 'BoConcept', slug: 'boconcept' },
  { id: '2', name: 'Minotti', slug: 'minotti' },
  { id: '3', name: 'B&B Italia', slug: 'bb-italia' },
  { id: '4', name: 'Poltrona Frau', slug: 'poltrona-frau' },
  { id: '5', name: 'Roche Bobois', slug: 'roche-bobois' },
  { id: '6', name: 'Ампир', slug: 'ampir' },
])
</script>

<template>
  <main class="container">
    <PageHeading>Каталог</PageHeading>
    <ContentLoader v-if="status === 'pending'" />
    <ContentLoaderError
      v-else-if="status === 'error'"
      @refresh="() => refresh()"
    />
    <div
      v-else
      class="grid grid-cols-[max-content_1fr] gap-x-12 @container/content"
    >
      <aside class="sticky top-0 self-start flex flex-col gap-y-5">
        <div class="flex flex-col gap-y-1.5">
          <h2 class="font-semibold">
            Категории
          </h2>
          <ul class="flex flex-col gap-y-0">
            <li
              v-for="c in categories"
              :key="c.id"
              class="text-sm"
            >
              <UButton
                active-variant="soft"
                color="neutral"
                size="md"
                :to="`/catalog/c/${c.slug}`"
                variant="ghost"
              >
                {{ c.name }}
              </UButton>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-y-1.5">
          <h2 class="font-semibold">
            Бренды
          </h2>
          <ul class="flex flex-col">
            <li
              v-for="b in brands"
              :key="b.id"
              class="text-sm"
            >
              <UButton
                active-variant="soft"
                color="neutral"
                size="md"
                :to="`/catalog/b/${b.slug}`"
                variant="ghost"
              >
                {{ b.name }}
              </UButton>
            </li>
          </ul>
        </div>
      </aside>

      <div class="grid grid-cols-3 @max-5xl/content:grid-cols-2 gap-(--container-pad) @max-sm/content:gap-4 @max-xs/content:gap-2">
        <ModelCard
          v-for="model in filteredModels"
          :key="model.id"
          :model="model"
        />
      </div>
    </div>
  </main>
</template>
