/* eslint no-console: 'off' */
//
// populate_secrets.js
//
const fs = require('fs')
const path = require('path')

const aws = require('aws-sdk')
const endent = require('endent')

const region = process.env.REGION
const ssmPath = process.env.SSM_PATH

// |1| Get parameters from SSM in production

const ssm = new aws.SSM({ region })
ssm.getParametersByPath({
  Path: ssmPath,
  Recursive: true,
  WithDecryption: true,
}).promise()
  .then((data) => {

    // |2| Create 

    const secrets = {
      jwtSubGuest: null,
      jwtSubMain: null,
      secretCookie: null,
      secretJWT: null,
      secretKeyGuest: null,
      secretKeyMain: null,
    }

    if (data?.Parameters) {
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })

      const secretsString = endent(`
        //
        // secrets.js
        //
        const jwtSubGuest = '${secrets.jwtSubGuest}'
        const jwtSubMain = '${secrets.jwtSubMain}'
        const secretCookie = '${secrets.secretCookie}'
        const secretJWT = '${secrets.secretJWT}'
        const secretKeyGuest = '${secrets.secretKeyGuest}'
        const secretKeyMain = '${secrets.secretKeyMain}'

        module.exports = {
          jwtSubGuest,
          jwtSubMain,
          secretCookie,
          secretJWT,
          secretKeyGuest,
          secretKeyMain,
        }
      `)

      fs.writeFile('.env/.production.secrets.js', secretsString, (err) => {
        try {
          if (err) throw err
        } catch (error) {
          console.error('error in populate_secrets: ', error)
        }
      })
    }
  })
