//
// production.env.js
//
const envCommon = require('./common.env.js')
const flagsProduction = require('./production.flags.js')
const {
  dbProdDatabaseName,
  dbProdHost,
  dbProdPassword,
  dbProdPort,
  dbProdUser,
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
} = require('./.production.secrets.js') // populated by deploy script

const port = process.env.OVERRIDE_PORT || '443'

const envProduction = {
  ...envCommon,
  ...flagsProduction,
  DB_PROD_DATABASE_NAME: dbProdDatabaseName || '',
  DB_PROD_HOST: dbProdHost || '',
  DB_PROD_PASSWORD: dbProdPassword || '',
  DB_PROD_PORT: dbProdPort,
  DB_PROD_USER: dbProdUser,
  JWT_AUD: jwtAud || '',
  JWT_ISS: jwtIss || '',
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: port,
  ROOT_PWD: rootPwd || '/home/ubuntu/server/lockpage-full-stack-starter',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TRUE_ENV: 'production',
  USE_HTTPS_FROM_S3: useHttpsFromS3 || '0',
}

module.exports = envProduction
