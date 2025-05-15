import { eq, max, and, sql, lte, gt, gte, lt } from 'drizzle-orm'
import { z } from 'zod'
import sharp from 'sharp'
import { idSchema, requiredString } from '~/src/shared/config/validation/base'

import { updateModelSchema, createModelSchema, updateFileSchema, createDiscountSchema, updateDiscountSchema, updateImageSchema, uploadImageSchema, updateImageOrderSchema } from '~/src/shared/config/validation/db'
import { db } from '~~/server/db'
import { discountsT, filesT, imagesOptimizedT, imagesT, imageToModelT, modelsT } from '~~/server/db/schema'
import { logger } from '~~/server/lib/logger'
import { router, adminProcedure } from '~~/server/trpc'
import { minio } from '~~/server/lib/minio'
import { env } from '~~/server/lib/env'
import { makeId } from '~/src/shared/lib/id'
import type { ImageMimeType, ImageOptimizedMimeType } from '~/src/shared/config/constants/mime-types'
import { extToMime } from '~/src/shared/lib/image'

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
    uploadImage: adminProcedure.input(data => uploadImageSchema.parse(data) as { modelId: string, image: File }).mutation(async ({ input }) => {
      try {
        await db.transaction(async (tx) => {
        // TODO пофиксить гонку
          logger.info('uploadImage')
          const fileParts = input.image.name.split('.')
          const mimeType = input.image.type as ImageMimeType
          const ext = fileParts.at(-1)
          const originalFilename = fileParts.slice(0, -1).join('.')
          const size = input.image.size
          const buffer = Buffer.from(await input.image.arrayBuffer())
          const metadata = await sharp(buffer).metadata()
          const id = makeId()

          const generateOptimizedImages = async (id: string, buffer: Buffer) => {
            const optimizedExts = ['avif', 'webp'] as const
            const optimizedWidths = [400, 800, 1200]

            const optimizedS3 = (await Promise.all(optimizedExts.map(ext => Promise.all(optimizedWidths.map(async (width) => {
              const newId = makeId()
              const s3Filename = `${width}.${ext}`
              const s3Path = `images/optimized/${id}/${s3Filename}`
              const data = sharp(buffer)
                .resize({ width })
                .toFormat(ext)
              const metadata = await data.metadata()
              const optimizedBuffer = await data.toBuffer()

              return {
                imageId: id,
                id: newId,
                s3Path,
                metadata,
                width: metadata.width!,
                height: metadata.height!,
                size: metadata.size!,
                ext,
                mimeType: extToMime(ext) as ImageOptimizedMimeType,
                buffer: optimizedBuffer,
              }
            }))))).flat()

            const optimizedDb = optimizedS3.map(({ imageId, id, width, height, size, mimeType }) => ({
              imageId: imageId,
              id,
              width,
              height,
              size,
              mimeType,
            }))

            return {
              optimizedS3,
              optimizedDb,
            }
          }

          const optimizedPromise = generateOptimizedImages(id, buffer)

          await tx.insert(imagesT).values({
            id,
            originalFilename,
            size,
            mimeType,
            width: metadata.width,
            height: metadata.height,
          })

          const [{ maxSortOrder }] = (await tx.select({ maxSortOrder: max(imageToModelT.sortOrder) }).from(imageToModelT).where(eq(imageToModelT.modelId, input.modelId)))
          const sortOrder = maxSortOrder ? maxSortOrder + 1 : 1

          await tx.insert(imageToModelT).values({
            modelId: input.modelId,
            imageId: id,
            sortOrder,
          })

          const { optimizedS3, optimizedDb } = await optimizedPromise

          await tx.insert(imagesOptimizedT).values(optimizedDb)

          const s3Filename = `${id}.${ext}`
          const s3Path = `images/original/${s3Filename}`

          logger.info('uploadImage to s3')
          await minio.putObject(env.S3_BUCKET, s3Path, buffer, undefined, { 'content-type': mimeType })

          Promise.all(optimizedS3.map(async ({ s3Path, buffer, width, ext, mimeType }) => {
            logger.info(`uploadImage to s3 optimized ${width} ${ext}`)
            await minio.putObject(env.S3_BUCKET, s3Path, buffer, size, { 'content-type': mimeType })
          }))
          logger.info('uploadImage to s3 done')
        }, { isolationLevel: 'serializable' })
      }
      catch (e) {
        logger.error('uploadImage error', e)
        console.log(e)
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
      }, { isolationLevel: 'serializable', deferrable: true })
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
