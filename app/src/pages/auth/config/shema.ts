import { z } from 'zod'
import { minMaxString, requiredString, errorMessages } from '~/src/shared/config/validation/base'

export const loginSchema = z.object({
  email: z.email(errorMessages.email),
  password: minMaxString(8, 100),
})

export type LoginSchema = z.output<typeof loginSchema>

export const registerSchema = z.object({
  name: minMaxString(2, 100),
  email: z.email(errorMessages.email),
  password: minMaxString(8, 100),
  confirm: requiredString,
}).refine(data => data.password === data.confirm, {
  error: 'Пароли не совпадают',
  path: ['confirm'],
})

export type RegisterSchema = z.output<typeof registerSchema>
