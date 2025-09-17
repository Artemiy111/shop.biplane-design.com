import { z } from 'zod'
import 'dotenv/config'

const envString = z.string().min(3)

export const envSchema = z.object({
  BETTER_AUTH_SECRET: envString,
  BETTER_AUTH_URL: envString,
  DATABASE_URL: envString,

  AWS_ACCESS_KEY_ID: envString,
  AWS_SECRET_ACCESS_KEY: envString,
  S3_REGION: envString,
  S3_BUCKET: envString,
  S3_BUCKET_ENDPOINT_URL: envString,

  SMTP_HOST: envString,
  SMTP_USER: envString,
  SMTP_PASS: envString,
})

export const env = envSchema.parse(process.env)
