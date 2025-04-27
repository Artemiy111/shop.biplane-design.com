export default defineAppConfig({
  ui: {
    colors: {
      primary: 'amber',
    },
    input: {
      variants: {
        size: {
          sm: {
            base: 'text-sm',
          },
          md: {
            base: 'text-base',
          },
          lg: {
            base: 'text-base',
          },
        },
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
      variants: {
        size: {
          giga: {
            base: 'px-4 py-2',
          },
        },
      },
    },
    carousel: {
      variants: {
        active: {
          false: {
            dot: 'bg-(--ui-border)',
          },
          true: {
            dot: 'bg-neutral-400',
          },
        },
      },
    },
    breadcrumb: {
      slots: {
        root: 'mt-4',
      },
      variants: {
        active: {
          false: {
            link: 'text-(--ui-text-muted)',
          },
          true: {
            link: 'text-(--ui-text-dimmed) font-normal',
          },
        },
      },
    },
  },
  icon: {
    mode: 'svg',
  },
})
