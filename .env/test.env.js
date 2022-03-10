//
// test.env.js
// Test environment variables for custom server
//
const envCommon = require('./common.env.js')
const flagsTest = require('./test.flags.js')
const {
  dbDevPassword,
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyMain,
  secretKeyGuest,
  useHttpsFromS3,
  useHttpsLocal,
} = require('./.secrets.js')

const dbPort = process.env.OVERRIDE_DB_PORT || '6432'
const nextDevPort = '4000'
const port = process.env.OVERRIDE_PORT || '3000'

const envTest = {
  ...envCommon,
  ...flagsTest,
  DB_DEV_DATABASE_NAME: 'my_app_db',
  DB_DEV_HOST: 'host.docker.internal',
  DB_DEV_PASSWORD: dbDevPassword || '',
  DB_DEV_PORT: dbPort,
  DB_DEV_USER: 'my_app_user',
  JWT_AUD: jwtAud || '',
  JWT_ISS: jwtIss || '',
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
  TRUE_ENV: 'test',
  URL_DEV: `http://localhost:${nextDevPort}`,
  URL_LOCAL: useHttpsLocal === '1' ? `https://localhost:${port}` : `http://localhost:${port}`,
  USE_HTTPS_FROM_S3: useHttpsFromS3 || '0',
  USE_HTTPS_LOCAL: useHttpsLocal || '0',
}

module.exports = envTest
