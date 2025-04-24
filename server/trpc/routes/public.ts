import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { router, publicProcedure } from '~~/server/trpc'
import { modelPrequery } from '~~/server/trpc/query-templates'
import { db } from '~~/server/db'
import { models } from '~~/server/db/schema'

export const publicRouter = router({
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx
      const categories_ = await db.query.categories.findMany({
        with: {
          models: modelPrequery(user?.id),
        },
      })
      const categories = categories_.map(category => ({
        ...category,
        models: category.models.map(model => ({
          ...model,
          isFavorite: model.favorites.length > 0,
          isInCart: model.cartItems.length > 0,
        })),
      }))
      return categories
    }),

  getModelBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const model = await db.query.models.findFirst({
        where: eq(models.slug, input.slug),
        ...modelPrequery(user?.id),
      })
      return model
    }),

})
