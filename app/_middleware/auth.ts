import { authClient } from '~/shared/lib'
// import { useAuthUtils } from '~/shared/models/auth-utils'

export default defineNuxtRouteMiddleware(async () => {
  // const authUtils = useAuthUtils()
  const { data: session } = await authClient.useSession(useFetch)
  // if (!authUtils.user) {
  // return navigateTo('/auth/login')
  // }
  if (!session.value?.user) {
    return navigateTo('/auth/login')
  }
})
