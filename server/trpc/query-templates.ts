export const modelPrequery = (userId?: string) => ({
  discount: true,
  files: true,
  images: {
    with: {
      optimized: true,
    },
  },
  ...(userId
    ? { favorites: {
        where: {
          userId: userId,
        },
        columns: {
          userId: true,
        },
        limit: 1,
      },
      cartItems: {
        where: {
          userId: userId,
        },
        columns: {
          userId: true,
        },
        limit: 1,
      },
      }
    : {}),
} as const)

export const setPrequery = {
  with: {
    discount: true,
    image: {
      with: {
        optimized: true,
      },
    },
  },
} as const
