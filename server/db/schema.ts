import { pgTable, text, timestamp, boolean, integer, decimal, index, primaryKey } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  isAnonymous: boolean(),
  role: text(),
  banned: boolean(),
  banReason: text(),
  banExpires: timestamp(),
})

export const sessions = pgTable('sessions', {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
}, t => [index().on(t.userId), index().on(t.token)])

export const accounts = pgTable('accounts', {
  id: text().primaryKey(),
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

export const verifications = pgTable('verifications', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
}, t => [index().on(t.identifier)])

export const categories = pgTable('categories', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  description: text(),
})

export const models = pgTable('models', {
  id: text().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  categoryId: text().notNull().references(() => categories.id),
  // fileFormat: text(),
  // fileSize: integer(),
  // revitVersion: text(),
  price: decimal(),
  discountId: text().references(() => discounts.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
}, t => [index().on(t.categoryId)])

export const images = pgTable('images', {
  id: text().primaryKey(),
  // modelId: integer().notNull().references(() => models.id),
  mimeType: text({ enum: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export const imagesOptimized = pgTable('images_optimized', {
  id: text().primaryKey(),
  imageId: text().notNull().references(() => images.id),
  mimeType: text({ enum: ['image/webp', 'image/avif'] }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export const modelImages = pgTable('model_images', {
  modelId: text().notNull().references(() => models.id),
  imageId: text().notNull().references(() => images.id),
}, t => [primaryKey({ columns: [t.modelId, t.imageId] })])

const mimeRevitFileTypes = [
  'application/revit',
  'application/revit-family',
  'application/revit-template',
  'application/revit-family-template',
  'application/revit-group',
  'application/x-autodesk-revit',
  'application/x-autodesk-revit-family',
  'model/gltf-binary',
  'model/gltf+json',
  'application/x-3ds',
  'model/stl',
  // 'application/vnd.autodesk.revit.model',
  // 'application/vnd.autodesk.revit.project',
] as const

const mimeTypeFiles = [...mimeRevitFileTypes, 'application/zip', 'application/octet-stream'] as const

export const modelFiles = pgTable('files', {
  id: text().primaryKey(),
  modelId: text().notNull().references(() => models.id),
  mimeType: text({ enum: mimeTypeFiles }).notNull(),
  size: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})
// export const modelImages

export const sets = pgTable('sets', {
  id: text().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  price: decimal(),
  discountId: text().references(() => discounts.id),
  // imageUrl: text(),
  createdAt: timestamp().defaultNow(),
})

export const modelSets = pgTable('model_sets', {
  modelId: text().notNull().references(() => models.id),
  setId: text().notNull().references(() => sets.id),
})

export const discounts = pgTable('discounts', {
  id: text().primaryKey(),
  discountPercentage: decimal(),
  startDate: timestamp(),
  endDate: timestamp(),
  code: text(),
})

export const promocodes = pgTable('promocodes', {
  id: text().primaryKey(),
  code: text().notNull().unique(),
  discountPercentage: decimal(),
  startDate: timestamp(),
  endDate: timestamp(),
  maxUsage: integer(),
  usedCount: integer().default(0),
})

export const orderStatuses = ['pending', 'confirmed', 'failed'] as const

export const orders = pgTable('orders', {
  id: text().primaryKey(),
  userId: text().notNull().references(() => users.id),
  totalPrice: decimal(),
  totalPriceBeforeDiscount: decimal(),

  discountId: text().references(() => discounts.id),
  promocodeId: text().references(() => promocodes.id),
  createdAt: timestamp().defaultNow(),

  paymentProviter: text({ enum: ['tbank'] }),
  paymentId: text(),
  paymentStatus: text({ enum: orderStatuses }).default('pending'),
  paymentUrl: text(),
}, t => [index().on(t.userId)])

export const orderItems = pgTable('order_items', {
  id: text().primaryKey(),
  orderId: text().notNull().references(() => orders.id),
  modelId: text().references(() => models.id),
  setId: text().references(() => sets.id),
  price: decimal(),
  priseBeforeDiscount: decimal(),
}, t => [index().on(t.orderId)])

export const favorites = pgTable('favorites', {
  userId: text().notNull().references(() => users.id),
  modelId: text().notNull().references(() => models.id),
  addedAt: timestamp().defaultNow(),
})

export const cartItems = pgTable('cart_items', {
  id: text().primaryKey(),
  userId: text().notNull().references(() => users.id),
  modelId: text().references(() => models.id),
  setId: text().references(() => sets.id),
  addedAt: timestamp().defaultNow(),
})

export const refundStatuses = ['pending', 'confirmed', 'failed'] as const

export const refunds = pgTable('refunds', {
  id: text().primaryKey(),
  orderItemId: text().notNull().references(() => orderItems.id),
  refundedAmount: decimal(),
  reason: text(),
  status: text({ enum: refundStatuses }).default('pending'),
  requestedAt: timestamp().defaultNow(),
  resolvedAt: timestamp(),
})
