  module.exports = {
  extends: [
    'airbnb-base',
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {
    'array-element-newline': [
      'error',
      {
        ArrayExpression: 'consistent',
      },
    ],
    'global-require': ['off'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/jest*.js'] },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': ['off'],
    'max-len': [
      'warn',
      {
        code: 120,
        tabWidth: 2,
        comments: 120,
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-console': ['off'],
    'no-new': ['off'],
    'no-restricted-exports': ['off'],
    'no-trailing-spaces': ['error', {
      skipBlankLines: true,
      ignoreComments: true,
    }],
    'no-unused-vars': ['warn'],
    'object-curly-newline': ['error', {
      consistent: true,
    }],
    'padded-blocks': ['off'],
    semi: ['error', 'never'],
    'sort-imports': ['off'],
    'spaced-comment': ['off'],
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  },
  overrides: [
    {
      files: ['*.test.js', '*.spec.js'],
      rules: {
        'global-require': 'off',
      },
    },
  ],
}
