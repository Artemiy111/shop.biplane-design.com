import { logger } from 'better-auth'
import { Queue, Worker } from 'bullmq'
import sharp from 'sharp'

import type { ImageOptimizedMimeType } from '~/shared/config/constants/mime-types'
import { makeId } from '~/shared/lib/id'
import { extToMime } from '~/shared/lib/image'

import { db } from '~server/db'
import { imagesOptimizedT } from '~server/db/schema'
import { ee } from '~server/lib/ee'
import { env } from '~server/lib/env'
import { minio } from '~server/lib/minio'
import { redis } from '~server/lib/redis'

export const imageOptimizationQueue = new Queue('image-optimization', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true, // Automatically remove completed jobs
    removeOnFail: 5, // keep up to 5 failed jobs
  },
})

interface OptimizationJobData {
  model: {
    id: string
    slug: string
  }
  imageId: string
  buffer: string
}

const generateOptimizedImages = async (
  imageId: string,
  buffer: Buffer,
) => {
  const optimizedExts = ['avif', 'webp'] as const
  const optimizedWidths = [400, 800, 1200]
  const optimizedS3 = (
    await Promise.all(
      optimizedExts.map(ext =>
        Promise.all(
          optimizedWidths.map(async (width) => {
            const s3Filename = `${width}.${ext}`
            const s3Path = `images/optimized/${imageId}/${s3Filename}`
            const data = sharp(buffer).resize({ width }).toFormat(ext)
            const { data: optimizedBuffer, info: metadata } = await data.toBuffer({ resolveWithObject: true })
            return {
              imageId,
              id: makeId(),
              s3Path,
              metadata,
              width: metadata.width!,
              height: metadata.height!,
              size: metadata.size!,
              ext,
              mimeType: extToMime(ext) as ImageOptimizedMimeType,
              buffer: optimizedBuffer,
            }
          }),
        ),
      ),
    )
  ).flat()

  const optimizedDb = optimizedS3.map(
    ({ imageId, id, width, height, size, mimeType }) => ({
      imageId,
      id,
      width,
      height,
      size,
      mimeType,
    }),
  )

  return {
    optimizedS3,
    optimizedDb,
  }
}

const optimizeImages = async ({ model, imageId, buffer: bufferString }: OptimizationJobData) => {
  const buffer = Buffer.from(bufferString, 'base64')

  return await db.transaction(async (tx) => {
    logger.info(`Optimizing images for ${imageId}`)
    try {
      const { optimizedS3, optimizedDb } = await generateOptimizedImages(imageId, buffer)

      await db.insert(imagesOptimizedT).values(optimizedDb)
      await Promise.all(
        optimizedS3.map(async ({ s3Path, buffer, size, mimeType }) => {
          await minio.putObject(env.S3_BUCKET, s3Path, buffer, size, {
            'content-type': mimeType,
          })
        }),
      )

      logger.info(
        `Successfully optimized and uploaded images for ${imageId}`,
      )
      ee.emit('optimized', { model, imageId })
      return { model, imageId }
    }
    catch (error) {
      logger.error(
        `Error optimizing and uploading images for ${imageId}:`,
        error,
      )
      tx.rollback()
      throw error // Re-throw the error so Bull can retry the job
    }
  })
}

export const imageOptimizationWorker = new Worker<OptimizationJobData>('image-optimization', async (job) => {
  if (job.name !== 'image-optimization') return
  return await optimizeImages(job.data)
}, { connection: redis })
