// 
// common.env.js
// 
const envCommon = {
  JWT_ALG: 'HS256',
  JWT_AUD: 'localhost',
  JWT_EXP_IN: 86400000,  // 1 day
  JWT_ISS: 'localhost',
  JWT_NAME: 'access_token',
  JWT_SUB_GUEST: '',
  JWT_SUB_MAIN: '',
  KEY_NAME: 'theKey',
  LOCKPAGE_DIR: 'lockpage/export',
  LOGIN_PATH: '/enter/',
  NODE_TLS_REJECT_UNAUTHORIZED: '1',
  REGION: 'us-west-2',
  ROOT_PWD: '.',
  SECRET_COOKIE: '',
  SECRET_JWT: '',
  SECRET_KEY_MAIN: '',
  SECRET_KEY_GUEST: '',
  SSM_PATH: '/my-app/prod/',
  USE_HTTPS_LOCAL: '0',
}

module.exports = envCommon
