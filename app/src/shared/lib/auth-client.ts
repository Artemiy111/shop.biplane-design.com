import { createAuthClient } from 'better-auth/vue'
import { anonymousClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [anonymousClient()],
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: 'http://localhost:3000',
})
