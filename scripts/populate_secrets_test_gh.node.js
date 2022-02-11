/* eslint no-console: 'off' */
//
// populate_secrets_test_gh.node.js
//
// Populates .env/.production.secrets.js and .env/.secrets.js with test values 
// for GitHub Actions.
//
const fs = require('fs')

const endent = require('endent')

const secrets = {
  jwtAud: 'GitHub workflow',
  jwtIss: 'GitHub workflow',
  jwtSubGuest: 'jwtSubGuest test secret',
  jwtSubMain: 'jwtSubMain test secret',
  rootPwd: '/home/runner/work/lockpage-full-stack-starter-private/lockpage-full-stack-starter-private',
  secretCookie: 'secretCookie test secret',
  secretJWT: 'secretJWT test secret',
  secretKeyGuest: 'secretKeyGuest test secret',
  secretKeyMain: 'secretKeyMain test secret',
  useHttpsLocal: '0',
}

const secretsString = endent(`
//
// secrets
//
const jwtAud = '${secrets.jwtAud}'
const jwtIss = '${secrets.jwtIss}'
const jwtSubGuest = '${secrets.jwtSubGuest}'
const jwtSubMain = '${secrets.jwtSubMain}'
const rootPwd = '${secrets.rootPwd}'
const secretCookie = '${secrets.secretCookie}'
const secretJWT = '${secrets.secretJWT}'
const secretKeyGuest = '${secrets.secretKeyGuest}'
const secretKeyMain = '${secrets.secretKeyMain}'
const useHttpsLocal = '${secrets.useHttpsLocal}'

module.exports = {
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyGuest,
  secretKeyMain,
  useHttpsLocal,
}
`)

fs.writeFile('.env/.production.secrets.js', secretsString, { flag: 'wx' }, (err) => {
  try {
    if (err) throw err
  } catch (error) {
    console.error('error in populating .production.secrets.js: ', error)
  }
})

fs.writeFile('.env/.secrets.js', secretsString, { flag: 'wx' }, (err) => {
  try {
    if (err) throw err
  } catch (error) {
    console.error('error in populating .secrets.js: ', error)
  }
})
