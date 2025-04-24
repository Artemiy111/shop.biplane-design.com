import { useApi } from '~/src/shared/api'

export const useCategories = defineQuery(() => {
  const { data: _categories, state: _, ...rest } = useQuery({
    key: ['categories'],
    query: async () => await useApi().public.getCategories.query(),
  })
  const categories = computed(() => _categories.value || [])
  return { categories, ...rest }
})

export const useFavoritesCount = defineQuery(() => {
  const { data: favoritesCount, state: _, ...rest } = useQuery({
    key: ['favorites', 'count'],
    query: () => useApi().customer.getFavoritesCount.query(),
  })
  return { favoritesCount, ...rest }
})

export const useCartItemsCount = defineQuery(() => {
  const { data: cartItemsCount, state: _, ...rest } = useQuery({
    key: ['cart-items', 'count'],
    query: () => useApi().customer.getCartItemsCount.query(),
  })
  return { cartItemsCount, ...rest }
})
