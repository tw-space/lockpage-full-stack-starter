//
// test.env.js
// Test environment variables for custom server
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

const nextDevPort = '4000'
const port = '3000'

const envTest = {
  ...envCommon,
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  NODE_TLS_REJECT_UNAUTHORIZED: '0',
  PORT: port,
  ROOT_PWD: rootPwd || '.',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TESTING_ENV: '1',
  TRUE_ENV: 'test',
  URL_DEV: `http://localhost:${nextDevPort}`,
  URL_LOCAL: useHttpsLocal === '0' ? `http://localhost:${port}` : `https://localhost:${port}`,
  USE_HTTPS_LOCAL: useHttpsLocal || '0',
}

module.exports = envTest
