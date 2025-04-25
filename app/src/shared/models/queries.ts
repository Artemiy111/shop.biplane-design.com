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

export const useModelBySlug = defineQuery(() => {
  const modelSlug = ref<string | null>(null)
  const { data: model, state: _, ...rest } = useQuery({
    key: () => ['categories', 'models', { slug: modelSlug.value }],
    query: async () => await useApi().public.getModelBySlug.query({ slug: modelSlug.value! }),
    enabled: () => !!modelSlug.value,
  })
  return { model, modelSlug, ...rest }
})

export const useFavoritesCount = defineQuery(() => {
  const authUtils = useAuthUtils()

  const { data: favoritesCount, state: _, ...rest } = useQuery({
    key: ['favorites', 'count'],
    query: () => useApi().customer.getFavoritesCount.query(),
    enabled: () => authUtils.isCustomer,
  })
  return { favoritesCount, ...rest }
})

export const useCartItemsCount = defineQuery(() => {
  const authUtils = useAuthUtils()

  const { data: cartItemsCount, state: _, ...rest } = useQuery({
    key: ['cart-items', 'count'],
    query: () => useApi().customer.getCartItemsCount.query(),
    enabled: () => authUtils.isCustomer,
  })
  return { cartItemsCount, ...rest }
})
