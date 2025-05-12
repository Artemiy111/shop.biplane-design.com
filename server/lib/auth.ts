import { betterAuth } from 'better-auth'
import { anonymous, admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'
import { sendVerificationEmail, sendChangeEmailVerification, sendResetPassword } from './email'

export const auth = betterAuth({
  plugins: [anonymous(), admin()],

  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: {
      users: schema.usersT,
      sessions: schema.sessionsT,
      verifications: schema.verificationsT,
      accounts: schema.accountsT,
    },
  }),

  advanced: {
    database: {
      defaultFindManyLimit: undefined,
      generateId: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword,
    autoSignIn: true,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail,
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification,
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
