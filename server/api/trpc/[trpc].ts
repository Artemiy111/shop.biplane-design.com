import { createTRPCNuxtHandler } from 'trpc-nuxt/server'
import { db } from '~~/server/db'

import { authedProcedure, createContext, publicProcedure, router } from '~~/server/lib/trpc'

export const appRouter = router({
  categories: publicProcedure.query(() => {

  }),
})

export type AppRouter = typeof appRouter

export default createTRPCNuxtHandler({
  router: appRouter,
  createContext,
})
