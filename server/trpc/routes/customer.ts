import { z } from 'zod'
import { count, eq, and } from 'drizzle-orm'
import { modelPrequery, setPrequery } from '~~/server/trpc/query-templates'
import { router, customerProsedure } from '~~/server/trpc'
import { priceAfterDiscount } from '~/src/shared/lib/price'
import { db } from '~~/server/db'
import type { OrderItemDb } from '~~/server/db/schema'
import { favorites, orders, cartItems, promocodes } from '~~/server/db/schema'

export const customerRouter = router({
  getFavorites: customerProsedure.query(async ({ ctx: { user } }) => {
    return await db.query.favorites.findMany({
      where: eq(favorites.userId, user.id),
      with: {
        model: modelPrequery(),
      },
    })
  }),

  getFavoritesCount: customerProsedure.query(async ({ ctx: { user } }) => {
    return (
      await db.select({ count: count() }).from(favorites).where(eq(favorites.userId, user.id))
    )[0].count
  }),

  getOrders: customerProsedure.query(async ({ ctx: { user } }) => {
    return await db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      with: {
        items: {
          with: {
            model: modelPrequery(),
            set: setPrequery,
          },
        },
      },
    })
  }),

  getCartItems: customerProsedure.query(async ({ ctx: { user } }) => {
    return await db.query.cartItems.findMany({
      where: eq(cartItems.userId, user.id),
      with: {
        model: modelPrequery(),
        set: setPrequery,
      },
    })
  }),

  getCartItemsCount: customerProsedure.query(async ({ ctx: { user } }) => {
    return (
      await db.select({ count: count() }).from(cartItems).where(eq(cartItems.userId, user.id))
    )[0].count
  }),

  toggleIsFavorite: customerProsedure
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

  toggleIsInCart: customerProsedure
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

  makeOrderFromCart: customerProsedure
    .input(z.object({ promocodeCode: z.string().nullable() }))
    .mutation(async ({ input: { promocodeCode }, ctx: { user } }) => {
      db.transaction(async (tx) => {
        const cart = await tx.query.cartItems.findMany({
          where: eq(cartItems.userId, user.id),
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
              where: eq(promocodes.code, promocodeCode),
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
})
