export const orderStatuses = ['pending', 'confirmed', 'failed'] as const
export type OrderStatus = typeof orderStatuses[number]

export const paymentProviders = ['tbank'] as const
export type PaymentProvider = typeof paymentProviders[number]

export const refundStatuses = ['pending', 'confirmed', 'failed'] as const
export type RefundStatus = typeof refundStatuses[number]
