import { relations } from 'drizzle-orm'
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

export type UserDb = typeof users.$inferSelect

export const userReload = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
  favorites: many(favorites),
  cartItems: many(cartItems),
}))

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

export type SessionDb = typeof sessions.$inferSelect

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  impersonatedBy: one(users, { fields: [sessions.impersonatedBy], references: [users.id] }),
}))

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

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export type AccountDb = typeof accounts.$inferSelect

export const verifications = pgTable('verifications', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
}, t => [index().on(t.identifier)])

export type VerificationDb = typeof verifications.$inferSelect

export const categories = pgTable('categories', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  description: text(),
})

export const categoryRelations = relations(categories, ({ many }) => ({
  models: many(models),
}))

export type CategoryDb = typeof categories.$inferSelect

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

export const modelRelations = relations(models, ({ one, many }) => ({
  category: one(categories, { fields: [models.categoryId], references: [categories.id] }),
  imagesToModel: many(imageToModel),
  files: many(files),
  sets: many(modelsToSets),
}))

export type ModelDb = typeof models.$inferSelect

export const images = pgTable('images', {
  id: text().primaryKey(),
  // modelId: integer().notNull().references(() => models.id),
  mimeType: text({ enum: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export const imageRelations = relations(images, ({ one, many }) => ({
  optimizedImages: many(imagesOptimized),
  imageToModel: one(imageToModel),
}))

export type ImageDb = typeof images.$inferSelect

export const imagesOptimized = pgTable('images_optimized', {
  id: text().primaryKey(),
  imageId: text().notNull().references(() => images.id),
  mimeType: text({ enum: ['image/webp', 'image/avif'] }).notNull(),
  size: integer().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export type ImageOptimizedDb = typeof imagesOptimized.$inferSelect

export const imageToModel = pgTable('image_to_model', {
  imageId: text().notNull().primaryKey().references(() => images.id),
  modelId: text().notNull().references(() => models.id),
})

export const imageToModelRelations = relations(imageToModel, ({ one }) => ({
  image: one(images, { fields: [imageToModel.imageId], references: [images.id] }),
  model: one(models, { fields: [imageToModel.modelId], references: [models.id] }),
}))

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

export const files = pgTable('files', {
  id: text().primaryKey(),
  modelId: text().notNull().references(() => models.id),
  mimeType: text({ enum: mimeTypeFiles }).notNull(),
  size: integer().notNull(),
  createdAt: timestamp().defaultNow(),
})

export const fileRelations = relations(files, ({ one }) => ({
  model: one(models, { fields: [files.modelId], references: [models.id] }),
}))

export type FileDb = typeof files.$inferSelect
// export const modelImages

export const sets = pgTable('sets', {
  id: text().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  price: decimal(),
  discountId: text().references(() => discounts.id),
  imageId: text().references(() => images.id),
  createdAt: timestamp().defaultNow(),
})

export type SetDb = typeof sets.$inferSelect

export const modelsToSets = pgTable('models_to_sets', {
  modelId: text().notNull().references(() => models.id),
  setId: text().notNull().references(() => sets.id),
}, t => [primaryKey({ columns: [t.modelId, t.setId] })])

export const modelsToSetsRelations = relations(modelsToSets, ({ one }) => ({
  model: one(models, { fields: [modelsToSets.modelId], references: [models.id] }),
  set: one(sets, { fields: [modelsToSets.setId], references: [sets.id] }),
}))

export const discounts = pgTable('discounts', {
  id: text().primaryKey(),
  label: text(),
  discountPercentage: decimal(),
  startDate: timestamp(),
  endDate: timestamp(),
})

export const discountRelations = relations(discounts, ({ many }) => ({
  orders: many(orders),
}))

export type DiscountDb = typeof discounts.$inferSelect

export const promocodes = pgTable('promocodes', {
  id: text().primaryKey(),
  code: text().notNull().unique(),
  discountPercentage: decimal(),
  startDate: timestamp(),
  endDate: timestamp(),
  maxUsage: integer(),
  usedCount: integer().default(0),
})

export const promocodeRelations = relations(promocodes, ({ many }) => ({
  orders: many(orders),
}))

export type PromocodeDb = typeof promocodes.$inferSelect

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

export const orderRelations = relations(orders, ({ one, many }) => ({
  items: many(orderItems),
  discount: one(discounts, { fields: [orders.discountId], references: [discounts.id] }),
  promocode: one(promocodes, { fields: [orders.promocodeId], references: [promocodes.id] }),
}))

export type OrderDb = typeof orders.$inferSelect

export const orderItems = pgTable('order_items', {
  id: text().primaryKey(),
  orderId: text().notNull().references(() => orders.id),
  modelId: text().references(() => models.id),
  setId: text().references(() => sets.id),
  price: decimal(),
  priseBeforeDiscount: decimal(),
}, t => [index().on(t.orderId)])

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  model: one(models, { fields: [orderItems.modelId], references: [models.id] }),
  set: one(sets, { fields: [orderItems.setId], references: [sets.id] }),
}))

export type OrderItemDb = typeof orderItems.$inferSelect

export const favorites = pgTable('favorites', {
  userId: text().notNull().references(() => users.id),
  modelId: text().notNull().references(() => models.id),
  addedAt: timestamp().defaultNow(),
})

export const favoriteRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  model: one(models, { fields: [favorites.modelId], references: [models.id] }),
}))

export type FavoriteDb = typeof favorites.$inferSelect

export const cartItems = pgTable('cart_items', {
  id: text().primaryKey(),
  userId: text().notNull().references(() => users.id),
  modelId: text().references(() => models.id),
  setId: text().references(() => sets.id),
  addedAt: timestamp().defaultNow(),
})

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  model: one(models, { fields: [cartItems.modelId], references: [models.id] }),
  set: one(sets, { fields: [cartItems.setId], references: [sets.id] }),
}))

export type CartItemDb = typeof cartItems.$inferSelect

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

export const refundRelations = relations(refunds, ({ one }) => ({
  orderItem: one(orderItems, { fields: [refunds.orderItemId], references: [orderItems.id] }),
}))

export type RefundDb = typeof refunds.$inferSelect
