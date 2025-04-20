import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'

import type { AppRouter } from '~~/server/api/trpc/[trpc]'

const trpc = ref<unknown | null>(null)

export const useApi = () => {
  if (!trpc.value) {
    const client = createTRPCNuxtClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${useRequestURL().protocol}//${useRequestURL().host}/api/trpc`,
        }),
      ],
    })
    return client
  }

  return trpc.value as ReturnType<typeof createTRPCNuxtClient<AppRouter>>
}
