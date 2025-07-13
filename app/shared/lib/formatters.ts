import { DateFormatter } from '@internationalized/date'

export const dateFormatter = new DateFormatter('ru-RU', { dateStyle: 'long' })

export const formatBytes = (bytes: number, locale: string = 'ru-RU') => {
  if (bytes === 0) return '0 Б'

  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(size)

  return `${formatted} ${units[i]}`
}

export const formatPrice = (price: number, withCurrency = true) => {
  return `${price.toLocaleString('ru-RU')}${withCurrency ? ' ₽' : ''}`
}
