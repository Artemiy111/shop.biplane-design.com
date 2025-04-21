export const priceAfterDiscount = (price: number, discountPercentage: number) => {
  return Math.round(price - (price * discountPercentage) / 100)
}

export const formatPrice = (price: number) => {
  return price.toLocaleString('ru-RU') + ' Р'
}
