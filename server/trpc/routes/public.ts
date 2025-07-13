import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { db } from '~server/db'
import type { CategoryDb } from '~server/db/schema'
import { publicProcedure, router } from '~server/trpc'
import { modelPrequery } from '~server/trpc/query-templates'

export const publicRouter = router({
  // getCategories: publicProcedure
  //   .query(async ({ ctx }) => {
  //     const { user } = ctx
  //     const categories_ = await db.query.categoriesT.findMany({
  //       with: {
  //         models: { with: modelPrequery(user?.id) },
  //       },
  //     })
  //     const categories = categories_.map(category => ({
  //       ...category,
  //       models: category.models.map(model => ({
  //         ...model,
  //         isFavorite: model.favorites?.length > 0,
  //         isInCart: model.cartItems?.length > 0,
  //       })),
  //     }))
  //     return categories
  //   }),

  // getModels: publicProcedure
  //   .query(async ({ ctx }) => {
  //     const { user } = ctx
  //     const models_ = await db.query.models.findMany({
  //       with: {
  //         category: true,
  //         ...modelPrequery(user?.id),
  //       },
  //     })
  //     const models = models_.map(model => ({
  //       ...model,
  //       isFavorite: model.favorites?.length > 0,
  //       isInCart: model.cartItems?.length > 0,
  //     }))
  //     return models
  //   }),

  getModels: publicProcedure.query(async ({ ctx: { user } }) => {
    const cs = await db.query.categoriesT.findMany()
    const ms = await db.query.modelsT.findMany({
      with: {
        category: true,
        ...modelPrequery(user?.id),
      },
    })
    const models = ms.map(m => ({
      ...m,
      images: m.images.toSorted((a, b) => a.imageToModel.sortOrder - b.imageToModel.sortOrder),
      isFavorite: m.favorites?.length > 0,
      isInCart: m.cartItems?.length > 0,
    }))

    type Model = typeof models[number]
    const csMap = new Map(cs.map(c => [c.id, { ...c, models: [] as Model[] }]))
    models.forEach((m) => {
      csMap.get(m.categoryId)!.models.push(m)
    })
    const categories = Array.from(csMap.values())

    return { models, categories }
  }),

  getModelBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx: { user }, input }) => {
      const m = await db.query.modelsT.findFirst({
        where: {
          slug: input.slug,
        },
        with: {
          category: true,
          ...modelPrequery(user?.id),
        },
      })

      if (!m) throw new TRPCError({ code: 'NOT_FOUND' })

      const model = {
        ...m,
        images: m.images.toSorted((a, b) => a.imageToModel.sortOrder - b.imageToModel.sortOrder),
        isFavorite: m.favorites?.length > 0,
        isInCart: m.cartItems?.length > 0,
      }

      return model
    }),

})
