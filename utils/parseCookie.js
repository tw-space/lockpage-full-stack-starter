//
// parseCookie.js
//
export default function parseCookie(input) {
  const cookie = input.toString()
  return cookie
    .split(';')
    .map((keyvalue) => keyvalue.split('='))
    .reduce((acc, kvPair) => {
      acc[decodeURIComponent(kvPair[0]?.trim())] = decodeURIComponent(kvPair[1]?.trim())
      return acc
    }, {})
}
