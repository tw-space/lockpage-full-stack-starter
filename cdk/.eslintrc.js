  module.exports = {
  extends: [
    'airbnb',
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  rules: {
    'array-element-newline': [
      'error',
      {
        ArrayExpression: 'consistent',
      },
    ],
    'global-require': ['off'],
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
    'jsx-a11y/href-no-hash': ['off'],
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': ['off'],
    'max-len': [
      'warn',
      {
        code: 88,
        tabWidth: 2,
        comments: 88,
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-trailing-spaces': ['error', {
      skipBlankLines: true,
      ignoreComments: true,
    }],
    'no-restricted-exports': ['off'],
    'no-unused-vars': ['warn'],
    'object-curly-newline': ['error', {
      consistent: true,
    }],
    'padded-blocks': ['off'],
    'react/destructuring-assignment': ['off'],
    'react/prop-types': ['off'],
    'react/react-in-jsx-scope': ['off'],
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
