import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  users: {
    accounts: r.many.accounts(),
    sessions: r.many.sessions(),
    favorites: r.many.favorites(),
    cartItems: r.many.cartItems(),
    orders: r.many.orders(),
    // promocodes: r.many.promocodes(),
    // models: r.many.models(),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  categories: {
    models: r.many.models(),
    // discounts: r.many.discounts({
    //   from: r.categories.id.through(r.models.categoryId),
    //   to: r.discounts.id.through(r.models.discountId),
    // }),
  },
  sets: {
    cartItems: r.many.cartItems(),
    orderItems: r.many.orderItems(),
    models: r.many.models(),
    discount: r.one.discounts({
      from: r.sets.discountId,
      to: r.discounts.id,
      optional: true,
    }),
  },
  models: {
    category: r.one.categories({
      from: r.models.categoryId,
      to: r.categories.id,
      optional: false,
    }),
    images: r.many.images({
      from: r.models.id.through(r.imageToModel.modelId),
      to: r.images.id.through(r.imageToModel.imageId),
    }),
    files: r.many.files(),
    sets: r.many.sets({
      from: r.models.id.through(r.modelsToSets.modelId),
      to: r.sets.id.through(r.modelsToSets.setId),
    }),
    discount: r.one.discounts({
      from: r.models.discountId,
      to: r.discounts.id,
      optional: true,
    }),
    favorites: r.many.favorites(),
    cartItems: r.many.cartItems(),
    // imagesToModel: r.many.imageToModel(),
    // users: r.many.users({
    //   from: r.models.id.through(r.favorites.modelId),
    //   to: r.users.id.through(r.favorites.userId),
    // }),
    // orderItems: r.many.orderItems(),
  },
  images: {
    optimized: r.many.imagesOptimized(),
    model: r.one.models({
      from: r.images.id.through(r.imageToModel.imageId),
      to: r.models.id.through(r.imageToModel.modelId),
      optional: false,
    }),
  },
  imagesOptimized: {
    original: r.one.images({
      from: r.imagesOptimized.imageId,
      to: r.images.id,
      optional: false,
    }),
  },
  files: {
    model: r.one.models({
      from: r.files.modelId,
      to: r.models.id,
      optional: false,
    }),
  },
  discounts: {
    // sets: r.many.sets(),
    // models: r.many.models(),
    images: r.many.images({
      from: r.discounts.id.through(r.sets.discountId),
      to: r.images.id.through(r.sets.imageId),
    }),
  },
  promocodes: {
    users: r.many.users({
      from: r.promocodes.id.through(r.orders.promocodeId),
      to: r.users.id.through(r.orders.userId),
    }),
  },
  favorites: {
    user: r.one.users({
      from: r.favorites.userId,
      to: r.users.id,
      optional: false,
    }),
    model: r.one.models({
      from: r.favorites.modelId,
      to: r.models.id,
      optional: false,
    }),
  },
  cartItems: {
    model: r.one.models({
      from: r.cartItems.modelId,
      to: r.models.id,
      optional: true,
    }),
    set: r.one.sets({
      from: r.cartItems.setId,
      to: r.sets.id,
      optional: true,
    }),
    user: r.one.users({
      from: r.cartItems.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users.id,
      optional: false,
    }),
    items: r.many.orderItems(),
    promocode: r.one.promocodes({
      from: r.orders.promocodeId,
      to: r.promocodes.id,
      optional: true,
    }),
  },
  orderItems: {
    order: r.one.orders({
      from: r.orderItems.orderId,
      to: r.orders.id,
      optional: false,
    }),
    model: r.one.models({
      from: r.orderItems.modelId,
      to: r.models.id,
      optional: true,
    }),
    set: r.one.sets({
      from: r.orderItems.setId,
      to: r.sets.id,
      optional: true,
    }),
  },
  refunds: {
    order: r.one.orders({
      from: r.refunds.orderId,
      to: r.orders.id,
      optional: false,
    }),
  },
}))
