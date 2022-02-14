//
// server.test.js
//
// To run:
//   1. run `yarn jest:server:build` after app code changes or not yet built
//   2. run `yarn jest:server` when app code hasn't change and already test build
//
import request from 'supertest'

import parseCookie from '../utils/parseCookie'

const app = process.env.URL_LOCAL
const redirectPath = process.env.LOGIN_PATH
const unlockPath = '/unlock'
const defaultGuestPassword = process.env.SECRET_KEY_GUEST

describe('app server', () => {
  
  describe('WHEN GET /', () => {
    
    let res

    beforeAll(async () => {
      res = await request(app)
        .get('/')
    })

    it('should respond with 303 (See Other)', () => {
      expect(res.status).toEqual(303)
    })

    it(`should send redirect location: ${redirectPath}`, () => {
      expect(res.headers.location).toEqual(redirectPath)
    })

    it('should set secure headers (except in PR test)', () => {
      if (!(process.env.DEPLOYMENT_PURPOSE === 'PR-test')) {
        expect(res.headers['content-security-policy']).toEqual(
          "default-src 'self';base-uri 'self';connect-src 'self';font-src 'self' data:;form-action 'self';frame-ancestors 'none';frame-src 'none';img-src 'self' data:;media-src 'none';object-src 'none';sandbox allow-forms allow-scripts allow-same-origin;style-src 'self' 'unsafe-inline';script-src 'self';script-src-attr 'none';block-all-mixed-content;upgrade-insecure-requests",
        )
        expect(res.headers['cross-origin-embedder-policy']).toEqual('require-corp')
        expect(res.headers['cross-origin-opener-policy']).toEqual('same-origin')
        expect(res.headers['cross-origin-resource-policy']).toEqual('same-origin')
        expect(res.headers['x-dns-prefetch-control']).toEqual('off')
        expect(res.headers['expect-ct']).toEqual('max-age=0')
        expect(res.headers['x-frame-options']).toEqual('SAMEORIGIN')
        expect(res.headers['strict-transport-security']).toEqual(
          'max-age=15552000; includeSubDomains',
        )
        expect(res.headers['x-download-options']).toEqual('noopen')
        expect(res.headers['x-content-type-options']).toEqual('nosniff')
        expect(res.headers['origin-agent-cluster']).toEqual('?1')
        expect(res.headers['x-permitted-cross-domain-policies']).toEqual('none')
        expect(res.headers['x-xss-protection']).toEqual('0')
        expect(res.headers['referrer-policy']).toEqual(
          'no-referrer,strict-origin-when-cross-origin',
        )
      }
    })
  })

  describe('WHEN GET nonsense path', () => {
    
    let res

    beforeAll(async () => {
      res = await request(app)
        .get('/asdf')
    })

    it(`should respond with 303 and location ${redirectPath}`, () => {
      expect(res.status).toEqual(303)
      expect(res.headers.location).toEqual(redirectPath)
    })
  })

  describe(`WHEN GET ${redirectPath}`, () => {
    
    let res

    beforeAll(async () => {
      res = await request(app)
        .get(redirectPath)
    })

    it('should respond with 200', () => {
      expect(res.status).toEqual(200)
    })
  })

  describe(`WHEN GET ${redirectPath.slice(0, -1)} (without trailing slash)`, () => {

    let res

    beforeAll(async () => {
      res = await request(app)
        .get(`${redirectPath.slice(0, -1)}`)
    })

    it('should respond with 301 (Moved Permanently) and location', () => {
      expect(res.status).toEqual(301)
      expect(res.headers.location).toEqual(redirectPath)
    })
  })

  describe(`WHEN POST ${unlockPath} with no body data`, () => {
    
    let res

    beforeAll(async () => {
      res = await request(app)
        .post(unlockPath)
        .send({})
    })

    it('should respond with 401 (Not Authorized)', () => {
      expect(res.status).toEqual(401)
    })
  })

  describe(`WHEN POST ${unlockPath} with default guest secret`, () => {
    
    let res

    beforeAll(async () => {
      res = await request(app)
        .post(unlockPath)
        .set('Content-Type', 'application/json')
        .send(`{"${process.env.KEY_NAME}":"${defaultGuestPassword}"}`)
    })

    it('should respond with 200', () => {
      expect(res.status).toEqual(200)
    })

    it('should respond with body.redirect to "../"', () => {
      expect(res.body).toContainEntry(['redirect', '../'])
    })

    it('should respond with set-cookie in header', () => {
      expect(res.header['set-cookie']).toBeTruthy()
    })

    describe('the cookie', () => {
        
      let cookieObject

      beforeEach(() => {
        cookieObject = parseCookie(res.header['set-cookie'])
      })

      afterEach(() => {
        cookieObject = null
      })

      it('should contain key "access_token"', () => {
        expect(cookieObject).toContainKey('access_token')
      })

      it('should have a signed "access_token" that starts with "s:"', () => {
        expect(cookieObject.access_token).toStartWith('s:')
      })

      it('should contain Max-Age of 86400 (one day)', () => {
        expect(cookieObject).toContainEntry(['Max-Age', '86400'])
      })

      it('should contain key "HttpOnly"', () => {
        expect(cookieObject).toContainKey('HttpOnly')
      })

      it('should contain key "Secure" (except in PR test)', () => {
        if (!(process.env.DEPLOYMENT_PURPOSE === 'PR-test')) {
          expect(cookieObject).toContainKey('Secure')
        }
      })

      it('should contain "SameSite": "Strict"', () => {
        expect(cookieObject).toContainEntry(['SameSite', 'Strict'])
      })
    })

    describe(`WHEN subsequently GET / with a valid cookie for guest`, () => {

      let resTwo

      beforeAll(async () => {
        resTwo = await request(app)
          .get('/')
          .set('Cookie', res.header['set-cookie'])
          .send({})
      })

      it('should return respond with 200', () => {
        expect(resTwo.status).toEqual(200)
      })

      it('should contain text "Welcome to Guest!"', () => {
        expect(resTwo.text).toMatch(/Welcome to Guest!/)
      })
    })
  })
})
