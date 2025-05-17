import { betterAuth } from 'better-auth'
import { anonymous, admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import * as schema from '../db/schema'
import { sendVerificationEmail, sendChangeEmailVerification, sendResetPassword } from './email'

const names = [
  'Фасадный Гуру',
  'Бетонный Поэт',
  'Архи Пират',
  'Несущий Космос',
  'Балконный Философ',
  'Оконный Целитель',
  'Кирпичный Шаман',
  'Лестничный Гений',
  'Генплан на Коленке',
  'Ремонтник Без Бюджета',
  'Икеевский Бунтарь',
  'Кисточка Без Контекста',
  'Штукатурный Бандит',
  'Модернист в Лаптях',
  'Хайтек из Картона',
  'Архитектор Драмы',
  'Чертежный Мститель',
  'Маляр с Характером',
  'Плинтусный Гений',
  'Колонный Анархист',
  'Фундаментный Романтик',
  'Эскизный Террорист',
  'Макетный Волшебник',
  'Гипсокартонный Шаолинь',
  'Интерьерный Детектив',
  'Витражный Алхимик',
  'Фасадно-Парковый',
  'Арт-Объект в Тапках',
  'Конструктор Легенд',
  'Сметный Поэт',
  'Перспективный Пират',
  'Акварельный Хулиган',
]

export const auth = betterAuth({
  plugins: [anonymous({
    generateName: () => names[Math.floor(Math.random() * names.length)],
    emailDomainName: 'a.non',
    onLinkAccount: async ({ anonymousUser, newUser }) => {
      await db.transaction(async (tx) => {
        const u = await tx.query.usersT.findFirst({ where: { id: newUser.user.id } })
        console.log('u', u, newUser.user)
        await tx.update(schema.favoritesT).set({
          userId: newUser.user.id,
        }).where(eq(schema.favoritesT.userId, anonymousUser.user.id))

        await tx.update(schema.favoritesT).set({
          userId: newUser.user.id,
        }).where(eq(schema.favoritesT.userId, anonymousUser.user.id))
      })
    },
  }), admin()],

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
