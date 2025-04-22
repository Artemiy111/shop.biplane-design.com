import { useApi } from '~/src/shared/api'

export const useCategories = defineQuery({ key: ['categories'], query: () => useApi().public.getCategories.query() })
