<template>
  <footer class="container mt-20 flex flex-col">
    <USeparator />
    <section
      class="grid grid-cols-[max-content_max-content_400px_max-content] justify-center gap-x-16 py-16 gap-y-8 max-lg:grid-cols-1 max-2xl:grid-cols-[380px_max-content]"
    >
      <ul class="flex flex-col gap-1">
        <h6 class="font-semibold">
          Контакты
        </h6>
        <li>Biplane-design@mail.ru</li>
        <li>3473 25-18-56</li>
      </ul>
      <ul class="flex flex-col gap-1">
        <h6 class="font-semibold">
          Время работы
        </h6>
        <li>Пн — Пт&nbsp;&nbsp;&nbsp;&nbsp;8 — 18</li>
      </ul>
      <ul class="flex flex-col gap-1">
        <h6 class="font-semibold">
          Адрес
        </h6>
        <li>
          <NuxtLink
            :external="true"
            target="_blank"
            to="https://yandex.ru/map-widget/v1/?um=constructor%3A3da4595a6346865d8223d34a3ff56c219a4f3852edd8bb18b888329ab0ba28fa&amp;source=constructor"
          >
            Стерлитамак, ул&nbsp;Карла&nbsp;Маркса&nbsp;101Б, офис&nbsp;313&nbsp;&nbsp;→
          </NuxtLink>
        </li>
      </ul>
      <ul class="flex flex-col gap-1">
        <h6 class="font-semibold">
          Студентам
        </h6>
        <li>
          <NuxtLink
            class="flex gap-2 "
            :external="true"
            href="https://coolors.co"
            rel=""
            target="_blank noopener noreferrer"
          >
            Цветовая палитра&nbsp;&nbsp;→
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="flex gap-2"
            :external="true"
            href="https://habr.com/ru/companies/ruvds/articles/553582"
            target="_blank noopener noreferrer"
          >
            Теория цвета&nbsp;&nbsp;→
          </NuxtLink>
        </li>
      </ul>
    </section>
  </footer>
</template>
