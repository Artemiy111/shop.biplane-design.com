import { z } from 'zod'
import { count, eq, and, or } from 'drizzle-orm'
import { modelPrequery, setPrequery } from '~~/server/trpc/query-templates'
import { router, customerProsedure } from '~~/server/trpc'
import { priceAfterDiscount } from '~/src/shared/lib/price'
import { db } from '~~/server/db'
import type { OrderItemDb } from '~~/server/db/schema'
import { favorites, orders, cartItems, promocodes } from '~~/server/db/schema'

export const customerRouter = router({
  getFavoritesCount: customerProsedure.query(async ({ ctx: { user } }) => {
    const v = await db
      .select({ count: count() })
      .from(favorites)
      .where(eq(favorites.userId, user.id))
    return v[0].count
  }),

  getFavorites: customerProsedure.query(async ({ ctx: { user } }) => {
    return db.query.favorites.findMany({
      where: eq(favorites.userId, user.id),
      with: {
        model: modelPrequery,
      },
    })
  }),

  getOrders: customerProsedure.query(async ({ ctx: { user } }) => {
    return db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      with: {
        items: {
          with: {
            model: modelPrequery,
            set: setPrequery,
          },
        },
      },
    })
  }),

  getCartItems: customerProsedure.query(async ({ ctx: { user } }) => {
    return db.query.cartItems.findMany({
      where: eq(cartItems.userId, user.id),
      with: {
        model: modelPrequery,
        set: setPrequery,
      },
    })
  }),

  addToCart: customerProsedure
    .input(z.object({ modelId: z.string().nullable(), setId: z.string().nullable() }))
    .mutation(async ({ input, ctx: { user } }) => {
      await db
        .insert(cartItems)
        .values({ userId: user.id, modelId: input.modelId, setId: input.setId })
    }),

  removeFromCart: customerProsedure
    .input(z.object({ modelId: z.string(), setId: z.string() }))
    .mutation(async ({ input, ctx: { user } }) => {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.userId, user.id),
            or(eq(cartItems.modelId, input.modelId), eq(cartItems.setId, input.setId)),
          ),
        )
    }),

  toggleFavorite: customerProsedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input, ctx: { user } }) => {
      console.log('toggleFavorite server')
      db.transaction(async (tx) => {
        const favorite = await tx.query.favorites.findFirst({
          where: and(eq(favorites.userId, user.id), eq(favorites.modelId, input.modelId)),
        })

        if (favorite) {
          await tx.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.modelId, input.modelId)))
        }
        else {
          await tx.insert(favorites).values({ userId: user.id, modelId: input.modelId })
        }
      })
    }),

  // addToFavorites: customerProsedure
  //   .input(z.object({ modelId: z.string() }))
  //   .mutation(async ({ input, ctx: { user } }) => {
  //     await db.insert(favorites).values({ userId: user.id, modelId: input.modelId })
  //   }),

  // removeFromFavorites: customerProsedure
  //   .input(z.object({ modelId: z.string() }))
  //   .mutation(async ({ input, ctx: { user } }) => {
  //     await db
  //       .delete(favorites)
  //       .where(and(eq(favorites.userId, user.id), eq(favorites.modelId, input.modelId)))
  //   }),

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
