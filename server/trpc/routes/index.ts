import { router, publicProcedure } from '~~/server/trpc'
import { db } from '~~/server/db'

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return 'Hello world!'
  }),
  categories: publicProcedure.query(async () => {
    const categories = await db.query.categories.findMany({
      with: {
        models: {
          with: {
            discount: true,
            imagesToModel: {
              with: {
                image: {
                  with: {
                    optimizedImages: true,
                  },
                },
              },
            },
          },
        },
      } })
    return categories
  }),
})

export type AppRouter = typeof appRouter
