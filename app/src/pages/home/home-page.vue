<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import ModelCard from './ui/ModelCard.vue'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'
import { useCategories } from '~/src/shared/models/queries'

const { data: categories, status } = useCategories()

export type Categories = UnwrapRef<typeof categories>
export type Model = Exclude<Categories, undefined>[0]['models'][0]
</script>

<template>
  <main class="container flex flex-col">
    <PageHeading>Каталог</PageHeading>
    <div class="flex flex-col gap-y-8">
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex flex-col gap-y-4 mt-4"
      >
        <h3 class="text-subheading">
          {{ category.name }}
        </h3>
        <div class="grid grid-cols-3 gap-6">
          <ModelCard
            v-for="model in category.models"
            :key="model.id"
            :model="model"
          />
        </div>
      </div>
    </div>
    https://storage.yandexcloud.net/biplane-design/77/4fc4dcf2-7876-4caf-bc99-82b1ea418569.jpeg
    <!-- {{ session }} -->
  </main>
</template>
