/* eslint import/prefer-default-export: 'off' */
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { NextResponse as res } from 'next/server'

import { Strings } from '../../resources/Strings'

export function middleware(req) {
  const activeIndex = process.env.ACTIVE_INDEX || 0
  const env = process.env.TRUE_ENV
  const pathBases = [
    '/_main',
    '/_guest',
  ]
  const { pathname } = req.nextUrl

  // Prevent security issues – users should not be able to canonically access
  // the pages/_* folders and their respective contents
  if (
    pathname.startsWith(`${pathBases[0]}`)
    || pathname.startsWith(`${pathBases[1]}`)
  ) {
    return res.rewrite('/404')
  }

  // Short circuit jwt check in hot development and test
  if (env === 'development-hot' || env === 'test') {
    return res.rewrite(`${pathBases[activeIndex]}${pathname}`)
  }

  // Rewrite url to target variation based on jwt sub
  const jwtSignedCookie = req.cookies[process.env.JWT_NAME] || ''
  try {
    if (!jwtSignedCookie) {
      throw 500 // eslint-disable-line no-throw-literal
    } else {
      const requestJWT = cookieParser.signedCookie(
        jwtSignedCookie,
        process.env.SECRET_COOKIE,
      )
      const jwtDecoded = jwt.decode(requestJWT)
      const decodedSub = jwtDecoded.sub
      switch (decodedSub) {
        case process.env.JWT_SUB_MAIN:
          return res.rewrite(`${pathBases[0]}${pathname}`)
        case process.env.JWT_SUB_GUEST:
          return res.rewrite(`${pathBases[1]}${pathname}`)
        default:
          throw 500 // eslint-disable-line no-throw-literal
      }
    }
  } catch (err) {
    return new Response(
      `${Strings.msg500ServerError}`,
      {
        status: 500,
        statusText: Strings.msg500ServerError,
      },
    )
  }
}
