<script setup lang="ts">
import { useFavoriteModels } from '~shared/models/queries'
import { ContentLoader, ContentLoaderError } from '~shared/ui/blocks/content-loader'
import { ModelCard } from '~shared/ui/blocks/model-card'
import { PageHeading } from '~shared/ui/blocks/page-heading'

const { favoriteModels, status, refresh } = useFavoriteModels()
</script>

<template>
  <main class="container">
    <PageHeading>Избранное</PageHeading>
    <div class="@container/content h-full">
      <ContentLoader v-if="status === 'pending'" />
      <ContentLoaderError
        v-else-if="status === 'error'"
        @refresh="() => refresh()"
      />

      <template v-else-if="status === 'success'">
        <div
          v-if="favoriteModels.length"
          class="grid grid-cols-3 @max-5xl/content:grid-cols-2 gap-(--container-pad)"
        >
          <ModelCard
            v-for="model in favoriteModels"
            :key="model.id"
            :model="model"
          />
        </div>
        <h6
          v-else
          class="grid grid-rows-[repeat(7,auto)] h-full w-full items-center justify-center "
        >
          <div class="[grid-row:3] flex flex-col items-center">
            <span class="text-subheading">Пока тут пусто</span>
            <UButton
              class="w-fit mt-6"
              color="neutral"
              to="/catalog"
              variant="soft"
            >
              В каталог
            </UButton>
          </div>
        </h6>
      </template>
    </div>
  </main>
</template>
