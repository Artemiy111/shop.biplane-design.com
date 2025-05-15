import { pgTable, text, timestamp, boolean, integer, decimal, index, primaryKey, date, unique } from 'drizzle-orm/pg-core'
import { makeId } from '../../app/src/shared/lib/id'
import { userRoles } from '../../app/src/shared/config/constants/user'
import { mimeTypesImages, mimeTypesRevit, mimeTypesImagesOptimized } from '../../app/src/shared/config/constants/mime-types'
import { paymentProviders, orderStatuses, refundStatuses, revitVersions } from '../../app/src/shared/config/constants'

export const usersT = pgTable('users', {
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

export type UserDb = typeof usersT.$inferSelect

export const sessionsT = pgTable('sessions', {
  id: text().primaryKey().$default(makeId),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => usersT.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
}, t => [index().on(t.userId), index().on(t.token)])

export type SessionDb = typeof sessionsT.$inferSelect

export const accountsT = pgTable('accounts', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => usersT.id, { onDelete: 'cascade' }),
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

export type AccountDb = typeof accountsT.$inferSelect

export const verificationsT = pgTable('verifications', {
  id: text().primaryKey().$default(makeId),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
}, t => [index().on(t.identifier)])

export type VerificationDb = typeof verificationsT.$inferSelect

export const categoriesT = pgTable('categories', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  description: text(),
})

export type CategoryDb = typeof categoriesT.$inferSelect

export const setsT = pgTable('sets', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  price: decimal({ mode: 'number' }).notNull(),
  discountId: text().references(() => discountsT.id),
  imageId: text().references(() => imagesT.id),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
})

export type SetDb = typeof setsT.$inferSelect

export const modelsT = pgTable('models', {
  id: text().primaryKey().$default(makeId),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  categoryId: text().notNull().references(() => categoriesT.id, { onDelete: 'set null' }),
  // fileFormat: text(),
  // fileSize: integer(),
  revitVersion: text({ enum: revitVersions }).notNull(),
  price: decimal({ mode: 'number' }).notNull(),
  discountId: text().references(() => discountsT.id, { onUpdate: 'cascade', onDelete: 'set null' }),
  // show: boolean().notNull().default(true),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow(),
}, t => [index().on(t.categoryId)])

export type ModelDb = typeof modelsT.$inferSelect
export type ModelDbUpdate = ModelDb

export const modelsToSetsT = pgTable('models_to_sets', {
  modelId: text().notNull().references(() => modelsT.id, { onDelete: 'cascade' }),
  setId: text().notNull().references(() => setsT.id, { onDelete: 'cascade' }),
}, t => [primaryKey({ columns: [t.modelId, t.setId] })])

export type ModelsToSetsDb = typeof modelsToSetsT.$inferSelect

