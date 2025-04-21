import { createTRPCNuxtHandler } from 'trpc-nuxt/server'

import { createContext } from '~~/server/trpc/contex'
import { appRouter } from '~~/server/trpc/routes'

export default createTRPCNuxtHandler({
  router: appRouter,
  createContext,
})
