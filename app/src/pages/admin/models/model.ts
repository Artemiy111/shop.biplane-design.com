import type { UnwrapRef } from 'vue'

import { useApi } from '~/src/shared/api'
import { useAuthUtils } from '~/src/shared/models/auth-utils'

export const useAdminModelsPreview = defineQuery(() => {
  const authUtils = useAuthUtils()
  const { data: _models, state: _, ...rest } = useQuery({
    key: ['admin', 'models'],
    query: async () => await useApi().admin.models.getModelsPreview.query(),
    enabled: () => authUtils.isAdmin,
  })
  const models = computed(() => _models.value || [])
  return { models, ...rest }
})

export type AdminModelPreview = UnwrapRef<ReturnType<typeof useAdminModelsPreview>['models']>[number]
