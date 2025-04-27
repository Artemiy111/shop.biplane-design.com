import { z } from 'zod'
import { router, publicProcedure } from '~~/server/trpc'
import { modelPrequery } from '~~/server/trpc/query-templates'
import { db } from '~~/server/db'

export const publicRouter = router({
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx
      const categories_ = await db.query.categories.findMany({
        with: {
          models: { with: modelPrequery(user?.id) },
        },
      })
      const categories = categories_.map(category => ({
        ...category,
        models: category.models.map(model => ({
          ...model,
          isFavorite: model.favorites?.length > 0,
          isInCart: model.cartItems?.length > 0,
        })),
      }))
      return categories
    }),

  getModelBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const model_ = await db.query.models.findFirst({
        where: {
          slug: input.slug,
        },
        with: {
          category: true,
          ...modelPrequery(user?.id),
        },
      })

      const model = model_
        ? ({
            ...model_,
            isFavorite: model_.favorites?.length > 0,
            isInCart: model_.cartItems?.length > 0,
          })
        : null

      return model
    }),

})
