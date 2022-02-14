/* eslint no-console: 'off' */
//
// populate_secrets.node.js
//
const fs = require('fs')
const path = require('path')

const aws = require('aws-sdk')
const endent = require('endent')

const region = process.env.REGION
const ssmPath = process.env.SSM_PATH

// |1| Initialize the object to hold secrets as they're retrieved

const secrets = {
  dbProdDatabaseName: '',
  dbProdHost: '',
  dbProdPassword: '',
  dbProdPort: '',
  dbProdUser: '',
  jwtAud: '',
  jwtIss: '',
  jwtSubGuest: '',
  jwtSubMain: '',
  rootPwd: '/home/ubuntu/server/lockpage-full-stack-starter',
  secretCookie: '',
  secretJWT: '',
  secretKeyGuest: '',
  secretKeyMain: '',
  useHttpsFromS3: '',
}

// |2| Get parameters from SSM in production (in batches of 10...)

const ssm = new aws.SSM({ region })
ssm.getParameters({
  Names: [
    `${ssmPath}dbProdDatabaseName`,
    `${ssmPath}dbProdPassword`,
    `${ssmPath}dbProdPort`,
    `${ssmPath}dbProdUser`,
    `${ssmPath}jwtAud`,
    `${ssmPath}jwtIss`,
    `${ssmPath}jwtSubGuest`,
    `${ssmPath}jwtSubMain`,
    `${ssmPath}secretCookie`,
    `${ssmPath}secretJWT`,
  ],
  WithDecryption: true,
}).promise()
  .then((data) => {

    // |3| Store the first batch in the secrets object

    if (data?.Parameters) {
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })
    }

    // |4| Query the next batch

    return ssm.getParameters({
      Names: [
        `${ssmPath}secretKeyGuest`,
        `${ssmPath}secretKeyMain`,
      ],
      WithDecryption: true,
    }).promise()
  })
  .then((data) => {

    // |5| Store the second batch in the secrets object
    
    if (data?.Parameters) {
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })
    }

    // |6| Pull DB_PROD_HOST from vars file if exists

    const pathDbProdHost = path.resolve(secrets.rootPwd, '../../vars/DB_PROD_HOST')

    try {
      fs.accessSync(pathDbProdHost, fs.f_OK) // throws error or returns undefined
      const readData = fs.readFileSync(pathDbProdHost, 'utf8')
      if (readData) {
        let trimmedData = readData.trimEnd() // remove trailing whitespace
        trimmedData = trimmedData.replace(/:[0-9]+/g, '') // remove port
        secrets.dbProdHost = trimmedData
      }
    } catch (err) {
      console.error('Warning: local DB_PROD_HOST not found')
    }
    
    // |7| Pull USE_HTTPS_FROM_S3 from vars file if exists

    const pathUseHttpsFromS3 = path.resolve(secrets.rootPwd, '../../vars/USE_HTTPS_FROM_S3')

    try {
      fs.accessSync(pathUseHttpsFromS3, fs.f_OK) // throws error or returns undefined
      const readData = fs.readFileSync(pathUseHttpsFromS3, 'utf8')
      if (readData) {
        const trimmedData = readData.trimEnd() // remove trailing whitespace
        secrets.useHttpsFromS3 = trimmedData
      }
    } catch (err) {
      console.error('Warning: local USE_HTTPS_FROM_S3 not found')
    }
    
    // |8| Create .production.secrets file

    const secretsString = endent(`
      //
      // .production.secrets.js
      //
      const dbProdDatabaseName = '${secrets.dbProdDatabaseName}'
      const dbProdHost = '${secrets.dbProdHost}'
      const dbProdPassword = '${secrets.dbProdPassword}'
      const dbProdPort = '${secrets.dbProdPort}'
      const dbProdUser = '${secrets.dbProdUser}'
      const jwtAud = '${secrets.jwtAud}'
      const jwtIss = '${secrets.jwtIss}'
      const jwtSubGuest = '${secrets.jwtSubGuest}'
      const jwtSubMain = '${secrets.jwtSubMain}'
      const rootPwd = '${secrets.rootPwd}'
      const secretCookie = '${secrets.secretCookie}'
      const secretJWT = '${secrets.secretJWT}'
      const secretKeyGuest = '${secrets.secretKeyGuest}'
      const secretKeyMain = '${secrets.secretKeyMain}'
      const useHttpsFromS3 = '${secrets.useHttpsFromS3}'

      module.exports = {
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
        secretKeyGuest,
        secretKeyMain,
        useHttpsFromS3,
      }
    `)

    fs.writeFile('.env/.production.secrets.js', secretsString, (err) => {
      try {
        if (err) throw err
      } catch (error) {
        console.error('error in populate_secrets: ', error)
      }
    })
  })
