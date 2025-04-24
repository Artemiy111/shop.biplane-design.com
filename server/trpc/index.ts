import { initTRPC, TRPCError } from '@trpc/server'
import type { Context, CreateContext } from './contex'

const t = initTRPC.context<CreateContext>().create()

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

type AuthedContext = Context & {
  session: Exclude<Context['session'], null>
  user: Exclude<Context['user'], null>
}

const isAuthed = t.middleware(({ ctx, next, ...r }) => {
  if (!ctx.user || !ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Пользователь не авторизован' })
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

const isAdmin = t.middleware<AuthedContext>(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'UNAUTHORIZED', message: 'У пользователя нет прав администратора' })
  return next({ ctx })
})

const isNotAdmin = t.middleware<AuthedContext>(({ ctx, next }) => {
  if (ctx.user?.role === 'admin') throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Функция только не для администратора' })
  return next({ ctx })
})

export const authedProcedure = publicProcedure.use(isAuthed)
export const adminProsedure = authedProcedure.use(isAdmin)
export const customerProsedure = authedProcedure.use(isNotAdmin)
