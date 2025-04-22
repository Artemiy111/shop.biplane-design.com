export const modelPrequery = {
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
  },
} as const

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
