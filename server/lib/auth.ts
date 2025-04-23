import { betterAuth } from 'better-auth'
import { anonymous, admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'
import { sendVerificationEmail } from './email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema,
  }),
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail,
  },
  emailAndPassword: { enabled: true },
  plugins: [anonymous(), admin()],
  advanced: {
    database: {
      defaultFindManyLimit: undefined,
      generateId: false,
    },
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //     scope: ['user:email'],
  //   }
  // }
})

export type AuthSession = typeof auth.$Infer.Session
export type AuthUser = AuthSession['user']
