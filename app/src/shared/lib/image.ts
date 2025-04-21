export const mimeToExt = (myme: string) => {
  const ext = myme.split('.').pop()
  return ext
}

export const imageUrl = (image: { id: string, mimeType: string }) => {
  const config = useRuntimeConfig()
  return `${config.public.s3BucketEndpointUrl}/${config.public.s3Bucket}/images/original/${image.id}.${mimeToExt(image.mimeType)}`
}
