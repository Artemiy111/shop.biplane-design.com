import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'
import { splitLink, isNonJsonSerializable } from '@trpc/client'

import type { AppRouter } from '~~/server/trpc/routes'

const trpc = ref<unknown | null>(null)

export const useApi = () => {
  if (!trpc.value) {
    const url = useRequestURL()
    const client = createTRPCNuxtClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => {
            return isNonJsonSerializable(op.input)
          },
          true: httpLink({
            url: `${url.protocol}//${url.host}/api/trpc`,
          }),
          false: httpBatchLink({
            url: `${url.protocol}//${url.host}/api/trpc`,
          }),
        }),
      ],
    })
    return client
  }

  return trpc.value as ReturnType<typeof createTRPCNuxtClient<AppRouter>>
}
