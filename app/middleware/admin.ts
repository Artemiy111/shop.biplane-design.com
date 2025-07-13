import { authClient } from '~/shared/lib'
// import { useAuthUtils } from '~/shared/models/auth-utils'

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch)
  if (!session.value || (session.value && session.value.user.role !== 'admin')) {
    return navigateTo('/catalog')
  }
})

// export default defineNuxtRouteMiddleware(async () => {
//   const authUtils = useAuthUtils()
//   if (!authUtils.isCustomer) {
//     return navigateTo('/auth/login')
//   }
// })
