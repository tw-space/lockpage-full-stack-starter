const babelOptions = {
  plugins: [
    ['@babel/plugin-transform-runtime'],
    [
      'babel-plugin-styled-components',
      {
        ssr: false,
        displayName: true,
        fileName: true,
        minify: false,
        meaninglessFileNames: ['index', 'styles'],
        // namespace: 'my-app-name',
        pure: false,
        preprocess: true,
        transpileTemplateLiterals: false,
      },
    ],
  ],
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    'next/babel',
  ],
}

module.exports = require('babel-jest').default.createTransformer(babelOptions)
