<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import ModelCard from './ui/ModelCard.vue'
import PageHeading from '~/src/shared/ui/blocks/page-heading/page-heading.vue'
import { useCategories } from '~/src/shared/models/queries'
import { authClient } from '~/src/shared/lib/auth-client'

const { data: categories } = useCategories()
const session = authClient.useSession()

export type Categories = UnwrapRef<typeof categories>
export type Model = Exclude<Categories, undefined>[0]['models'][0]

const isAuthedCustomer = computed(() => session.value?.data?.user?.role === 'customer')
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
        <div class="grid grid-cols-3 gap-16">
          <ModelCard
            v-for="model in category.models"
            :key="model.id"
            :is-authed-customer="isAuthedCustomer"
            :model="model"
            :is-favorite="false"
            :is-in-cart="true"
          />
        </div>
      </div>
    </div>
  </main>
</template>
