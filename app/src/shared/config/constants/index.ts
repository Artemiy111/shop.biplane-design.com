export const orderStatuses = ['pending', 'confirmed', 'failed'] as const
export type OrderStatus = typeof orderStatuses[number]

export const paymentProviters = ['tbank'] as const
export type PaymentProviter = typeof paymentProviters[number]

export const refundStatuses = ['pending', 'confirmed', 'failed'] as const
export type RefundStatus = typeof refundStatuses[number]
