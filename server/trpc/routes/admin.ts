import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { updateModelSchema, createModelSchema, updateFileSchema } from '~/src/shared/config/validation/db'
import { db } from '~~/server/db'
import { filesT, modelsT } from '~~/server/db/schema'
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

    deleteModel: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await db.delete(modelsT).where(eq(modelsT.id, input.id))
    }),
  }),

  files: router({
    updateFile: adminProcedure.input(updateFileSchema).mutation(async ({ input }) => {
      logger.info('updateFile')
      await db.update(filesT).set(input).where(eq(filesT.id, input.id))
      logger.info('updateFile done')
    }),

    deleteFile: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await db.delete(filesT).where(eq(filesT.id, input.id))
    }),
  }),
})
