import type { H3Event } from 'h3'
import { initTRPC, TRPCError } from '@trpc/server'

import { auth } from '~~/server/lib/auth'

const t = initTRPC.context<typeof createContext>().create()

export const publicProcedure = t.procedure

export const router = t.router
export const middleware = t.middleware

export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})

export async function createContext(event: H3Event) {
  const data = await auth.api.getSession({ headers: event.headers })

  if (!data) return { event, session: null, user: null }

  const { session, user } = data

  return {
    event,
    session,
    user,
  }
}
