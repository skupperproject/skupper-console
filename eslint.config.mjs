import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

const gitignorePath = path.resolve(__dirname, '.gitignore');

export default [
  includeIgnoreFile(gitignorePath),
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'prettier'
    )
  ),
  {
    ignores: ['**/*.config.js', 'eslint.config.mjs']
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx']
  },
  {
    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': typescriptEslint
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        JSX: true
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        comment: true,

        ecmaFeatures: {
          jsx: true
        },

        extraFileExtensions: ['.json'],
        project: ['tsconfig.json', 'cypress.config.ts'],
        tsconfigRootDir: './'
      }
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },

      'import/resolver': {
        typescript: {},

        node: {
          extensions: ['.ts', '.tsx']
        }
      },

      'import/extensions': ['.ts', '.tsx'],

      react: {
        version: 'detect'
      }
    },

    rules: {
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
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ignoreTypeValueShadow: true
        }
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 0,

      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 0,
      'consistent-this': [1, 'that'],
      curly: [2, 'all'],
      'default-case': 2,
      'dot-notation': 2,
      'eol-last': 2,
      eqeqeq: [2, 'allow-null'],
      'guard-for-in': 2,
      'import/no-cycle': 'off',
      'import/no-duplicates': ['error'],
      'import/no-unresolved': ['error'],
      'import/newline-after-import': [
        'error',
        {
          count: 1
        }
      ],
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
      'no-constant-condition': 2,
      'no-console': 1,
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
      'no-unused-vars': 'off',
      'no-var': 2,
      'object-shorthand': ['error', 'properties'],
      'padding-line-between-statements': 'off',
      'prefer-const': [
        'error',
        {
          destructuring: 'all'
        }
      ],
      'prefer-template': 2,
      radix: 2,

      'react/display-name': 0,
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-expression',
          unnamedComponents: 'function-expression'
        }
      ],
      'react/jsx-fragments': 'error',
      'react/jsx-no-duplicate-props': 2,
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unescaped-entities': 0,
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: false
        }
      ],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'require-atomic-updates': 0
    }
  }
];
