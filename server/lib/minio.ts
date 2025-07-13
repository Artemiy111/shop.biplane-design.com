import * as Minio from 'minio'

import { env } from './env'

export const minio = new Minio.Client({
  endPoint: env.S3_BUCKET_ENDPOINT_URL,
  accessKey: env.AWS_ACCESS_KEY_ID,
  secretKey: env.AWS_SECRET_ACCESS_KEY,
  useSSL: true,
})
