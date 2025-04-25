import { useAuthUtils } from './auth-utils'
import { useApi } from '~/src/shared/api'

export const useToggleIsFavoriteMutation = defineMutation(() => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutate, ...rest } = useMutation({
    key: () => ['toggle-is-favorite'],
    mutation: async (modelId: string) => {
      if (!authUtils.isCustomer) {
        toast.add({ color: 'info', title: 'Войдите чтобы добавить в избранное', duration: 1000 })
        return
      }
      await useApi().customer.toggleIsFavorite.mutate({ modelId: modelId })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось добавить в избранное' })
    },
    onSuccess: async () => {
      const qc = useQueryCache()
      await qc.invalidateQueries({ key: ['categories'] })
      await qc.invalidateQueries({ key: ['favorites', 'count'] })
    },
  })

  return {
    toggleIsFavorite: mutate,
    ...rest,
  }
})

export const useToggleIsInCartMutation = defineMutation(() => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutate, ...rest } = useMutation({
    key: () => ['toggle-is-in-cart'],
    mutation: async (modelId: string) => {
      if (!authUtils.isCustomer) {
        toast.add({ color: 'info', title: 'Войдите чтобы добавить в корзину', duration: 1000 })
        return
      }
      await useApi().customer.toggleIsInCart.mutate({ modelId: modelId, setId: null })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось добавить в корзину' })
    },
    onSuccess: async () => {
      const qc = useQueryCache()
      await qc.invalidateQueries({ key: ['categories'] })
      await qc.invalidateQueries({ key: ['cart-items', 'count'] })
    },
  })

  return {
    toggleIsInCart: mutate,
    ...rest,
  }
})
