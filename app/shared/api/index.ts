import { httpSubscriptionLink, isNonJsonSerializable, splitLink } from '@trpc/client'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

import type { AppRouter } from '~server/trpc/routes'

const trpc = ref<unknown | null>(null)

export const useApi = () => {
  if (!trpc.value) {
    const url = useRequestURL()
    const client = createTRPCNuxtClient<AppRouter>({
      links: [
        splitLink({
          condition: op => op.type === 'subscription',
          true: httpSubscriptionLink({ url: `${url.protocol}//${url.host}/api/trpc`, eventSourceOptions: () => {
            return {
              headers: useRequestHeaders(),
            }
          } }),
          false: httpLink({
            url: `${url.protocol}//${url.host}/api/trpc`,
          }),
        }),
        // splitLink({
        //   condition: (op) => {
        //     return isNonJsonSerializable(op.input)
        //   },
        //   true: httpLink({
        //     url: `${url.protocol}//${url.host}/api/trpc`,
        //   }),
        //   false: httpBatchLink({
        //     url: `${url.protocol}//${url.host}/api/trpc`,
        //   }),
        // }),
      ],
    })
    return client
  }

  return trpc.value as ReturnType<typeof createTRPCNuxtClient<AppRouter>>
}
