import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  usersT: {
    accounts: r.many.accountsT(),
    sessions: r.many.sessionsT(),
    favorites: r.many.favoritesT(),
    cartItems: r.many.cartItemsT(),
    orders: r.many.ordersT(),
    // promocodes: r.many.promocodes(),
    // models: r.many.models(),
  },
  sessionsT: {
    user: r.one.usersT({
      from: r.sessionsT.userId,
      to: r.usersT.id,
      optional: false,
    }),
  },
  accountsT: {
    user: r.one.usersT({
      from: r.accountsT.userId,
      to: r.usersT.id,
      optional: false,
    }),
  },
  categoriesT: {
    models: r.many.modelsT(),
    // discounts: r.many.discounts({
    //   from: r.categories.id.through(r.models.categoryId),
    //   to: r.discounts.id.through(r.models.discountId),
    // }),
  },
  setsT: {
    cartItems: r.many.cartItemsT(),
    orderItems: r.many.orderItemsT(),
    models: r.many.modelsT(),
    discount: r.one.discountsT({
      from: r.setsT.discountId,
      to: r.discountsT.id,
      optional: true,
    }),
  },
  modelsT: {
    category: r.one.categoriesT({
      from: r.modelsT.categoryId,
      to: r.categoriesT.id,
      optional: false,
    }),
    images: r.many.imagesT({
      from: r.modelsT.id.through(r.imageToModelT.modelId),
      to: r.imagesT.id.through(r.imageToModelT.imageId),
    }),
    files: r.many.filesT(),
    sets: r.many.setsT({
      from: r.modelsT.id.through(r.modelsToSetsT.modelId),
      to: r.setsT.id.through(r.modelsToSetsT.setId),
    }),
    discount: r.one.discountsT({
      from: r.modelsT.discountId,
      to: r.discountsT.id,
      optional: true,
    }),
    favorites: r.many.favoritesT(),
    cartItems: r.many.cartItemsT(),
    // imagesToModel: r.many.imageToModel(),
    // users: r.many.users({
    //   from: r.models.id.through(r.favorites.modelId),
    //   to: r.users.id.through(r.favorites.userId),
    // }),
    // orderItems: r.many.orderItems(),
  },
  imagesT: {
    imageToModel: r.one.imageToModelT({
      from: r.imagesT.id,
      to: r.imageToModelT.imageId,
      optional: false,
    }),
    optimized: r.many.imagesOptimizedT(),
    model: r.one.modelsT({
      from: r.imagesT.id.through(r.imageToModelT.imageId),
      to: r.modelsT.id.through(r.imageToModelT.modelId),
      optional: false,
    }),
  },
  imagesOptimizedT: {
    original: r.one.imagesT({
      from: r.imagesOptimizedT.imageId,
      to: r.imagesT.id,
      optional: false,
    }),
  },
  filesT: {
    model: r.one.modelsT({
      from: r.filesT.modelId,
      to: r.modelsT.id,
      optional: false,
    }),
  },
  discountsT: {
    // sets: r.many.sets(),
    // models: r.many.models(),
    images: r.many.imagesT({
      from: r.discountsT.id.through(r.setsT.discountId),
      to: r.imagesT.id.through(r.setsT.imageId),
    }),
  },
  promocodesT: {
    users: r.many.usersT({
      from: r.promocodesT.id.through(r.ordersT.promocodeId),
      to: r.usersT.id.through(r.ordersT.userId),
    }),
  },
  favoritesT: {
    user: r.one.usersT({
      from: r.favoritesT.userId,
      to: r.usersT.id,
      optional: false,
    }),
    model: r.one.modelsT({
      from: r.favoritesT.modelId,
      to: r.modelsT.id,
      optional: false,
    }),
  },
  cartItemsT: {
    model: r.one.modelsT({
      from: r.cartItemsT.modelId,
      to: r.modelsT.id,
      optional: true,
    }),
    set: r.one.setsT({
      from: r.cartItemsT.setId,
      to: r.setsT.id,
      optional: true,
    }),
    user: r.one.usersT({
      from: r.cartItemsT.userId,
      to: r.usersT.id,
      optional: false,
    }),
  },
  ordersT: {
    user: r.one.usersT({
      from: r.ordersT.userId,
      to: r.usersT.id,
      optional: false,
    }),
    items: r.many.orderItemsT(),
    promocode: r.one.promocodesT({
      from: r.ordersT.promocodeId,
      to: r.promocodesT.id,
      optional: true,
    }),
  },
  orderItemsT: {
    order: r.one.ordersT({
      from: r.orderItemsT.orderId,
      to: r.ordersT.id,
      optional: false,
    }),
    model: r.one.modelsT({
      from: r.orderItemsT.modelId,
      to: r.modelsT.id,
      optional: true,
    }),
    set: r.one.setsT({
      from: r.orderItemsT.setId,
      to: r.setsT.id,
      optional: true,
    }),
  },
  refundsT: {
    order: r.one.ordersT({
      from: r.refundsT.orderId,
      to: r.ordersT.id,
      optional: false,
    }),
  },
}))
