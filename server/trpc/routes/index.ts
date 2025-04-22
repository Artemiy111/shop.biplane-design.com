import { router } from '~~/server/trpc'
import { customerRouter } from '~~/server/trpc/routes/customer'
import { publicRouter } from '~~/server/trpc/routes/public'

export const appRouter = router({
  public: publicRouter,
  customer: customerRouter,
})

export type AppRouter = typeof appRouter
