import { authClient } from '~/src/shared/lib/auth-client'

export { authClient }

export const useAuthUtils = defineStore('auth-utils', () => {
  const sessionData = authClient.useSession()
  const user = computed(() => sessionData.value?.data?.user || null)
  const userSession = computed(() => sessionData.value?.data?.session || null)
  const isPending = computed(() => sessionData.value?.isPending)
  const isError = computed(() => !!sessionData.value?.error)

  const isAuthed = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCustomer = computed(() => user.value?.role === 'user')
  const isCustomerVerified = computed(() => user.value?.role === 'user' && user.value.emailVerified)

  const useUser = () => user

  return {
    useUser,
    user,
    userSession,
    sessionData: { isPending: isPending, isError: isError },
    isPending,
    isError,
    isAuthed,
    isAdmin,
    isCustomer,
    isCustomerVerified,
  }
})
