import { router } from '~server/trpc'
import { adminRouter } from '~server/trpc/routes/admin'
import { customerRouter } from '~server/trpc/routes/customer'
import { publicRouter } from '~server/trpc/routes/public'

export const appRouter = router({
  public: publicRouter,
  customer: customerRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
