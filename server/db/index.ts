import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '../lib/env'
import { logger } from '../lib/logger'

import { relations } from './relations'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

pool.on('connect', () => {
  logger.info('Postgres connected')
})

pool.on('error', (err) => {
  logger.error('Postgres connection error', err)
})

export const db = drizzle({ client: pool, casing: 'snake_case', relations, logger: false })

export type Db = typeof db
