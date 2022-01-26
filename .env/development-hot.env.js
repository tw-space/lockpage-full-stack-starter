//
// development-hot.env.js
// Development environment variables for default server (hot reloading)
//
const envDevelopment = require('./development.env.js')

const envDevelopmentHot = {
  ...envDevelopment,
  TRUE_ENV: 'development-hot',
  URL_LOCAL: 'http://localhost:4000',
}

module.exports = envDevelopmentHot
