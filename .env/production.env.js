//
// production.env.js
//
const envCommon = require('./common.env.js')
const {
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyMain,
  secretKeyGuest,
} = require('./.production.secrets.js')

const envProduction = {
  ...envCommon,
  JWT_AUD: jwtAud || '',
  JWT_ISS: jwtIss || '',
  JWT_SUB_GUEST: jwtSubGuest || '',
  JWT_SUB_MAIN: jwtSubMain || '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: '80',
  ROOT_PWD: rootPwd || '/home/ubuntu/server/lockpage-full-stack-starter',
  SECRET_COOKIE: secretCookie || '',
  SECRET_JWT: secretJWT || '',
  SECRET_KEY_GUEST: secretKeyGuest || '',
  SECRET_KEY_MAIN: secretKeyMain || '',
  TRUE_ENV: 'production',
}

module.exports = envProduction
