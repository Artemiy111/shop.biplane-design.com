import Redis from 'ioredis'
import { logger } from '~~/server/lib/logger'

export const redis = new Redis({
  // host: 'localhost',
  // host: env.REDIS_HOST,
  // port: parseInt(env.REDIS_PORT),
  // password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
})

redis.on('connect', () => {
  logger.info('Redis connected')
})

redis.on('error', (err) => {
  logger.error('Redis connection error', err)
})

// export async function acquireLock(key: string, ttl = 5000, retryDelay = 50, maxRetries = 100) {
//   for (let i = 0; i < maxRetries; i++) {
//     const lock = await redis.set(key, '1', 'NX', 'PX', ttl)
//     if (lock) {
//       return true // лок получен
//     }
//     await new Promise(r => setTimeout(r, retryDelay))
//   }
//   return false // не удалось получить лок
// }

// export async function releaseLock(redis, key) {
//   await redis.del(key)
// }
