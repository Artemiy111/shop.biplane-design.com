import { adminClient, anonymousClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  plugins: [anonymousClient(), adminClient()],
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: 'http://localhost:3000',
})

export type AuthSession = typeof authClient.$Infer.Session
export type AuthUser = AuthSession['user']
