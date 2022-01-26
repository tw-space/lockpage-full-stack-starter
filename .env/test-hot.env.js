//
// test-hot.env.js
// Test environment variables for default server (hot reloading)
//
const envTest = require('./test.env.js')

const envTestHot = {
  ...envTest,
  TRUE_ENV: 'test-hot',
  URL_LOCAL: 'http://localhost:4000',
}

module.exports = envTestHot
