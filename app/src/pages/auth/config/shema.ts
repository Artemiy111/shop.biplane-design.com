import { z } from 'zod'
import { requiredString, errorMessages, emailSchema, passwordSchema, minMaxString } from '~/src/shared/config/validation/base'

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginSchema = z.output<typeof loginSchema>

export const registerSchema = z.object({
  name: minMaxString(2, 50),
  email: z.email(errorMessages.email),
  password: passwordSchema,
  confirm: requiredString,
}).refine(data => data.password === data.confirm, {
  error: 'Пароли не совпадают',
  path: ['confirm'],
})

export type RegisterSchema = z.output<typeof registerSchema>

export const forgetPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgetPasswordSchema = z.output<typeof forgetPasswordSchema>

export const resetPasswordSchema = z.object({
  token: requiredString,
  password: passwordSchema,
  confirm: requiredString,
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
