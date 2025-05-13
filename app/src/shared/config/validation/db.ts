import { z } from 'zod'
import { revitVersions } from '~/src/shared/config/constants'
import { errorMessages, idSchema, minMaxNumber, minMaxString } from '~/src/shared/config/validation/base'

export const createModelSchema = z.object({
  categoryId: idSchema,
  name: minMaxString(2, 64),
  slug: minMaxString(2, 128),
  description: minMaxString(0, 1024).nullable(),
  price: minMaxNumber(0, 100_000),
  discountId: idSchema.nullable(),
  revitVersion: z.enum(revitVersions),
})

export const updateModelSchema = createModelSchema.extend({
  id: idSchema,
})

export type CreateModelSchema = z.infer<typeof createModelSchema>
export type UpdateModelSchema = z.infer<typeof updateModelSchema>

export const updateFileSchema = z.object({
  id: idSchema,
  originalFilename: minMaxString(2, 128),
})

export type UpdateFileSchema = z.infer<typeof updateFileSchema>

export const createDiscountSchema = z.object({
  label: minMaxString(2, 16),
  discountPercentage: minMaxNumber(0, 100),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
}).check(({ issues, value }) => {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    issues.push({
      code: 'custom',
      path: ['startDate'],
      message: 'Дата начала должна быть раньше даты окончания',
      input: value.startDate,
    })
  }
})

export const updateDiscountSchema = createDiscountSchema.extend({
  id: idSchema,
})

export type CreateDiscountSchema = z.infer<typeof createDiscountSchema>
export type UpdateDiscountSchema = z.infer<typeof updateDiscountSchema>
