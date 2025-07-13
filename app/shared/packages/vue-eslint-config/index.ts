import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'art/vue/setup',
    plugins: { vue: pluginVue },
  },
  {
    name: 'art/vue/rules',
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
      /** emits в kebab-case */
      'vue/v-on-event-hyphenation': ['error', 'always', {
        autofix: true,
      }],
      /** Для slots всегда defineSlots */
      'vue/require-explicit-slots': ['error'],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      /** slots в kebab-case */
      'vue/slot-name-casing': ['error', 'kebab-case'],
      /** props в camelCase в defineProps */
      'vue/prop-name-casing': ['error', 'camelCase'],
      /**
       * Всегда писать стрелочную функцию в emit
       * @reason Явная передача события
       * @example @update="(e) => update(e)"
       */
      'vue/v-on-handler-style': ['error', 'inline-function'],
      'vue/define-emits-declaration': ['error', 'type-literal'],
      'vue/define-macros-order': ['error', { order: [
        'defineOptions',
        'defineProps',
        'defineModel',
        'defineEmits',
        'defineSlots',
        'defineExpose',
      ] }],
      /** props как defineProps */
      'vue/define-props-declaration': ['error', 'type-based'],
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
      /**
       * @example <Component enabled />
       */
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
] satisfies Linter.Config[]
