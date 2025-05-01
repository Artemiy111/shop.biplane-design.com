import { authClient } from '~/src/shared/lib/auth-client'
import { useAuthUtils } from '~/src/shared/models/auth-utils'

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch)
  if (!session.value || (session.value && session.value.user.role !== 'user')) {
    return navigateTo('/auth/login')
  }
})

// export default defineNuxtRouteMiddleware(async () => {
//   const authUtils = useAuthUtils()
//   if (!authUtils.isCustomer) {
//     return navigateTo('/auth/login')
//   }
// })
