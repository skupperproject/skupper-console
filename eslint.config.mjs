import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReactRecommended from 'eslint-plugin-react/configs/recommended.js';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  pluginImport.flatConfigs.recommended,
  ...tseslint.configs.recommended,
  pluginReactRecommended,
  eslintConfigPrettier,
  pluginPrettierRecommended,

  {
    ignores: ['**/build', '**/css']
  },

  {
    plugins: {
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': typescriptEslint
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest
      }
    },

    settings: {
      'import/extensions': ['.ts', '.tsx'],

      react: {
        version: 'detect'
      }
    },

    rules: {
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ignoreTypeValueShadow: true
        }
      ],

      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['enum', 'enumMember'],
          format: ['PascalCase']
        }
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 0,
      'consistent-this': [1, 'that'],
      curly: [2, 'all'],
      'default-case': [2],
      'dot-notation': [2],
      'eol-last': 2,
      eqeqeq: [2, 'allow-null'],
      'guard-for-in': 2,
      'import/newline-after-import': [
        'error',
        {
          count: 1
        }
      ],
      'import/no-cycle': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': ['error'],
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',

          alphabetize: {
            caseInsensitive: true,
            order: 'asc'
          },

          groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
          pathGroupsExcludedImportTypes: ['react'],

          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            }
          ]
        }
      ],
      'import/prefer-default-export': 'off',
      'max-nested-callbacks': [1, 4],
      'newline-before-return': 'error',
      'no-alert': 2,
      'no-caller': 2,
      'no-console': 1,
      'no-constant-condition': 2,
      'no-debugger': 2,
      'no-else-return': ['error'],
      'no-global-strict': 0,
      'no-irregular-whitespace': ['error'],
      'no-multiple-empty-lines': [
        2,
        {
          max: 2,
          maxEOF: 0
        }
      ],
      'no-param-reassign': [
        'warn',
        {
          props: true,
          ignorePropertyModificationsFor: ['acc', 'node']
        }
      ],

      'no-shadow': 'off',
      'no-underscore-dangle': 0,
      'no-var': 2,
      'no-unused-vars': 'off',
      'object-shorthand': ['error', 'properties'],

      'prefer-const': [
        'error',
        {
          destructuring: 'all'
        }
      ],

      'prefer-template': 2,
      radix: 2,
      'padding-line-between-statements': 'off',
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.ts', '.tsx']
        }
      ],

      'react/jsx-fragments': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-duplicate-props': 2,
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-expression',
          unnamedComponents: 'function-expression'
        }
      ],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-string-refs': 1,
      'react/no-unknown-property': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/no-unescaped-entities': 0,
      'react/prop-types': 0,

      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: false
        }
      ],

      'react/display-name': 0,
      'require-atomic-updates': 0,
      semi: [1, 'always']
    }
  }
];
