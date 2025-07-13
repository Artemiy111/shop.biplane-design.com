import type { UnwrapRef } from 'vue'

import { useApi } from '~/src/shared/api'

import { useAuthUtils } from './auth-utils'

export const useCategoriesSimple = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data: _categories, state: _, ...rest } = useQuery({
    key: ['categories', 'simple'],
    query: async () => await useApi().admin.getCategoriesSimple.query(),
    enabled: () => authUtils.isAdmin,
  })
  const categories = computed(() => _categories.value || [])
  return { categories, ...rest }
})

export const useModels = () => {
  const { data, state: _, ...rest } = useQuery({
    key: ['models'],
    query: async () => await useApi().public.getModels.query(),
  })
  const models = computed(() => data.value?.models || [])
  const categories = computed(() => data.value?.categories || [])
  return { models, categories, ...rest }
}

export const useModelBySlug = (slug: Ref<string>) => {
  const { data: model, state: _, ...rest } = useQuery({
    key: () => ['models', { slug: slug.value }],
    query: async () => await useApi().public.getModelBySlug.query({ slug: slug.value }),
    enabled: () => !!slug.value,
  })
  return { model, ...rest }
}

export type ModelDto = Exclude<UnwrapRef<ReturnType<typeof useModelBySlug>['model']>, null | undefined>

export const useDiscounts = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data: _discounts, state: _, ...rest } = useQuery({
    key: ['discounts'],
    query: async () => await useApi().admin.discounts.getDiscounts.query(),
    enabled: () => authUtils.isAdmin,
  })
  const discounts = computed(() => _discounts.value || [])
  return { discounts, ...rest }
})

export const useFavoriteModels = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data, state: _, ...rest } = useQuery({
    key: () => ['favorites', { userId: authUtils.user?.id }],
    query: () => useApi().customer.getFavorites.query(),
    enabled: () => authUtils.isCustomer,
  })
  const favoriteModels = computed(() => data.value || [])
  const favoritesCount = computed(() => favoriteModels.value.length || undefined)
  return { favoriteModels, favoritesCount, ...rest }
})

export const useCartItems = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data, state: _, ...rest } = useQuery({
    key: () => ['cart-items', { userId: authUtils.user?.id }],
    query: () => useApi().customer.getCartItems.query(),
    enabled: () => authUtils.isCustomer,
  })
  const cartItems = computed(() => data.value || [])
  const cartItemsCount = computed(() => cartItems.value.length || undefined)
  return { cartItems, cartItemsCount, ...rest }
})

export const useOptimizedImagesSubscription = (modelSlug: Ref<string>) => {
  const qc = useQueryCache()
  const toast = useToast()
  const status = ref<'pending' | 'started' | 'stoped'>('pending')
  const subscription = useApi().admin.images.onImagesOptimized.subscribe(undefined, {
    onStarted: () => {
      status.value = 'started'
    },
    onError: (error) => {
      if (error.message === 'An error was suppressed during disposal.') return
      toast.add({ color: 'error', title: `Ошибка обработки картинок: ${error.message}` })
    },
    onData: (data) => {
      toast.add({ color: 'info', title: `Картинка обработана: ${data.imageId}` })
      qc.invalidateQueries({ key: ['models', { slug: modelSlug.value }] })
    },
    onStopped() {
      status.value = 'stoped'
    },
  })

  return { optimizedImagesSubscription: subscription, status }
}
