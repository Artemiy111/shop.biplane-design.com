import type { UnwrapRef } from 'vue'
import type { ReadonlyRefOrGetter } from '@vueuse/core'
import { useAuthUtils } from './auth-utils'
import { useApi } from '~/src/shared/api'

export const useCategories = defineQuery(() => {
  const { data: _categories, state: _, ...rest } = useQuery({
    key: ['categories'],
    query: async () => await useApi().public.getCategories.query(),
  })
  const categories = computed(() => _categories.value || [])
  return { categories, ...rest }
})

export type Category = UnwrapRef<ReturnType<typeof useCategories>['categories']>[number]
export type CategoryModel = Category['models'][number]

export const useCategoriesSimple = defineQuery(() => {
  const { data: _categories, state: _, ...rest } = useQuery({
    key: ['categories', 'simple'],
    query: async () => await useApi().admin.getCategoriesSimple.query(),
  })
  const categories = computed(() => _categories.value || [])
  return { categories, ...rest }
})

export const useModelBySlug = (slug: ReadonlyRefOrGetter<string>) => {
  const { data: model, state: _, ...rest } = useQuery({
    key: () => ['models', { slug: isRef(slug) ? slug.value : slug() }],
    query: async () => await useApi().public.getModelBySlug.query({ slug: isRef(slug) ? slug.value : slug() }),
    enabled: () => !!(isRef(slug) ? slug.value : slug()),
  })
  return { model, ...rest }
}

export type Model = Exclude<UnwrapRef<ReturnType<typeof useModelBySlug>['model']>, null | undefined>

export const useDiscounts = defineQuery(() => {
  const { data: _discounts, state: _, ...rest } = useQuery({
    key: ['discounts'],
    query: async () => await useApi().admin.discounts.getDiscounts.query(),
  })
  const discounts = computed(() => _discounts.value || [])
  return { discounts, ...rest }
})

export const useFavoritesCount = defineQuery(() => {
  const authUtils = useAuthUtils()

  const { data: favoritesCount, state: _, ...rest } = useQuery({
    key: () => ['favorites', 'count', { userId: authUtils.user?.id }],
    query: () => authUtils.isCustomer ? useApi().customer.getFavoritesCount.query() : Promise.resolve(0),
  })
  return { favoritesCount, ...rest }
})

export const useFavoriteModels = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data, state: _, ...rest } = useQuery({
    key: () => ['favorites', { userId: authUtils.user?.id }],
    query: () => useApi().customer.getFavorites.query(),
    enabled: () => authUtils.isCustomer,
  })
  const favoriteModels = computed(() => data.value || [])
  return { favoriteModels, ...rest }
})

export const useCartItemsCount = defineQuery(() => {
  const authUtils = useAuthUtils()

  const { data: cartItemsCount, state: _, ...rest } = useQuery({
    key: () => ['cart-items', 'count', { userId: authUtils.user?.id }],
    query: () => authUtils.isCustomer ? useApi().customer.getCartItemsCount.query() : Promise.resolve(0),
  })
  return { cartItemsCount, ...rest }
})

export const useCartItems = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data, state: _, ...rest } = useQuery({
    key: () => ['cart-items', { userId: authUtils.user?.id }],
    query: () => useApi().customer.getCartItems.query(),
    enabled: () => authUtils.isCustomer,
  })
  const cartItems = computed(() => data.value || [])
  return { cartItems, ...rest }
})
