import { createTRPCNuxtHandler } from 'trpc-nuxt/server'
import { db } from '~~/server/db'

import { authedProcedure, createContext, publicProcedure, router } from '~~/server/lib/trpc'

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return 'Hello world!'
  }),
  categories: publicProcedure.query(async () => {
    const categories = await db.query.categories.findMany({ with: { models: { with: { imagesToModel: { with: { image: { with: { optimizedImages: true } } } } } } } })
    console.log(categories)
    return categories
  }),
})

export type AppRouter = typeof appRouter

export default createTRPCNuxtHandler({
  router: appRouter,
  createContext,
})
