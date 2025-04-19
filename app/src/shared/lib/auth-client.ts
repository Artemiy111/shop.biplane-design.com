import { createAuthClient } from 'better-auth/vue'
import { anonymousClient, adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [anonymousClient(), adminClient()],
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: 'http://localhost:3000',
})
