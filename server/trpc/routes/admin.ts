import { on } from 'events'
import { eq, max, and, sql, lte, gt, gte, lt } from 'drizzle-orm'
import { z } from 'zod'
import sharp from 'sharp'
import { Mutex } from 'redis-semaphore'
import { idSchema, requiredString } from '~/src/shared/config/validation/base'

import { updateModelSchema, createModelSchema, updateFileSchema, createDiscountSchema, updateDiscountSchema, updateImageSchema, uploadImageSchema, updateImageOrderSchema } from '~/src/shared/config/validation/db'
import { db } from '~~/server/db'
import { discountsT, filesT, imagesT, imageToModelT, modelsT } from '~~/server/db/schema'
import { logger } from '~~/server/lib/logger'
import { router, adminProcedure } from '~~/server/trpc'
import { minio } from '~~/server/lib/minio'
import { env } from '~~/server/lib/env'
import { makeId } from '~/src/shared/lib/id'
import type { ImageMimeType } from '~/src/shared/config/constants/mime-types'
import { redis } from '~~/server/lib/redis'
import { imageOptimizationQueue } from '~~/server/services/image-optimization-queue'
import { ee } from '~~/server/lib/ee'

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
      await db.update(filesT).set(input).where(eq(filesT.id, input.id))
    }),

    deleteFile: adminProcedure.input(z.object({ id: idSchema })).mutation(async ({ input }) => {
      await db.delete(filesT).where(eq(filesT.id, input.id))
    }),
  }),

  images: router({
    uploadImage: adminProcedure.input(data => uploadImageSchema.parse(data) as { modelId: string, modelSlug: string, image: File }).mutation(async ({ input }) => {
      const lockKey = `lock:${input.modelId}:images-order`
      const mutex = new Mutex(redis, lockKey)

      try {
        const fileParts = input.image.name.split('.')
        const mimeType = input.image.type as ImageMimeType
        const ext = fileParts.at(-1)
        const originalFilename = fileParts.slice(0, -1).join('.')
        const buffer = Buffer.from(await input.image.arrayBuffer())
        const metadata = await sharp(buffer).metadata()
        const id = makeId()

        await mutex.acquire()
        logger.info(`Acquired lock ${mutex.isAcquired} ${lockKey} ${id}`)
        const [{ maxSortOrder }] = await db.select({ maxSortOrder: max(imageToModelT.sortOrder) })
          .from(imageToModelT).where(eq(imageToModelT.modelId, input.modelId))
        const sortOrder = Number(maxSortOrder) + 1
        logger.warn(`Sort order: ${sortOrder}`)
        await db.transaction(async (tx) => {
          await tx.insert(imagesT).values({
            id,
            originalFilename,
            mimeType,
            width: metadata.width,
            height: metadata.height,
            size: metadata.size,
          })

          await tx.insert(imageToModelT).values({
            modelId: input.modelId,
            imageId: id,
            sortOrder,
          })

          const s3Filename = `${id}.${ext}`
          const s3Path = `images/original/${s3Filename}`
          await minio.putObject(env.S3_BUCKET, s3Path, buffer, undefined, { 'content-type': mimeType })
        })
        await mutex.release()
        logger.info(`Released lock ${mutex.isAcquired} ${lockKey} ${id}`)

        imageOptimizationQueue.add('image-optimization', { model: { id: input.modelId, slug: input.modelSlug }, imageId: id, buffer: buffer.toString('base64') })
      }
      catch (e) {
        console.log(e)
        throw e
      }
      finally {
        await mutex.release()
      }
    }),

    onImagesOptimized: adminProcedure.subscription(async function* (opts) {
      logger.info('Subscribing to optimized images')

      // const asyncIterator = queueEventsToAsyncIterator(imageOptimizationEvents, 'completed', opts.signal)

      // for await (const event of asyncIterator) {
      //   yield event.returnvalue // или как нужно
      // }

      for await (const [data_] of on(ee, 'optimized', { signal: opts.signal })) {
        logger.info(`GOT event: ${data_.imageId}`)
        const data = data_ as { model: { id: string, slug: string }, imageId: string }
        yield data
      }
    }),

    updateImage: adminProcedure.input(updateImageSchema).mutation(async ({ input }) => {
      await db.update(imagesT).set(input).where(eq(imagesT.id, input.id))
    }),

    updateImageOrder: adminProcedure.input(updateImageOrderSchema).mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [{ currentOrder }] = await tx.select({ currentOrder: imageToModelT.sortOrder }).from(imageToModelT)
          .where(and(eq(imageToModelT.modelId, input.modelId), eq(imageToModelT.imageId, input.imageId)))

        if (currentOrder === input.newSortOrder) return
        else if (input.newSortOrder > currentOrder) {
          await tx.update(imageToModelT).set({ sortOrder: sql`${imageToModelT.sortOrder} - 1` })
            .where(and(
              eq(imageToModelT.modelId, input.modelId),
              gt(imageToModelT.sortOrder, currentOrder),
              lte(imageToModelT.sortOrder, input.newSortOrder),
            ))
        }
        else {
          await tx.update(imageToModelT).set({ sortOrder: sql`${imageToModelT.sortOrder} + 1` })
            .where(and(
              eq(imageToModelT.modelId, input.modelId),
              gte(imageToModelT.sortOrder, input.newSortOrder),
              lt(imageToModelT.sortOrder, currentOrder),
            ))
        }

        await tx.update(imageToModelT).set({ sortOrder: input.newSortOrder })
          .where(and(
            eq(imageToModelT.modelId, input.modelId),
            eq(imageToModelT.imageId, input.imageId),
          ))
      }, { isolationLevel: 'read uncommitted', deferrable: true })
    }),
    deleteImage: adminProcedure.input(z.object({ modelId: idSchema, imageId: idSchema })).mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [{ sortOrder }] = await tx.select({ sortOrder: imageToModelT.sortOrder }).from(imageToModelT)
          .where(and(eq(imageToModelT.modelId, input.modelId), eq(imageToModelT.imageId, input.imageId))).limit(1)
        logger.info('delete image')
        console.log(sortOrder, input.imageId, input.modelId)

        await db.delete(imageToModelT).where(and(eq(imageToModelT.modelId, input.modelId), eq(imageToModelT.imageId, input.imageId)))

        await tx.update(imageToModelT).set({ sortOrder: sql`${imageToModelT.sortOrder} - 1` })
          .where(and(
            eq(imageToModelT.modelId, input.modelId),
            gt(imageToModelT.sortOrder, 1),
            gt(imageToModelT.sortOrder, sortOrder),
          ))
      }, { isolationLevel: 'serializable' })
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
