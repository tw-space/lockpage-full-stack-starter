//
// utils/code-flags.js
// Helpers for using feature flags.
//

/**
 * Converts camel cased string to snake upper case.
 * 
 * @param {string} camelCaseInput Camel cased string input.
 *  
 * @returns {string|undefined} Returns snake upper case conversion when input 
 *    is camel cased string. Otherwise returns undefined.
 */
function convertCamelToSnakeUpperCase(camelCaseInput) {
  if (typeof camelCaseInput !== 'string') return undefined
  if (camelCaseInput.match(/^[a-z][a-zA-Z]+$/) === null) return undefined

  const snakeCased = camelCaseInput.replace(/[A-Z]/g, (letter) => `_${letter}`)
  const snakeUpperCased = snakeCased.toUpperCase()

  return snakeUpperCased
}

/**
 * Checks whether flag's value is set to 'on'.
 * Flag names must be passed in camel case (e.g. 'testFeature') while its associated
 * environment variable name must be in snake uppercase and start with 'FLAG_'
 * (e.g. 'FLAG_TEST_FEATURE').
 * 
 * @param {string} camelCaseFlagName Flag name written in camel case.
 * @returns {boolean|undefined} Returns true/false when flag is found and
 *    value is 'on'/'off'. Otherwise returns undefined.
 */
export function isEnabled(camelCaseFlagName) {
  if (typeof camelCaseFlagName !== 'string') return undefined

  const snakeUpperCasedName = convertCamelToSnakeUpperCase(camelCaseFlagName)
  if (snakeUpperCasedName === undefined) return false

  if (!(
    process.env[`FLAG_${snakeUpperCasedName}`] === 'on'
    || process.env[`FLAG_${snakeUpperCasedName}`] === 'off'
  )) {
    return undefined
  }

  return process.env[`FLAG_${snakeUpperCasedName}`] === 'on'
}

/**
 * Gets flag's value.
 * Flag names must be passed in camel case (e.g. 'testFeature') while its associated
 * environment variable name must be in snake uppercase and start with 'FLAG_'
 * (e.g. 'FLAG_TEST_FEATURE').
 * 
 * @param {string} camelCaseFlagName Flag name written in camel case.
 * @returns {string|undefined} Returns flag's value when flag is found. 
 *    Otherwise returns undefined.
 */
export function getVariant(camelCaseFlagName) {
  if (typeof camelCaseFlagName !== 'string') return undefined

  const snakeUpperCasedName = convertCamelToSnakeUpperCase(camelCaseFlagName)
  if (snakeUpperCasedName === undefined) return undefined

  return process.env[`FLAG_${snakeUpperCasedName}`]
}
