//
// server/index.js
//
const fs = require('fs')
const https = require('https')
const path = require('path')

const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const nextStart = require('next')
// const enforce = require('express-sslify')

const { Strings } = require('../resources/Strings')

const port = parseInt(process.env.PORT, 10) || 3000
const isDev = process.env.TRUE_ENV !== 'production'
const nextApp = nextStart({ isDev, customServer: true, hostname: 'localhost', port })
const handle = nextApp.getRequestHandler()

const lockpageStaticDir = path.resolve(__dirname, `../${process.env.LOCKPAGE_DIR}`)
const loginPath = process.env.LOGIN_PATH
const isPRTest = process.env.DEPLOYMENT_PURPOSE === 'PR-test'
const useHttpsLocal = process.env.USE_HTTPS_LOCAL !== '0'

//
// Configure and start the custom server
//

nextApp
  .prepare()
  .then(() => {

    const app = express()

    // Configure secure headers with helmet, unless using http local or in PR test
    if (!((isDev && !useHttpsLocal) || isPRTest)) {
      app.use(setHelmet())
    }

    // Logging (for development for now)
    if (isDev) {
      app.use(morgan('dev'))
    }

    // Enforce HTTPS in production (done differently in dev)
    // trustProtoHeader needed for load balancer (not working)
    // if (!isDev) {
    //   app.use(enforce.HTTPS({ trustProtoHeader: true }))
    // }

    // Enable reading form data
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Enable signed cookies
    app.use(cookieParser(process.env.SECRET_COOKIE))

    // Serve only the locksite before authentication and set with virtual path prefix
    app.use(
      loginPath,
      express.static(lockpageStaticDir),
    )

    // Authenticate with keyphrase
    app.post('/unlock', unlockWithKey)

    // Ensure authenticated before serving the main site
    app.use(authenticateJWT)

    // Authenticated; now pass to Next handler
    app.get('*', (req, res) => handle(req, res))

    if (isDev && useHttpsLocal) {
      // Use https when set in development and test
      https
        .createServer(
          {
            key: fs.readFileSync('./server/localhost.key'),
            cert: fs.readFileSync('./server/localhost.crt'),
          },
          app,
        )
        .listen(port, (err) => {
          if (err) throw err
          // eslint-disable-next-line no-console
          console.log(`Node dev server (https): listening on port ${port}`)
        })
    } else {
      app.listen(port, (err) => {
        if (err) throw err
        // eslint-disable-next-line no-console
        console.log(
          `Node ${
            // eslint-disable-next-line
            isDev ? 'dev server' : 'process ' + process.pid
          }: listening on port ${port}`,
        )
      })
    }
  })
  .catch((err) => {
    console.error(err) // eslint-disable-line no-console
  })

//
// Functions
//

function setHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        baseUri: [`'self'`],
        connectSrc: [`'self'`],
        fontSrc: [`'self'`, `data:`],
        formAction: [`'self'`],
        frameAncestors: [`'none'`],
        frameSrc: [`'none'`],
        imgSrc: [`'self'`, `data:`],
        mediaSrc: [`'none'`],
        objectSrc: [`'none'`],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        scriptSrc: [`'self'`],
        scriptSrcAttr: [`'none'`],
        blockAllMixedContent: [],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: {
      policy: ['no-referrer', 'strict-origin-when-cross-origin'],
    },
  })
}

function bearsKey(req) {
  if (
    !(
      process.env.KEY_NAME
      && process.env.SECRET_KEY_MAIN
      && process.env.SECRET_KEY_GUEST
    )
  ) {
    return false
  }
  return (
    req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_MAIN
    || req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_GUEST
  )
}

function unlockWithKey(req, res) {
  if (bearsKey(req)) {
    let jwtSub
    switch (req.body[process.env.KEY_NAME]) {
      case process.env.SECRET_KEY_MAIN:
        jwtSub = process.env.JWT_SUB_MAIN
        break
      case process.env.SECRET_KEY_GUEST:
        jwtSub = process.env.JWT_SUB_GUEST
        break
      default:
        res.status(500).send(Strings.msg500ServerError)
    }
    const signedJWT = jwt.sign({}, process.env.SECRET_JWT, {
      issuer: process.env.JWT_ISS,
      audience: process.env.JWT_AUD,
      expiresIn: process.env.JWT_EXP_IN,
      subject: jwtSub,
    })
    if (!signedJWT) {
      res.status(500).send(Strings.msg500ServerError)
    } else {
      res.cookie(process.env.JWT_NAME, signedJWT, {
        maxAge: process.env.JWT_EXP_IN,
        secure: !(isDev && !useHttpsLocal),
        httpOnly: true,
        sameSite: 'Strict',
        signed: true,
      })
      // redirect to '../' since lockpage is served at login path
      res.status(200).json({ redirect: '../' })
    }
  } else {
    res.status(401).send(Strings.msg401WrongKey)
  }
}

function authenticateJWT(req, res, next) {
  // Confirm correct server environment variables
  if (
    !(
      process.env.JWT_ALG
      && process.env.JWT_AUD
      && process.env.JWT_EXP_IN
      && process.env.JWT_ISS
      && process.env.JWT_NAME
      && process.env.JWT_SUB_MAIN
      && process.env.JWT_SUB_GUEST
      && process.env.SECRET_JWT
      && process.env.LOGIN_PATH
    )
  ) {
    res.status(500).send(Strings.msg500ServerError)

  // Verify jwt is expected
  } else {
    const requestJWT = req.signedCookies[process.env.JWT_NAME] || ''
    try {
      if (!requestJWT) {
        // no cookie, redirect
        throw 303 // eslint-disable-line no-throw-literal
      } else {
        const jwtDecoded = jwt.decode(requestJWT)
        const decodedSub = jwtDecoded.sub
        if (
          !(
            decodedSub === process.env.JWT_SUB_MAIN
            || decodedSub === process.env.JWT_SUB_GUEST
          )
        ) {
          throw 'invalid jwt sub' // eslint-disable-line no-throw-literal
        }
        jwt.verify(requestJWT, process.env.SECRET_JWT, {
          algorithms: [process.env.JWT_ALG],
          issuer: process.env.JWT_ISS,
          audience: process.env.JWT_AUD,
          maxAge: process.env.JWT_EXP_IN,
          subject: decodedSub,
        }, (error) => {
          if (error) {
            throw 'jwt verify failed' // eslint-disable-line no-throw-literal
          }
        })
        next()
      }
    } catch (err) {
      switch (err) {
        case 303:
        case 'invalid jwt sub':
        case 'jwt verify failed':
        default:
          res.redirect(303, process.env.LOGIN_PATH)
          break
      }
    }
  }
}
