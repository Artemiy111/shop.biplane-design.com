import { type ImageExt, type ImageMimeType, type RevitMimeType, mimeTypesImages, type RevitExt, type ImageOptimizedMimeType } from '~/src/shared/config/constants/mime-types'

export const mimeToExt = (mime: ImageMimeType | RevitMimeType) => {
  if (mimeTypesImages.includes(mime as ImageMimeType)) return mime.split('/').pop()! as ImageExt
  return 'rvt' as RevitExt
}

export const extToMime = (ext: ImageExt | RevitExt): ImageMimeType | RevitMimeType => {
  if (ext.startsWith('rvt')) return 'application/x-autodesk-revit'
  return `image/${ext}` as ImageMimeType
}

export const imageUrl = (image: { id: string, mimeType: ImageMimeType } | { imageId: string, width: number, mimeType: ImageOptimizedMimeType }) => {
  const config = useRuntimeConfig()
  const base = `https://${config.public.s3BucketEndpointUrl}/${config.public.s3Bucket}/images`

  if ('imageId' in image) return `${base}/optimized/${image.imageId}/${image.width}.${mimeToExt(image.mimeType)}`
  return `${base}/original/${image.id}.${mimeToExt(image.mimeType)}`
}
