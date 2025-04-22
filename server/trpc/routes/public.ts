import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { router, publicProcedure } from '~~/server/trpc'
import { modelPrequery } from '~~/server/trpc/query-templates'
import { db } from '~~/server/db'
import { models } from '~~/server/db/schema'

export const publicRouter = router({
  getCategories: publicProcedure
    .query(async () => {
      const categories = await db.query.categories.findMany({
        with: {
          models: modelPrequery,
        },
      })
      return categories
    }),

  getModelBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const model = await db.query.models.findFirst({
        where: eq(models.slug, input.slug),
        ...modelPrequery,
      })
      return model
    }),
})
