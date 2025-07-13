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
  {
    rules: {
      'vue/attributes-order': ['error', {
        alphabetical: true,
      }],
      /**
       * props в kebab-case
       * @reason Более естественно для html тегов
       * @example data-smth aria-label :my-custom-props
       */
      'vue/attribute-hyphenation': ['error', 'always'],
      /**
       * emits в kebab-case
       */
      'vue/v-on-event-hyphenation': ['error', 'always', {
        autofix: true,
      }],
      'vue/require-explicit-slots': ['error'], /** Для slots всегда defineSlots */
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/slot-name-casing': ['error', 'kebab-case'], /** slots в kebab-case */
      'vue/prop-name-casing': ['error', 'camelCase'], /** props в camelCase в defineProps */
      /**
       * Всегда писать стрелочную функцию в emit
       * @reason Явная передача события
       * @example @update="(e) => update(e)"
       */
      'vue/v-on-handler-style': ['error', 'inline-function'],
      'vue/define-emits-declaration': ['error', 'type-literal'],
      'vue/define-macros-order': ['error', { order: [
        'defineOptions',
        'defineSlots',
        'defineProps',
        'defineModel',
        'defineEmits',
        'defineExpose',
      ] }],
      'vue/define-props-declaration': ['error', 'type-based'], /** props как defineProps */
      'vue/enforce-style-attribute': ['error', { allow: ['plain', 'scoped'] }],
      'vue/html-button-has-type': 'error',
      'vue/html-comment-content-spacing': 'error',
      /**
       * Можно называть компоненты 1 словом
       * @example <Header />
       */
      'vue/multi-word-component-names': 'off',
      'vue/next-tick-style': 'error',
      'vue/no-duplicate-attr-inheritance': 'error',
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/no-template-target-blank': 'error',
      'vue/no-undef-properties': 'error',
      'vue/no-unused-emit-declarations': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-use-v-else-with-v-for': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-html': 'off',
      'vue/no-v-text': 'error',
      'vue/prefer-define-options': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': ['error', 'always'],
      'vue/require-typed-ref': 'error',
      'vue/v-for-delimiter-style': ['error', 'in'],
      'vue/valid-define-options': 'error',
      /**
       * Разрешает emits как emit('word:kebab-case')
       */
      'vue/custom-event-name-casing': ['error', 'kebab-case', {
        ignores: [

          '/^[a-z]+:[a-z0-9-]+$/',
        ],
      }],
    },
  },
)
