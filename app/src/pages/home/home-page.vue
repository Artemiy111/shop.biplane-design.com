<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos'

import { PageHeading } from '~shared/ui/blocks/page-heading'

type Category = {
  name: string
  image: string
  to: string
}

const categories: Category[] = [
  {
    name: 'Мебель',
    image: 'https://admincontent.bimobject.com/public/productimages/359488e9-8f98-4cd9-86bd-e9e5ef73a009/2ecdd679-d98e-430a-ba2c-837a6ca5d7b8/743413?width=400&height=400&compress=true',
    to: '/catalog',
  },
  {
    name: 'Освещение',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Кухня',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Декор',
    image: 'https://admincontent.bimobject.com/public/productimages/8478b203-20bc-472f-92f1-40b803854e81/78ba827f-7217-47ec-a541-4c2faf5b0738/683596?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Ландшафт',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
]

type Brand = {
  name: string
  image: string
  to: string
}

const brands: Brand[] = [
  {
    name: 'Мебель',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Освещение',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Кухня',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Декор',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
  {
    name: 'Ландшафт',
    image: 'https://admincontent.bimobject.com/public/productimages/3fdcfa8b-ff90-46ca-b805-c7673e879e35/dd77955e-fdcb-4dfc-8542-2e24ce636310/551918?width=675&height=675&compress=true',
    to: '/catalog',
  },
]

const whyUs = [
  {
    name: 'Максимальная точность',
    description: 'Модели соответствуют реальным габаритам и инженерным нормам. Никаких лишних элементов.',
  },
  {
    name: 'Спецификации и параметры',
    description: 'Каждое семейство имеет прописанные параметры и материалы, что облегчает оформление документации',
  },
  {
    name: 'Экономия времени',
    description: 'Вам не нужно моделировать всё с нуля. Используйте готовое и сконцентрируйтесь на архитектурных решениях',
  },
]
</script>

<template>
  <main class="container">
    <section class="grid my-20 grid-cols-[max-content_1fr] gap-8">
      <div class="w-3xl">
        <PageHeading class="text-heading-max">
          Revit-модели,<br> созданные архитекторами для архитекторов
        </PageHeading>
        <p class="text-subheading font-normal mt-8">
          Мы собрали тщательно проработанные модели и семейства Revit с полной спецификацией, материалами и аккуратной структурой. <br>
          Загружайте, вставляйте в проект и фокусируйтесь на главном — дизайне
        </p>
        <p class="mt-6 ">
          Совместимо с Revit 2023
        </p>
      </div>
      <div class="relative cursor-grab">
        <TresCanvas
          alpha
          preset="realistic"
          shadows
        >
          <TresPerspectiveCamera />
          <OrbitControls />
          <TresAmbientLight :intensity="0.5" />

          <TresDirectionalLight
            cast-shadow
            :position="[4, 4, 2]"
          />
          <TresAxesHelper :scale="2" />
          <Suspense>
            <FBXModel
              cast-shadow
              path="/table.fbx"
              receive-shadow
              :rotation="[-Math.PI / 2, 0, 0]"
              :scale="0.001"
            />
          </Suspense>

          <!-- <Suspense>
          <Text3D font="/Montserrat_Regular.json">
            Revit-модели, созданные архитекторами для архитекторов
            <TresMeshPhysicalMaterial color="gray" />
          </Text3D>
        </Suspense>
        <Plane
          :scale="10"
          receive-shadow
          :position="[0, -1, 0]"
        >
          <TresMeshPhysicalMaterial
            color="orange"
            receive-shadow
          />
        </Plane> -->
        </TresCanvas>
      </div>
    </section>

    <section class="mt-16 flex flex-col gap-y-4">
      <h3 class="text-subheading font-semibold">
        Почему выбирают нас?
      </h3>

      <div class="grid grid-cols-3 gap-8">
        <div
          v-for="item in whyUs"
          :key="item.name"
          class="flex flex-col gap-y-2"
        >
          <h4 class="font-bold">
            {{ item.name }}
          </h4>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </section>

    <section class="mt-16 bg-primary-50 p-(--container-pad) grid grid-cols-2 gap-8">
      <div class="">
        <h2 class="text-subheading font-semibold">
          Попробуйте бесплатно
        </h2>
        <p class="mt-4">
          Скачайте бесплатную модель и убедитесь в качестве сами. <br>
          Файл включает Revit-семейство, спецификацию и примеры использования в проекте
        </p>
        <UButton
          class="mt-6"
          variant="soft"
        >
          Получить
        </UButton>
      </div>
      <NuxtImg
        class="mix-blend-multiply h-60"
        src="https://storage.yandexcloud.net/biplane-design/76/7fc2c29a-8b9c-42d6-b2a4-0c8ed837357c.jpeg"
      />
    </section>

    <section class="flex flex-col gap-6 mt-16">
      <h2 class="text-subheading ">
        Категории
      </h2>
      <div class="grid grid-cols-5 gap-8">
        <NuxtLink
          v-for="item in categories"
          :key="item.to"
          class="hover:text-primary transition duration-base"
          :to="item.to"
        >
          <div class="relative">

            <NuxtImg
              class="w-full aspect-square"
              :src="item.image"
            />
            <div class="absolute inset-0 mix-blend-multiply opacity-[0.03] bg-black" />
          </div>
          <h6 class="mt-2">{{ item.name }}</h6>
        </NuxtLink>
      </div>
    </section>
    <section class="mt-16 flex flex-col gap-6">
      <h2 class="text-subheading">
        Бренды
      </h2>
      <div class="grid grid-cols-5 gap-8">
        <NuxtLink
          v-for="brand in brands"
          :key="brand.to"
          class="hover:text-primary transition duration-base"
          :to="brand.to"
        >
          <div class="relative">

            <NuxtImg
              class="w-full aspect-square"
              :src="brand.image"
            />
            <div class="absolute inset-0 mix-blend-multiply opacity-[0.03] bg-black" />
          </div>
          <h6 class="mt-2">{{ brand.name }}</h6>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
