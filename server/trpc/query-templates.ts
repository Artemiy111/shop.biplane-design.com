import { eq, sql } from 'drizzle-orm'
import { models, favorites, cartItems } from '../db/schema'

// export const modelPrequery = {
//   with: {
//     discount: true,
//     files: true,
//     imagesToModel: {
//       with: {
//         image: {
//           with: {
//             optimizedImages: true,
//           },
//         },
//       },
//     },
//   },
// } as const

export const modelPrequery = (userId?: string) => ({
  with: {
    discount: true,
    files: true,

    imagesToModel: {
      with: {
        image: {
          with: {
            optimizedImages: true,
          },
        },
      },
    },
    ...(userId
      ? {
          favorites: {
            where: eq(favorites.userId, userId),
            columns: { userId: true },
            limit: 1,
          },
          cartItems: {
            where: eq(cartItems.userId, userId),
            columns: { userId: true },
            limit: 1,
          },
        }
      : {}),
  },
} as const)

export const setPrequery = {
  with: {
    discount: true,
    image: {
      with: {
        optimizedImages: true,
      },
    },
  },
} as const
