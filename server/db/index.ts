import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../lib/env'
import * as schema from './schema'

export const db = drizzle(env.DATABASE_URL, { casing: 'snake_case', schema })

export type Db = typeof db
