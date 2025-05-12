import { useAuthUtils } from '~/src/shared/models/auth-utils'
import type { UpdateFileSchema, UpdateModelSchema } from '~/src/shared/config/validation/db'
import { useApi } from '~/src/shared/api'

export const useToggleIsFavoriteMutation = defineMutation(() => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutate, ...rest } = useMutation({
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
    onSettled: async () => {
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
    onSettled: async () => {
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

export const useUpdateModelMutation = (slug: Ref<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateModelSchema) => {
      if (!authUtils.isAdmin) return

      await useApi().admin.models.updateModel.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить модель' })
    },
    onSettled: async (_, __, _vars) => {
      const qc = useQueryCache()
      await qc.invalidateQueries({ key: ['models', { slug: slug.value }] })
    },
  })

  return {
    updateModel: mutateAsync,
    ...rest,
  }
}

export const useUpdateModelFileMutation = (slug: Ref<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateFileSchema) => {
      if (!authUtils.isAdmin) return

      await useApi().admin.files.updateFile.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить файл' })
    },
    onSettled: async (_, __, _vars) => {
      const qc = useQueryCache()
      await qc.invalidateQueries({ key: ['models', { slug: slug.value }] })
    },
  })

  return {
    updateFile: mutateAsync,
    ...rest,
  }
}

export const useDeleteModelFileMutation = (slug: Ref<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (id: string) => {
      if (!authUtils.isAdmin) return

      await useApi().admin.files.deleteFile.mutate({ id })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось удалить файл' })
    },
    onSettled: async (_, __, _vars) => {
      const qc = useQueryCache()
      await qc.invalidateQueries({ key: ['models', { slug: slug.value }] })
    },
  })

  return {
    deleteFile: mutateAsync,
    ...rest,
  }
}
