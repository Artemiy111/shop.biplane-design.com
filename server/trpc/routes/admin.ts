import { db } from '~~/server/db'
import { router, adminProcedure } from '~~/server/trpc'

export const adminRouter = router({
  getModelsPreview: adminProcedure.query(async () => {
    return await db.query.models.findMany({
      with: {
        category: true,
        discount: true,
        images: {
          limit: 1,
          with: {
            optimized: true,
          },
        },
      },
    })
  }),
})
