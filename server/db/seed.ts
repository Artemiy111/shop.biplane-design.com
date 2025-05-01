import { logger } from 'better-auth'
import { auth } from '../lib/auth'
import {
  type SetDb,
  type DiscountDb,
  type FileDb,
  type ImageDb,
  type ImageToModelDb,
  type ModelDb,
  type CategoryDb,
  type PromocodeDb,
  type ModelsToSetsDb,
  categories,
  models,
  images,
  imageToModel,
  files,
  discounts,
  promocodes,
  sets,
  modelsToSets,
} from './schema'

import { db } from '.'

export const _categories: CategoryDb[] = [
  {
    id: '1',
    name: 'Мебель',
    slug: 'furniture',
    description: '',
  },
  {
    id: '2',
    name: 'Сантехника',
    slug: 'plumbing',
    description: '',
  },
  {
    id: '3',
    name: 'Освещение',
    slug: 'lighting',
    description: '',
  },
  {
    id: '4',
    name: 'Декор',
    slug: 'decor',
    description: '',
  },
  {
    id: '5',
    name: 'Окна и двери',
    slug: 'windows-and-doors',
    description: '',
  },
  {
    id: '6',
    name: 'Кухонное оборудование',
    slug: 'kitchen-equipment',
    description: '',
  },
  {
    id: '7',
    name: 'Отопление и вентиляция',
    slug: 'heating-and-ventilation',
    description: '',
  },
  {
    id: '8',
    name: 'Электрика',
    slug: 'electrical',
    description: '',
  },
  {
    id: '9',
    name: 'Фасадные элементы',
    slug: 'facade-elements',
    description: '',
  },
  {
    id: '10',
    name: 'Ландшафт',
    slug: 'landscape',
    description: '',
  },
]

export const _models: ModelDb[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'Столик',
    slug: 'table',
    description: '',
    price: 2_000,
    discountId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    revitVersion: '2023',
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Camps Bay Set Oak',
    slug: 'camps-bay-set-oak',
    description: '',
    price: 2_000,
    discountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    revitVersion: '2023',
  },
]

export const _sets: SetDb[] = [
  {
    id: '1',
    name: 'Набор моделей столов',
    description: 'Включает различные функциоанльные столы для офисов и квартир',
    slug: 'table-set-1',
    price: 5000,
    discountId: null,
    createdAt: new Date(),
    imageId: null,
  },
]

export const _modelsToSets: ModelsToSetsDb[] = [
  {
    setId: '1',
    modelId: '1',
  },
  {
    setId: '1',
    modelId: '2',
  },
]

export const _images: ImageDb[] = [
  {
    id: '1',
    mimeType: 'image/jpeg',
    url: 'https://img-new.cgtrader.com/items/6056534/005c1aed8e/moroso-dining-set-tulp-chair-vol-table-round-3d-model-005c1aed8e.jpg',
    createdAt: new Date(),
    width: null,
    height: null,
    size: null,
    alt: null,
    originalFilename: null,
  },
  {
    id: '2',
    mimeType: 'image/jpeg',
    url: 'https://img-new.cgtrader.com/items/3227239/79fa92efb6/camps-bay-set-oak-3d-model-max-obj-fbx-mat.jpg',
    createdAt: new Date(),
    width: null,
    height: null,
    size: null,
    alt: null,
    originalFilename: null,
  },
  {
    id: '3',
    mimeType: 'image/jpeg',
    url: 'https://img-new.cgtrader.com/items/3227239/c0a24e23c5/camps-bay-set-oak-3d-model-max-obj-fbx-mat.jpg',
    createdAt: new Date(),
    width: null,
    height: null,
    size: null,
    alt: null,
    originalFilename: null,
  },
  {
    id: '4',
    mimeType: 'image/jpeg',
    url: 'https://img-new.cgtrader.com/items/3227239/04d79f851d/camps-bay-set-oak-3d-model-max-obj-fbx-mat.jpg',
    createdAt: new Date(),
    width: null,
    height: null,
    size: null,
    alt: null,
    originalFilename: null,
  },
]

export const _imagesToModels: ImageToModelDb[] = [
  {
    imageId: '1',
    modelId: '1',
    sortOrder: 1,
  },
  {
    imageId: '2',
    modelId: '2',
    sortOrder: 1,
  },
  {
    imageId: '3',
    modelId: '2',
    sortOrder: 2,
  },
  {
    imageId: '4',
    modelId: '2',
    sortOrder: 3,
  },
]

export const _files: FileDb[] = [
  {
    id: '1',
    modelId: '1',
    mimeType: 'application/revit',
    size: 10000,
    createdAt: new Date(),
  },
  {
    id: '2',
    modelId: '2',
    mimeType: 'application/revit',
    size: 20000,
    createdAt: new Date(),
  },
]

export const _discounts: DiscountDb[] = [
  {
    id: '1',
    label: 'Пасха 2025',
    discountPercentage: 10,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-3-31'),
  },
]

export const _promocodes: PromocodeDb[] = [
  {
    id: '1',
    code: 'PROMOCODE',
    discountPercentage: 10,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    maxUsage: 10,
    usedCount: 0,
  },
]

const seed = async () => {
  await db.transaction(async (tx) => {
    await tx.insert(discounts).values(_discounts)
    await tx.insert(promocodes).values(_promocodes)

    await tx.insert(categories).values(_categories)
    await tx.insert(models).values(_models)
    await tx.insert(sets).values(_sets)
    await tx.insert(modelsToSets).values(_modelsToSets)
    await tx.insert(images).values(_images)
    await tx.insert(imageToModel).values(_imagesToModels)
    await tx.insert(files).values(_files)

    const _admin = await auth.api.createUser({ body: {
      email: 'admin@admin.com',
      password: 'admin@admin.com',
      name: 'Admin',
      role: 'admin',
    } })

    const _user = await auth.api.createUser({ body: {
      email: 'user@user.com',
      password: 'user@user.com',
      name: 'User',
      role: 'user',
    } })
  }, {
    deferrable: true,
  })
}

seed()
logger.success('Seed is done')
