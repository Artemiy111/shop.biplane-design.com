import { pgTable, text, timestamp, boolean, integer, decimal, index, primaryKey } from 'drizzle-orm/pg-core'
import { makeId } from '../../app/src/shared/lib/id'
import { userRoles } from '../../app/src/shared/config/constants/user'
import { mimeTypesImages, mimeTypesRevit } from '../../app/src/shared/config/constants/mime-types'
import { paymentProviders, orderStatuses, refundStatuses } from '../../app/src/shared/config/constants'

export const users = pgTable('users', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  isAnonymous: boolean(),
  role: text({ enum: userRoles }).notNull().default('user'),
  banned: boolean(),
  banReason: text(),
  banExpires: timestamp(),
})

export type UserDb = typeof users.$inferSelect

export const sessions = pgTable('sessions', {
  id: text().primaryKey().$default(makeId),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
}, t => [index().on(t.userId), index().on(t.token)])

export type SessionDb = typeof sessions.$inferSelect

export const accounts = pgTable('accounts', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
}, t => [index().on(t.userId)])

export type AccountDb = typeof accounts.$inferSelect

export const verifications = pgTable('verifications', {
  id: text().primaryKey().$default(makeId),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
}, t => [index().on(t.identifier)])

export type VerificationDb = typeof verifications.$inferSelect

export const categories = pgTable('categories', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  description: text(),
})

export type CategoryDb = typeof categories.$inferSelect

export const sets = pgTable('sets', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  price: decimal({ mode: 'number' }).notNull(),
  discountId: text().references(() => discounts.id),
  imageId: text().references(() => images.id),
  createdAt: timestamp().defaultNow(),
})

export type SetDb = typeof sets.$inferSelect

export const models = pgTable('models', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  categoryId: text().notNull().references(() => categories.id, { onDelete: 'set null' }),
  // fileFormat: text(),
  // fileSize: integer(),
  revitVersion: text({ enum: ['2023'] }),
  price: decimal({ mode: 'number' }).notNull(),
  discountId: text().references(() => discounts.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
}, t => [index().on(t.categoryId)])

export type ModelDb = typeof models.$inferSelect

export const images = pgTable('images', {
  id: text().primaryKey().$default(makeId),
  mimeType: text({ enum: mimeTypesImages }).notNull(),
  originalFilename: text(),
  url: text(),
  alt: text(),
  size: integer(),
  width: integer(),
  height: integer(),
  createdAt: timestamp().defaultNow(),
})

export type ImageDb = typeof images.$inferSelect

export const imagesOptimized = pgTable('images_optimized', {
  id: text().primaryKey().$default(makeId),
  imageId: text().notNull().references(() => images.id, { onDelete: 'cascade' }),
  mimeType: text({ enum: ['image/webp', 'image/avif'] }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp().defaultNow(),
}, t => [index().on(t.imageId)])

export type ImageOptimizedDb = typeof imagesOptimized.$inferSelect

export const imageToModel = pgTable('image_to_model', {
  imageId: text().notNull().primaryKey().references(() => images.id, { onDelete: 'cascade' }),
  modelId: text().notNull().references(() => models.id, { onDelete: 'cascade' }),
  sortOrder: integer().notNull(),
}, t => [
  index().on(t.modelId), // Для быстрого поиска по товару
])

export type ImageToModelDb = typeof imageToModel.$inferSelect

const mimeTypeFiles = [...mimeTypesRevit, 'application/zip', 'application/octet-stream'] as const

export const files = pgTable('files', {
  id: text().primaryKey().$default(makeId),
  modelId: text().notNull().references(() => models.id, { onDelete: 'cascade' }),
  mimeType: text({ enum: mimeTypeFiles }).notNull(),
  size: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export type FileDb = typeof files.$inferSelect

export const modelsToSets = pgTable('models_to_sets', {
  modelId: text().notNull().references(() => models.id, { onDelete: 'cascade' }),
  setId: text().notNull().references(() => sets.id, { onDelete: 'cascade' }),
}, t => [primaryKey({ columns: [t.modelId, t.setId] })])

export type ModelsToSetsDb = typeof modelsToSets.$inferSelect

export const discounts = pgTable('discounts', {
  id: text().primaryKey().$default(makeId),
  label: text(),
  discountPercentage: decimal({ mode: 'number' }).notNull(),
  startDate: timestamp(),
  endDate: timestamp(),
})

export type DiscountDb = typeof discounts.$inferSelect

export const promocodes = pgTable('promocodes', {
  id: text().primaryKey().$default(makeId),
  code: text().notNull().unique(),
  discountPercentage: decimal({ mode: 'number' }).notNull(),
  startDate: timestamp(),
  endDate: timestamp(),
  maxUsage: integer(),
  usedCount: integer().default(0),
})

export type PromocodeDb = typeof promocodes.$inferSelect

export const orders = pgTable('orders', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => users.id, { onDelete: 'restrict' }),
  totalPrice: decimal({ mode: 'number' }).notNull(),
  totalPriceBeforeDiscount: decimal({ mode: 'number' }).notNull(),

  promocodeId: text().references(() => promocodes.id),
  createdAt: timestamp().notNull().defaultNow(),

  paymentProvider: text({ enum: paymentProviders }).notNull().default('tbank'),
  paymentId: text(),
  paymentStatus: text({ enum: orderStatuses }).notNull().default('pending'),
  paymentUrl: text(),
}, t => [index().on(t.userId)])

export type OrderDb = typeof orders.$inferSelect

export const orderItems = pgTable('order_items', {
  id: text().primaryKey().$default(makeId),
  orderId: text().notNull().references(() => orders.id, { onDelete: 'restrict' }),
  modelId: text().references(() => models.id),
  setId: text().references(() => sets.id),
  price: decimal({ mode: 'number' }).notNull(),
  priceBeforeDiscount: decimal({ mode: 'number' }).notNull(),
}, t => [index().on(t.orderId)])

export type OrderItemDb = typeof orderItems.$inferSelect

export const favorites = pgTable('favorites', {
  userId: text().notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelId: text().notNull().references(() => models.id, { onDelete: 'cascade' }),
  addedAt: timestamp().defaultNow(),
})

export type FavoriteDb = typeof favorites.$inferSelect

export const cartItems = pgTable('cart_items', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelId: text().references(() => models.id, { onDelete: 'cascade' }),
  setId: text().references(() => sets.id, { onDelete: 'cascade' }),
  addedAt: timestamp().defaultNow(),
}, t => [index().on(t.userId, t.modelId), index().on(t.userId, t.setId)])

export type CartItemDb = typeof cartItems.$inferSelect

export const refunds = pgTable('refunds', {
  id: text().primaryKey().$default(makeId),
  orderId: text().notNull().references(() => orders.id, { onDelete: 'restrict' }),
  refundedAmount: decimal(),
  reason: text(),
  status: text({ enum: refundStatuses }).default('pending'),
  requestedAt: timestamp().defaultNow(),
  resolvedAt: timestamp(),
}, t => [index().on(t.orderId)])

export type RefundDb = typeof refunds.$inferSelect

export const refundItems = pgTable('refund_items', {
  id: text().primaryKey().$default(makeId),
  refundId: text().notNull().references(() => refunds.id, { onDelete: 'restrict' }),
  orderItemId: text().notNull().references(() => orderItems.id, { onDelete: 'restrict' }),
}, t => [index().on(t.refundId, t.orderItemId)])
