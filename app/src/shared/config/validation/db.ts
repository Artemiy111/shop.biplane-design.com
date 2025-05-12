import { z } from 'zod'
import { revitVersions } from '~/src/shared/config/constants'
import { errorMessages, minMaxString } from '~/src/shared/config/validation/base'

export const createModelSchema = z.object({
  categoryId: z.string(),
  name: minMaxString(2, 64),
  slug: minMaxString(2, 128),
  description: z.string().max(1024, { error: errorMessages.maxLength(1024) }).nullable(),
  price: z.number().min(0),
  discountId: z.string().nullable(),
  revitVersion: z.enum(revitVersions),
})

export const updateModelSchema = createModelSchema.extend({
  id: z.string(),
})

export type CreateModelSchema = z.infer<typeof createModelSchema>
export type UpdateModelSchema = z.infer<typeof updateModelSchema>

export const updateFileSchema = z.object({
  id: z.string(),
  originalFilename: minMaxString(2, 128),
})

export type UpdateFileSchema = z.infer<typeof updateFileSchema>
