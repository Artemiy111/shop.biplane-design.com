import { type ImageExt, type MimeTypeImage, type MimeTypeRevit, mimeTypesImages, type RevitExt } from '~/src/shared/config/constants/mime-types'

export const mimeToExt = (mime: MimeTypeImage | MimeTypeRevit) => {
  if (mimeTypesImages.includes(mime as MimeTypeImage)) return mime.split('/').pop()! as ImageExt
  return 'rvt' as RevitExt
}

export const imageUrl = (image: { id: string, mimeType: MimeTypeImage }) => {
  const config = useRuntimeConfig()
  return `${config.public.s3BucketEndpointUrl}/${config.public.s3Bucket}/images/original/${image.id}.${mimeToExt(image.mimeType)}`
}
