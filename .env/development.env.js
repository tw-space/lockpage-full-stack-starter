//
// development.env.js
// Development environment variables for custom server
//
const envCommon = require('./common.env.js')
const {
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyMain,
  secretKeyGuest,
  useHttpsLocal,
} = require('./.secrets.js')

const envDevelopment = {
  ...envCommon,
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: '3000',
  ROOT_PWD: rootPwd || '.',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TRUE_ENV: 'development',
  USE_HTTPS_LOCAL: useHttpsLocal || '0',
}

module.exports = envDevelopment
