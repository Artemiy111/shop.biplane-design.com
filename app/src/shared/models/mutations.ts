import { useAuthUtils } from '~/src/shared/models/auth-utils'
import type { UpdateFileSchema, UpdateImageSchema, UpdateModelSchema, UpdateImageOrderSchema } from '~/src/shared/config/validation/db'
import { useApi } from '~/src/shared/api'

export const useToggleIsFavorite = defineMutation(() => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutate, ...rest } = useMutation({
    mutation: async (modelId: string) => {
      if (authUtils.isAdmin)
        toast.add({ color: 'info', title: 'Войдите как покупатель, чтобы добавить в избранное', duration: 1000 })
      else if (!authUtils.isCustomer)
        toast.add({ color: 'info', title: 'Войдите чтобы добавить в избранное', duration: 1000 })
      else await useApi().customer.toggleIsFavorite.mutate({ modelId: modelId })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось добавить в избранное' })
    },
    onSettled: async () => {
      await qc.invalidateQueries({ key: ['models'] })
      await qc.invalidateQueries({ key: ['favorites'] })
    },
  })

  return {
    toggleIsFavorite: mutate,
    ...rest,
  }
})

export const useToggleIsInCart = defineMutation(() => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutate, ...rest } = useMutation({
    mutation: async (modelId: string) => {
      if (authUtils.isAdmin)
        toast.add({ color: 'info', title: 'Войдите как покупатель, чтобы добавить в корзину', duration: 1000 })
      else if (!authUtils.isCustomer)
        toast.add({ color: 'info', title: 'Войдите, чтобы добавить в корзину', duration: 1000 })
      else await useApi().customer.toggleIsInCart.mutate({ modelId: modelId, setId: null })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось добавить в корзину' })
    },
    onSettled: async () => {
      await qc.invalidateQueries({ key: ['models'] })
      await qc.invalidateQueries({ key: ['cart-items'] })
    },
  })

  return {
    toggleIsInCart: mutate,
    ...rest,
  }
})

export const useUpdateModel = (slug: MaybeRefOrGetter<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateModelSchema) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.models.updateModel.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить модель' })
    },
    onSettled: async (_, __, _vars) => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(slug) }] })
    },
  })

  return {
    updateModel: mutateAsync,
    ...rest,
  }
}

export const useUpdateModelFile = (slug: MaybeRefOrGetter<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateFileSchema) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.files.updateFile.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить файл' })
    },
    onSettled: async (_, __, _vars) => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(slug) }] })
    },
  })

  return {
    updateFile: mutateAsync,
    ...rest,
  }
}

export const useDeleteModelFile = (slug: MaybeRefOrGetter<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (id: string) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.files.deleteFile.mutate({ id })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось удалить файл' })
    },
    onSettled: async (_, __, _vars) => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(slug) }] })
    },
  })

  return {
    deleteFile: mutateAsync,
    ...rest,
  }
}

export const useSelectModelDiscount = (slug: MaybeRefOrGetter<string>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (discountId: string | null) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.models.selectDiscount.mutate({ slug: toValue(slug), discountId })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить скидку' })
    },
    onSettled: async () => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(slug) }] })
    },
  })

  return {
    selectDiscount: mutateAsync,
    ...rest,
  }
}

export const useUploadModelImage = (model: MaybeRefOrGetter<{ slug: string } | undefined>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (formData: FormData) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })
      await useApi().admin.images.uploadImage.mutate(formData as unknown as { modelId: string, modelSlug: string, image: File })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось загрузить картинку' })
    },
    onSuccess: () => {
      toast.add({ color: 'success', title: 'Картинка загружена' })
    },
    onSettled: async (_, __, _vars) => {
      if (!toValue(model)) return
      await qc.invalidateQueries({ key: ['models', { slug: toValue(model)!.slug }] })
    },
  })

  return {
    uploadImage: mutateAsync,
    ...rest,
  }
}

export const useUpdateModelImage = (model: MaybeRefOrGetter<{ slug: string }>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateImageSchema) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.images.updateImage.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить картинку' })
    },
    onSettled: async (_, __, _vars) => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(model).slug }] })
    },
  })

  return {
    updateImage: mutateAsync,
    ...rest,
  }
}

export const useUpdateModelImageOrder = (model: MaybeRefOrGetter<{ slug: string, id: string } | undefined>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (data: UpdateImageOrderSchema) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.images.updateImageOrder.mutate(data)
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось изменить порядок картинки' })
    },
    onSettled: async (_, __, _vars) => {
      if (!toValue(model)) return
      await qc.invalidateQueries({ key: ['models', { slug: toValue(model)!.slug }] })
    },
  })

  return {
    updateImageOrder: mutateAsync,
    ...rest,
  }
}

export const useDeleteModelImage = (model: MaybeRefOrGetter<{ id: string, slug: string }>) => {
  const toast = useToast()
  const authUtils = useAuthUtils()
  const qc = useQueryCache()

  const { mutateAsync, ...rest } = useMutation({
    mutation: async (id: string) => {
      if (!authUtils.isAdmin) return toast.add({ color: 'error', title: 'Войдите как админ' })

      await useApi().admin.images.deleteImage.mutate({ modelId: toValue(model).id, imageId: id })
    },
    onError: () => {
      toast.add({ color: 'error', title: 'Не удалось удалить картинку' })
    },
    onSettled: async (_, __, _vars) => {
      await qc.invalidateQueries({ key: ['models', { slug: toValue(model).slug }] })
    },
  })

  return {
    deleteImage: mutateAsync,
    ...rest,
  }
}
