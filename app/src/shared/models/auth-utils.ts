import { authClient } from '~/src/shared/lib/auth-client'

export { authClient }

export const useAuthUtils = defineStore('auth-utils', () => {
  const sessionData = authClient.useSession()
  const user = computed(() => sessionData.value?.data?.user || null)

  const isAuthed = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCustomer = computed(() => user.value?.role === 'user')
  const isCustomerVerified = computed(() => user.value?.role === 'user' && user.value.emailVerified)

  const useUser = () => user

  return { useUser, user, isAuthed, isAdmin, isCustomer, isCustomerVerified }
})
