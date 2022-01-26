//
// production.env.js
//
const envCommon = require('./common.env.js')
const {
  jwtSubGuest,
  jwtSubMain,
  secretCookie,
  secretJWT,
  secretKeyMain,
  secretKeyGuest,
} = require('./.production.secrets.js')

const envProduction = {
  ...envCommon,
  JWT_AUD: 'thinkinside.net',
  JWT_ISS: 'thinkinside.net',
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: '80',
  ROOT_PWD: '/home/ubuntu/server/lockpage-full-stack-starter',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TESTING_ENV: '0',
  TRUE_ENV: 'production',
}

module.exports = envProduction
