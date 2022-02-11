//
// code-flags.test.js
// Unit tests for code-flags functions
//
import * as flag from './code-flags'

describe('isEnabled', () => {

  describe('WHEN given non-string', () => {

    it('should return undefined', () => {
      expect(flag.isEnabled(123)).toBe(undefined)
      expect(flag.isEnabled(true)).toBe(undefined)
      expect(flag.isEnabled(['a', 'b'])).toBe(undefined)
      expect(flag.isEnabled(() => {})).toBe(undefined)
    })
  })

  describe('WHEN given flag that does not exist', () => {

    it('should return undefined', () => {
      expect(flag.isEnabled('thisDoesNotExist')).toBe(undefined)
    })
  })

  describe('WHEN given flag that exists but with invalid string value', () => {

    it('should return undefined', () => {
      process.env.FLAG_THIS_EXISTS_BUT_IS_INVALID = 'true'

      expect(flag.isEnabled('thisExistsButIsInvalid')).toBe(undefined)
    })
  })

  describe('WHEN given flag that is valid and on', () => {

    it('should return true', () => {
      process.env.FLAG_THIS_EXISTS_AND_IS_VALID_ON = 'on'

      expect(flag.isEnabled('thisExistsAndIsValidOn')).toBe(true)
    })
  })

  describe('WHEN given flag that is valid and off', () => {

    it('should return false', () => {
      process.env.FLAG_THIS_EXISTS_AND_IS_VALID_ON = 'off'

      expect(flag.isEnabled('thisExistsAndIsValidOn')).toBe(false)
    })
  })
})

describe('getVariant', () => {

  describe('WHEN given non-string', () => {

    it('should return undefined', () => {
      expect(flag.getVariant(123)).toBe(undefined)
      expect(flag.getVariant(true)).toBe(undefined)
      expect(flag.getVariant(['a', 'b'])).toBe(undefined)
      expect(flag.getVariant(() => {})).toBe(undefined)
    })
  })

  describe('WHEN given flag that does not exist', () => {

    it('should return undefined', () => {
      expect(flag.getVariant('thisDoesNotExist')).toBe(undefined)
    })
  })

  describe('WHEN given flag that exists', () => {

    beforeEach(() => {
      process.env.FLAG_THIS_EXISTS = 'purple variant'
    })

    afterEach(() => {
      process.env.FLAG_THIS_EXISTS = null
    })

    it('should return a string', () => {
      expect(flag.getVariant('thisExists')).toBeString()
    })

    it('should return its expected value', () => {
      expect(flag.getVariant('thisExists')).toBe('purple variant')
    })
  })
})
