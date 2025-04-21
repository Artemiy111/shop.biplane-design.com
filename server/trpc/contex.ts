import type { H3Event } from 'h3'
import { auth } from '~~/server/lib/auth'

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
export type Context = typeof createContext
