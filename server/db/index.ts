import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../lib/env'
import { relations } from './relations'

export const db = drizzle(env.DATABASE_URL, { casing: 'snake_case', relations })

export type Db = typeof db
