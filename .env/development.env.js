//
// development.env.js
// Development environment variables for custom server
//
const envCommon = require('./common.env.js')
const flagsDevelopment = require('./development.flags.js')
const {
  dbDevPassword,
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyGuest,
  secretKeyMain,
  useHttpsFromS3,
  useHttpsLocal,
} = require('./.secrets.js')

const dbPort = process.env.OVERRIDE_DB_PORT || '6432'
const port = process.env.OVERRIDE_PORT || '3000'

const envDevelopment = {
  ...envCommon,
  ...flagsDevelopment,
  DB_DEV_DATABASE_NAME: 'my_app_db',
  DB_DEV_HOST: 'postgres',
  DB_DEV_PASSWORD: dbDevPassword || '',
  DB_DEV_PORT: dbPort,
  DB_DEV_USER: 'my_app_user',
  JWT_AUD: jwtAud || '',
  JWT_ISS: jwtIss || '',
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: port,
  ROOT_PWD: rootPwd || '.',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TRUE_ENV: 'development',
  USE_HTTPS_FROM_S3: useHttpsFromS3 || '0',
  USE_HTTPS_LOCAL: useHttpsLocal || '0',
}

module.exports = envDevelopment
