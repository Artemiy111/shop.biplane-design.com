import { z } from 'zod'

const formatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short' })

export const errorMessages = {
  required: 'Это обязательное поле',
  email: 'Неверный формат электронной почты',
  minLength: (min: number | bigint) => `Длина должна быть не менее ${min}`,
  maxLength: (max: number | bigint) => `Длина должна быть не более ${max}`,
  pattern: 'Значение не соответствует шаблону',
  minValue: (min: number | bigint) => `Значение должно быть не менее ${min}`,
  maxValue: (max: number | bigint) => `Значение должно быть не более ${max}`,
  minDate: (min: Date) => `Дата должна быть не раньше ${formatter.format(min)}`,
  maxDate: (max: Date) => `Дата должна быть не позже ${formatter.format(max)}`,
  minYear: (min: number | bigint) => `Год должен быть не менее ${min}`,
  maxYear: (max: number | bigint) => `Год должен быть не более ${max}`,
  passwordsNotMatch: 'Пароли не совпадают',
  invalidPhoneNumber: 'Неверный номер телефона',
  passwordsDoNotMatch: 'Пароли не совпадают',
}

export const requiredString = z.string(errorMessages.required)
export const requiredNumber = z.number(errorMessages.required)

export const minMaxString = (min: number, max: number) => requiredString.min(min, errorMessages.minLength(min)).max(max, errorMessages.maxLength(max))
export const minMaxNumber = (min: number, max: number) => requiredNumber.min(min, errorMessages.minValue(min)).max(max, errorMessages.maxValue(max))

export const emailSchema = z.email(errorMessages.email)
export const passwordSchema = minMaxString(8, 100)

export const idSchema = z.cuid2({ error: 'Неверный Id' })
