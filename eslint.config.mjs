import art from '@art/vue-eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    plugins: { perfectionist },
    rules: {
      /**
       * Сортировка по FSD
       */

      'import/order': 'off',

      'perfectionist/sort-exports': [
        'error',
        {
          groupKind: 'values-first',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-imports': ['error', {
        type: 'alphabetical',
        groups: [
          'builtin',
          'external',

          'shared',
          'entities',
          'features',
          'widgets',
          'pages',
          'layouts',
          'app',

          'server',

          'internal',

          'parent',
          'sibling',
          'index',
          'object',
          'unknown',
        ],
        customGroups: [
          {
            groupName: 'shared',
            elementNamePattern: '^~/shared/',
          },
          {
            groupName: 'entities',
            elementNamePattern: '^~/entities/',
          },
          {
            groupName: 'features',
            elementNamePattern: '^~/features/',
          },
          {
            groupName: 'widgets',
            elementNamePattern: '^~/widgets/',
          },
          {
            groupName: 'pages',
            elementNamePattern: '^~/pages/',
          },
          {
            groupName: 'layouts',
            elementNamePattern: '^~/layouts/',
          },
          {
            groupName: 'app',
            elementNamePattern: '^~/app/',
          },
          {
            groupName: 'server',
            elementNamePattern: '^~server/',
          },
        ],
        internalPattern: ['^~/.+', '^~~/.+'],
        newlinesBetween: 'always',
      }],
      'perfectionist/sort-named-imports': [
        'error',
        {
          groupKind: 'values-first',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-vue-attributes': 'off',
    },
  },
  ...art
)
