export const getPriceAfterDiscount = (price: number, discountPercentage: number) => {
  return Math.round(price - (price * discountPercentage) / 100)
}
