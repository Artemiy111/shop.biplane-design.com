import { router } from '~~/server/trpc'
import { publicRouter } from '~~/server/trpc/routes/public'
import { customerRouter } from '~~/server/trpc/routes/customer'
import { adminRouter } from '~~/server/trpc/routes/admin'

export const appRouter = router({
  public: publicRouter,
  customer: customerRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
