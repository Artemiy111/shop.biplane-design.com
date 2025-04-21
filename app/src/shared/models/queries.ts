import { useApi } from '../api'

export const useCategories = defineQuery({ key: ['categories'], query: () => useApi().categories.query() })
