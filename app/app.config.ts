export default defineAppConfig({
  ui: {
    colors: {
      primary: 'amber',
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
            dot: 'bg-black/5',
          },
          true: {
            dot: 'bg-black/50',
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
