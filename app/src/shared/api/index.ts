import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'

import type { AppRouter } from '~~/server/trpc/routes'

const trpc = ref<unknown | null>(null)

export const useApi = () => {
  if (!trpc.value) {
    const url = useRequestURL()
    const client = createTRPCNuxtClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${url.protocol}//${url.host}/api/trpc`,
        }),
      ],
    })
    return client
  }

  return trpc.value as ReturnType<typeof createTRPCNuxtClient<AppRouter>>
}
