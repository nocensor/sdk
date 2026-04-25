import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage', '.turbo', '**/*.d.ts', 'src/generated/**'],
  },
  {
    files: ['src/**/*.ts', '__tests__/**/*.ts', 'scripts/**/*.mjs'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message:
                "No 'node:*' imports in src/** — SDK core must stay universal-runtime. Put node-specific helpers in src/node.ts (exempted).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/node.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Tests run in Node.js (vitest) — node:* imports are allowed in test helpers.
    // Note: src/** universal-runtime constraint does NOT apply to __tests__/.
    files: ['__tests__/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
