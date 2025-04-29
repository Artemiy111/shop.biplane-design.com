import { z } from 'zod'
import { count, eq, and, sql } from 'drizzle-orm'
import { modelPrequery, setPrequery } from '~~/server/trpc/query-templates'
import { router, customerProcedure } from '~~/server/trpc'
import { priceAfterDiscount } from '~/src/shared/lib/price'
import { db } from '~~/server/db'
import type { OrderItemDb } from '~~/server/db/schema'
import { favorites, orders, cartItems } from '~~/server/db/schema'

export const customerRouter = router({
  getFavorites: customerProcedure.query(async ({ ctx: { user } }) => {
    const models_ = await db.query.models.findMany({
      where: {
        RAW: t => sql`EXISTS (SELECT 1 FROM ${favorites} WHERE ${favorites.userId} = ${user.id} AND ${favorites.modelId} = ${t.id})`.mapWith(Boolean),
      },
      with: modelPrequery(user.id),
    })
    return models_.map(model => ({
      ...model,
      isFavorite: true,
      isInCart: model.cartItems?.length > 0,
    }))
  }),

  getFavoritesCount: customerProcedure.query(async ({ ctx: { user } }) => {
    return (
      await db.select({ count: count() }).from(favorites).where(eq(favorites.userId, user.id))
    )[0].count
  }),

  getOrders: customerProcedure.query(async ({ ctx: { user } }) => {
    return await db.query.orders.findMany({
      where: {
        userId: user.id,
      },
      with: {
        items: {
          with: {
            model: { with: modelPrequery() },
            set: setPrequery,
          },
        },
      },
    })
  }),

  getCartItems: customerProcedure.query(async ({ ctx: { user } }) => {
    const cartItems = await db.query.cartItems.findMany({
      where: {
        userId: user.id,
      },
      with: {
        model: { with: modelPrequery() },
        set: {
          with: {
            discount: true,
            models: { with: modelPrequery(user.id) },
          },
        },
      },
    })
    return cartItems

    return cartItems.map((item) => {
      if (item.modelId && item.model) return { ...item.model, isFavorite: item.model.favorites?.length > 0, isInCart: true }
      else if (item.setId && item.set) return item.set
      else throw new Error('Должна быть модель или сет')
    })
  }),

  getCartItemsCount: customerProcedure.query(async ({ ctx: { user } }) => {
    return (
      await db.select({ count: count() }).from(cartItems).where(eq(cartItems.userId, user.id))
    )[0].count
  }),

  toggleIsFavorite: customerProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input, ctx: { user } }) => {
      await db.transaction(async (tx) => {
        const isFavorite = (
          await db
            .select({ count: count() })
            .from(favorites)
            .where(and(eq(favorites.userId, user.id), eq(favorites.modelId, input.modelId)))
            .limit(1)
        )[0].count > 0

        if (isFavorite)
          await tx
            .delete(favorites)
            .where(and(eq(favorites.userId, user.id), eq(favorites.modelId, input.modelId)))
        else await tx.insert(favorites).values({ userId: user.id, modelId: input.modelId })
      })
    }),

  toggleIsInCart: customerProcedure
    .input(z.object({ modelId: z.string().nullable(), setId: z.string().nullable() }))
    .mutation(async ({ input, ctx: { user } }) => {
      await db.transaction(async (tx) => {
        if (input.modelId) {
          const isInCart = (
            await db
              .select({ count: count() })
              .from(cartItems)
              .where(and(eq(cartItems.userId, user.id), eq(cartItems.modelId, input.modelId)))
              .limit(1)
          )[0].count > 0

          if (isInCart)
            await tx
              .delete(cartItems)
              .where(and(eq(cartItems.userId, user.id), eq(cartItems.modelId, input.modelId)))
          else await tx.insert(cartItems).values({ userId: user.id, modelId: input.modelId })

          return
        }

        if (!input.setId) throw tx.rollback()

        const isInCart = (
          await db
            .select({ count: count() })
            .from(cartItems)
            .where(and(eq(cartItems.userId, user.id), eq(cartItems.setId, input.setId)))
            .limit(1)
        )[0].count > 0

        if (isInCart)
          await tx
            .delete(cartItems)
            .where(and(eq(cartItems.userId, user.id), eq(cartItems.setId, input.setId)))
        else await tx.insert(cartItems).values({ userId: user.id, setId: input.setId })
      })
    }),

  makeOrderFromCart: customerProcedure
    .input(z.object({ promocodeCode: z.string().nullable() }))
    .mutation(async ({ input: { promocodeCode }, ctx: { user } }) => {
      db.transaction(async (tx) => {
        const cart = await tx.query.cartItems.findMany({
          where: {
            userId: user.id,
          },
          with: {
            model: { with: { discount: true } },
            set: { with: { discount: true } },
          },
        })

        const newOrderItemsTemplete: Omit<OrderItemDb, 'id' | 'orderId'>[] = cart.map((item) => {
          let priceBeforeDiscount: number
          let discountPercentage: number
          let price: number

          if (item.model) {
            priceBeforeDiscount = item.model.price
            discountPercentage = item.model.discount?.discountPercentage || 0
            price = priceAfterDiscount(item.model.price, discountPercentage)
          }
          else if (item.set) {
            priceBeforeDiscount = item.set.price
            discountPercentage = item.set.discount?.discountPercentage || 0
            price = priceAfterDiscount(item.set.price, discountPercentage)
          }
          else throw tx.rollback()

          return {
            modelId: item.modelId,
            setId: item.setId,
            price,
            priceBeforeDiscount,
          }
        })

        const promocode = promocodeCode
          ? (await tx.query.promocodes.findFirst({
              where: {
                code: promocodeCode,
              },
            })) || null
          : null
        const promocodeDiscountPersentage = promocode?.discountPercentage || 0

        const totalPriceBeforeDiscount = newOrderItemsTemplete.reduce(
          (acc, item) => acc + item.priceBeforeDiscount,
          0,
        )
        const totalPriceWithDiscount = newOrderItemsTemplete.reduce(
          (acc, item) => acc + item.price,
          0,
        )
        const totalPrice = priceAfterDiscount(totalPriceWithDiscount, promocodeDiscountPersentage)

        // TODO подключить оплату через банковскую систему

        await tx.insert(orders).values({
          userId: user.id,
          totalPrice,
          totalPriceBeforeDiscount,
          promocodeId: promocode?.id,
          paymentProviter: 'tbank',
          paymentStatus: 'pending',
          paymentUrl: null,
          paymentId: null,
        })

        await tx.delete(cartItems).where(eq(cartItems.userId, user.id))
      })
    }),

  // addToQueue: customerProsedure
  //   .input(z.object({ message: z.string() }))
  //   .mutation(async ({ input, ctx: { user } }) => {
  //     // await rabbit.publish('tasks', { userId: user.id, message: input.message })
  //   }),
})
