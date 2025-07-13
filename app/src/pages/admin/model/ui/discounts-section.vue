<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { TableColumn } from '@nuxt/ui'

import { dateFormatter } from '~shared/lib/date-formatter'
import { useSelectModelDiscount } from '~shared/models/mutations'
import { useDiscounts } from '~shared/models/queries'
import type { ModelDto } from '~shared/models/queries'
import { FancyId } from '~shared/ui/kit/fancy-id'

const props = defineProps<{
  model: ModelDto
}>()

const { model } = toRefs(props)
const slug = computed(() => props.model.slug)

const selectedDay = ref<DateValue | null>(null)
const { selectDiscount } = useSelectModelDiscount(slug)

type DiscountDate = typeof discountDates.value[0]

const isDiscountActive = (discount: { startDate: string | null, endDate: string | null }) => {
  const today = new Date().toISOString().split('T')[0]!
  if (!discount.startDate && !discount.endDate) return true
  else if (discount.startDate && discount.endDate && discount.startDate <= today && today <= discount.endDate) return true
  return false
}

const { discounts } = useDiscounts()
const discountDates = computed(() => discounts.value.map((discount) => {
  const start = discount.startDate ? parseDate(discount.startDate) : undefined
  const end = discount.endDate ? parseDate(discount.endDate) : undefined
  return {
    ...discount,
    start,
    end,
    isActive: isDiscountActive(discount),
  }
}).toSorted((a, b) => a.discountPercentage - b.discountPercentage))

const getDayDiscounts = (day: DateValue) => {
  return discountDates.value.filter((d) => {
    if (!d.start && !d.end) return true
    else if (d.start && d.end && d.start.compare(day) <= 0 && day.compare(d.end) <= 0) return true
    return false
  })
}

const onSelectDiscount = async (discountId: string | null) => {
  try {
    await selectDiscount(discountId)
  }
  finally {
    selectedDay.value = null
  }
}

const discountViewTab = ref<'table' | 'calendar'>('table')

const discountsTable: TableColumn<DiscountDate>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => {
      if (row.original.id === model.value?.discountId) row.toggleSelected(true)
      else row.toggleSelected(false)
      return h(FancyId, { id: row.original.id })
    },
  },
  {
    accessorKey: 'discountPercentage',
    header: '%',
    cell: ({ row }) => `${row.getValue('discountPercentage')}%`,
  },
  {
    accessorKey: 'label',
    header: 'Название',
    cell: ({ row }) => row.getValue('label'),
  },
  {
    accessorFn: row => ({ startDate: row.startDate, endDate: row.endDate }),
    header: 'Период действия',
    cell: ({ row }) => {
      const start = row.original.startDate
      const end = row.original.endDate
      if (!start && !end) return 'Бессрочно'
      else if (start && end) return dateFormatter.formatRange(new Date(start), new Date(end))
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Действует',
    cell: ({ row }) => row.original.isActive ? 'Да' : 'Нет',
    sortingFn: (a, b) => {
      return a.original.isActive && b.original.isActive ? 0 : a.original.isActive ? -1 : 1
    },
  },
  {
    id: 'actions',
  },
]
</script>

<template>
  <section class="col-span-2 flex flex-col gap-y-4">
    <div class="flex justify-between items-baseline gap-x-6">
      <div class="flex gap-x-4">
        <h2 class="text-subheading">
          Скидки
        </h2>
        <UButton
          v-if="model.discountId"
          color="neutral"
          loading-auto
          size="sm"
          variant="soft"
          @click="() => onSelectDiscount(null)"
        >
          Убрать
        </UButton>
      </div>
      <UTabs
        v-model="discountViewTab"
        color="neutral"
        :items="[{ icon: 'i-lucide-list', value: 'table' }, { icon: 'i-lucide-calendar', value: 'calendar' }]"
        :ui="{
          indicator: 'bg-(--ui-bg)',
          trigger: 'data-[state=active]:text-(--ui-text)',
        }"
      />
    </div>
    <UTable
      v-if="discountViewTab === 'table'"
      :columns="discountsTable"
      :data="discountDates"
      :sorting="[{ id: 'isActive', desc: false }]"
    >
      <template #actions-cell="{ row }">
        <UButton
          color="neutral"
          :disabled="!row.original.isActive"
          loading-auto
          size="sm"
          variant="soft"
          @click="() => onSelectDiscount(row.original.id)"
        >
          Выбрать
        </UButton>
      </template>
    </UTable>

    <UCalendar
      v-else
      :ui="{ root: 'w-full', headCell: 'text-start', cell: '@container/cell grid justify-center', cellTrigger: 'w-[100cqw] m-0 h-10 p-2 rounded-lg' }"
      :year-controls="false"
    >
      <template #day="{ day }">
        <UPopover>
          <div class="grid grid-cols-[24px_1fr] gap-x-2 w-full justify-start items-baseline">
            <span class="text-start">{{ day.day }}</span>
            <div class="flex gap-x-1">
              <div
                v-for="discount in getDayDiscounts(day)"
                :key="discount.id"
                class="text-xs"
              >
                {{ discount.discountPercentage }}%
              </div>
            </div>
          </div>
          <template #content>
            <div class="grid grid-cols-[repeat(4,max-content)] gap-x-4 gap-y-6 p-8">
              <div
                v-for="discount in getDayDiscounts(day)"
                :key="discount.id"
                class="grid grid-cols-subgrid col-span-4 w-fit items-center"
                :class="{ 'text-(--ui-text-dimmed)': !discount.isActive }"
              >
                <span>{{ discount.discountPercentage }}%</span>
                <span>{{ discount.label }}</span>
                <span v-if="!discount.startDate && !discount.endDate">
                  Бессрочно
                </span>
                <span v-else-if="discount.startDate && discount.endDate">
                  {{ dateFormatter.formatRange(new Date(discount.startDate), new Date(discount.endDate)) }}
                </span>
                <UButton
                  color="neutral"
                  :disabled="!discount.isActive"
                  loading-auto
                  size="sm"
                  variant="soft"
                  @click="() => onSelectDiscount(discount.id)"
                >
                  Выбрать
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </template>
    </UCalendar>
  </section>
</template>
