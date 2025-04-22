import z from 'zod'
import { count, eq } from 'drizzle-orm'
import { router, publicProcedure, authedProcedure, customerProsedure } from '~~/server/trpc'
import { db } from '~~/server/db'
import { favorites, models, orders, users } from '~~/server/db/schema'

const modelPrequery = {
  with: {
    discount: true,
    files: true,
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
} as const

const setPrequery = { with: { discount: true, image: { with: { optimizedImages: true } } } } as const

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return 'Hello world!'
  }),
  categories: publicProcedure.query(async () => {
    const categories = await db.query.categories.findMany({
      with: {
        models: modelPrequery,
      },
    })
    return categories
  }),

  modelBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const model = await db.query.models.findFirst({
      where: eq(models.slug, input.slug),
      ...modelPrequery,
    })
    return model
  }),

  // customer: customerProsedure.query(async ({ ctx: { user } }) => {
  //   await db.query.users.findFirst({
  //     where: eq(users.id, user.id),
  //     with: {
  //       favorites: {
  //         with: {
  //           model: modelPrequery,
  //         },
  //       },
  //       cartItems: {
  //         with: {
  //           model: modelPrequery,
  //           set: setPrequery,
  //         },
  //       },
  //     },
  //   })
  // }),
})

export const customerRouter = router({
  favoritesCount: customerProsedure.query(async ({ ctx: { user } }) => {
    const v = await db.select({ count: count() }).from(favorites).where(eq(favorites.userId, user.id))
    return v[0].count
  }),
  favorites: customerProsedure.query(async ({ ctx: { user } }) => {
    return db.query.favorites.findMany({
      where: eq(favorites.userId, user.id),
      with: {
        model: modelPrequery,
      },
    })
  }),
  orders: customerProsedure.query(async ({ ctx: { user } }) => {
    return db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      with: {
        items: {
          with: {
            model: modelPrequery,
            set: setPrequery,
          },
        },
      },
    })
  }),
})

export type AppRouter = typeof appRouter
