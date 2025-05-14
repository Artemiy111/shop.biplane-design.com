import { type ImageExt, type MimeTypeImage as ImageMimeType, type MimeTypeRevit as RevitMimeType, mimeTypesImages, type RevitExt } from '~/src/shared/config/constants/mime-types'

export const mimeToExt = (mime: ImageMimeType | RevitMimeType) => {
  if (mimeTypesImages.includes(mime as ImageMimeType)) return mime.split('/').pop()! as ImageExt
  return 'rvt' as RevitExt
}

export const extToMime = (ext: ImageExt | RevitExt): ImageMimeType | RevitMimeType => {
  if (ext.startsWith('rvt')) return 'application/x-autodesk-revit'
  return `image/${ext}` as ImageMimeType
}

export const imageUrl = (image: { id: string, mimeType: ImageMimeType }) => {
  const config = useRuntimeConfig()
  return `https://${config.public.s3BucketEndpointUrl}/${config.public.s3Bucket}/images/original/${image.id}.${mimeToExt(image.mimeType)}`
}
