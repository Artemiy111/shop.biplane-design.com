export const getPriceAfterDiscount = (price: number, discountPercentage: number) => {
  return Math.round(price - (price * discountPercentage) / 100)
}

export const formatPrice = (price: number, withCurrency = true) => {
  return `${price.toLocaleString('ru-RU')}${withCurrency ? ' ₽' : ''}`
}
