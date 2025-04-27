<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import { ModelCard } from '~/src/shared/ui/blocks/model-card'
import { PageHeading } from '~/src/shared/ui/blocks/page-heading'
import { useCategories } from '~/src/shared/models/queries'

const { categories } = useCategories()

export type Categories = UnwrapRef<typeof categories>
export type Model = Categories[0]['models'][0]
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
        <div class="grid grid-cols-3 max-lg:grid-cols-2 gap-(--container-pad)">
          <ModelCard
            v-for="model in category.models"
            :key="model.id"
            :model="model"
          />
        </div>
      </div>
    </div>
  </main>
</template>