export const imagesT = pgTable('images', {
  id: text().primaryKey().$default(makeId),
  mimeType: text({ enum: mimeTypesImages }).notNull(),
  originalFilename: text().notNull(),
  url: text(),
  alt: text(),
  size: integer(),
  width: integer(),
  height: integer(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
})

export type ImageDb = typeof imagesT.$inferSelect
export type ImageDbWithOptimized = ImageDb & { imageToModel: { sortOrder: number }, optimized: ImageOptimizedDb[] }

export const imagesOptimizedT = pgTable('images_optimized', {
  id: text().primaryKey().$default(makeId),
  imageId: text().notNull().references(() => imagesT.id, { onDelete: 'cascade' }),
  mimeType: text({ enum: mimeTypesImagesOptimized }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, t => [index().on(t.imageId)])

export type ImageOptimizedDb = typeof imagesOptimizedT.$inferSelect

export const imageToModelT = pgTable('image_to_model', {
  imageId: text().notNull().primaryKey().references(() => imagesT.id, { onDelete: 'cascade' }),
  modelId: text().notNull().references(() => modelsT.id, { onDelete: 'cascade' }),
  sortOrder: integer().notNull(),
}, t => [
  index().on(t.modelId),
  unique().on(t.imageId, t.modelId),
  unique('image_to_model_model_id_sort_order_unique').on(t.modelId, t.sortOrder),
])

export type ImageToModelDb = typeof imageToModelT.$inferSelect

const mimeTypeFiles = [...mimeTypesRevit, 'application/zip', 'application/octet-stream'] as const

export const filesT = pgTable('files', {
  id: text().primaryKey().$default(makeId),
  originalFilename: text().notNull(),
  modelId: text().notNull().references(() => modelsT.id, { onDelete: 'cascade' }),
  mimeType: text({ enum: mimeTypeFiles }).notNull(),
  size: integer().notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
})

export type FileDb = typeof filesT.$inferSelect

export const discountsT = pgTable('discounts', {
  id: text().primaryKey().$default(makeId),
  label: text(),
  discountPercentage: decimal({ mode: 'number' }).notNull(),
  startDate: date({ mode: 'string' }),
  endDate: date({ mode: 'string' }),
})

export type DiscountDb = typeof discountsT.$inferSelect

export const promocodesT = pgTable('promocodes', {
  id: text().primaryKey().$default(makeId),
  code: text().notNull().unique(),
  discountPercentage: decimal({ mode: 'number' }).notNull(),
  startDate: date({ mode: 'string' }),
  endDate: date({ mode: 'string' }),
  maxUsage: integer(),
  usedCount: integer().default(0),
})

export type PromocodeDb = typeof promocodesT.$inferSelect

export const ordersT = pgTable('orders', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => usersT.id, { onDelete: 'restrict' }),
  totalPrice: decimal({ mode: 'number' }).notNull(),
  totalPriceBeforeDiscount: decimal({ mode: 'number' }).notNull(),

  promocodeId: text().references(() => promocodesT.id),
  createdAt: timestamp().notNull().defaultNow(),

  paymentProvider: text({ enum: paymentProviders }).notNull().default('tbank'),
  paymentId: text(),
  paymentStatus: text({ enum: orderStatuses }).notNull().default('pending'),
  paymentUrl: text(),
}, t => [index().on(t.userId)])

export type OrderDb = typeof ordersT.$inferSelect

export const orderItemsT = pgTable('order_items', {
  id: text().primaryKey().$default(makeId),
  orderId: text().notNull().references(() => ordersT.id, { onDelete: 'restrict' }),
  modelId: text().references(() => modelsT.id),
  setId: text().references(() => setsT.id),
  price: decimal({ mode: 'number' }).notNull(),
  priceBeforeDiscount: decimal({ mode: 'number' }).notNull(),
  discountId: text().references(() => discountsT.id),
}, t => [index().on(t.orderId)])

export type OrderItemDb = typeof orderItemsT.$inferSelect

export const favoritesT = pgTable('favorites', {
  userId: text().notNull().references(() => usersT.id, { onDelete: 'cascade' }),
  modelId: text().notNull().references(() => modelsT.id, { onDelete: 'cascade' }),
  addedAt: timestamp({ mode: 'string' }).defaultNow(),
})

export type FavoriteDb = typeof favoritesT.$inferSelect

export const cartItemsT = pgTable('cart_items', {
  id: text().primaryKey().$default(makeId),
  userId: text().notNull().references(() => usersT.id, { onDelete: 'cascade' }),
  modelId: text().references(() => modelsT.id, { onDelete: 'cascade' }),
  setId: text().references(() => setsT.id, { onDelete: 'cascade' }),
  addedAt: timestamp({ mode: 'string' }).defaultNow(),
}, t => [index().on(t.userId, t.modelId), index().on(t.userId, t.setId)])

export type CartItemDb = typeof cartItemsT.$inferSelect

export const refundsT = pgTable('refunds', {
  id: text().primaryKey().$default(makeId),
  orderId: text().notNull().references(() => ordersT.id, { onDelete: 'restrict' }),
  refundedAmount: decimal(),
  reason: text(),
  status: text({ enum: refundStatuses }).default('pending'),
  requestedAt: timestamp({ mode: 'string' }).defaultNow(),
  resolvedAt: timestamp({ mode: 'string' }),
}, t => [index().on(t.orderId)])

export type RefundDb = typeof refundsT.$inferSelect

export const refundItemsT = pgTable('refund_items', {
  id: text().primaryKey().$default(makeId),
  refundId: text().notNull().references(() => refundsT.id, { onDelete: 'restrict' }),
  orderItemId: text().notNull().references(() => orderItemsT.id, { onDelete: 'restrict' }),
}, t => [index().on(t.refundId, t.orderItemId)])
