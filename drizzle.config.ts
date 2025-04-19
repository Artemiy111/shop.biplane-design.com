import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: false,
  },
  dialect: 'postgresql',
  out: './server/db/migrations',
  schema: './server/db/schema.ts',
  casing: 'snake_case',
})
