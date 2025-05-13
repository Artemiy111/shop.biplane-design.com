import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { idSchema, requiredString } from '~/src/shared/config/validation/base'

import { updateModelSchema, createModelSchema, updateFileSchema, createDiscountSchema, updateDiscountSchema } from '~/src/shared/config/validation/db'
import { db } from '~~/server/db'
import { discountsT, filesT, modelsT } from '~~/server/db/schema'
import { logger } from '~~/server/lib/logger'
import { router, adminProcedure } from '~~/server/trpc'

export const adminRouter = router({
  getCategoriesSimple: adminProcedure.query(async () => {
    return await db.query.categoriesT.findMany()
  }),

  models: router({
    getModelsPreview: adminProcedure.query(async () => {
      return await db.query.modelsT.findMany({
        with: {
          category: true,
          discount: true,
          images: {
            limit: 1,
            with: {
              optimized: true,
            },
          },
        },
      })
    }),

    createModel: adminProcedure.input(createModelSchema).mutation(async ({ input }) => {
      await db.insert(modelsT).values(input)
    }),

    updateModel: adminProcedure.input(updateModelSchema).mutation(async ({ input }) => {
      logger.info('updateModel')
      await db.update(modelsT).set(input).where(eq(modelsT.id, input.id))
      logger.info('updateModel done')
    }),

    deleteModel: adminProcedure.input(z.object({ id: idSchema })).mutation(async ({ input }) => {
      await db.delete(modelsT).where(eq(modelsT.id, input.id))
    }),

    selectDiscount: adminProcedure.input(z.object({ slug: requiredString, discountId: idSchema.nullable() })).mutation(async ({ input }) => {
      if (!input.discountId) await db.update(modelsT).set({ discountId: null }).where(eq(modelsT.slug, input.slug))
      else await db.update(modelsT).set({ discountId: input.discountId }).where(eq(modelsT.slug, input.slug))
    }),
  }),

  files: router({
    uploadFile: adminProcedure.input(z.object({ originalFilename: z.string() })).mutation(async ({ input }) => {
      // await db.insert(filesT).values(input)
    }),
    updateFile: adminProcedure.input(updateFileSchema).mutation(async ({ input }) => {
      logger.info('updateFile')
      await db.update(filesT).set(input).where(eq(filesT.id, input.id))
      logger.info('updateFile done')
    }),

    deleteFile: adminProcedure.input(z.object({ id: idSchema })).mutation(async ({ input }) => {
      await db.delete(filesT).where(eq(filesT.id, input.id))
    }),
  }),

  discounts: router({
    getDiscounts: adminProcedure.query(async () => {
      return await db.query.discountsT.findMany()
    }),
    createDiscount: adminProcedure.input(createDiscountSchema).mutation(async ({ input }) => {
      await db.insert(discountsT).values(input)
    }),
    updateDiscount: adminProcedure.input(updateDiscountSchema).mutation(async ({ input }) => {
      await db.update(discountsT).set(input).where(eq(discountsT.id, input.id))
    }),
    deleteDiscount: adminProcedure.input(z.object({ id: idSchema })).mutation(async ({ input }) => {
      await db.delete(discountsT).where(eq(discountsT.id, input.id))
    }),
  }),
})
