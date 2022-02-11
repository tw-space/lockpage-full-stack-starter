//
// .env/flags.test.js
// Test that flags env files work with env-cmd
//

describe('env', () => {

  let activeEnv

  beforeAll(() => {
    activeEnv = process.env.TRUE_ENV
  })

  it(`should be production, development, or test (is ${process.env.TRUE_ENV})`, () => {
    const expectedValues = ['production', 'development', 'test']

    expect(activeEnv).toBeOneOf(expectedValues)
  })

  describe('flag testOnInProduction', () => {

    describe('WHEN env is production', () => {

      it('should be "on"', () => {
        if (activeEnv === 'production') {
          expect(process.env.FLAG_TEST_ON_IN_PRODUCTION).toBe('on')
        }
      })
    })

    describe('WHEN env is development or test', () => {

      it('should be "off"', () => {
        if (activeEnv === 'development' || activeEnv === 'test') {
          expect(process.env.FLAG_TEST_ON_IN_PRODUCTION).toBe('off')
        }
      })
    })
  })

  describe('flag testOnInDevelopment', () => {

    describe('WHEN env is development', () => {

      it('should be "on"', () => {
        if (activeEnv === 'development') {
          expect(process.env.FLAG_TEST_ON_IN_DEVELOPMENT).toBe('on')
        }
      })
    })

    describe('WHEN env is production or test', () => {

      it('should be "off"', () => {
        if (activeEnv === 'production' || activeEnv === 'test') {
          expect(process.env.FLAG_TEST_ON_IN_DEVELOPMENT).toBe('off')
        }
      })
    })
  })

  describe('flag testOnInTest', () => {

    describe('WHEN env is test', () => {

      it('should be "on"', () => {
        if (activeEnv === 'test') {
          expect(process.env.FLAG_TEST_ON_IN_TEST).toBe('on')
        }
      })
    })

    describe('WHEN env is production or development', () => {
      
      it('should be "off"', () => {
        if (activeEnv === 'production' || activeEnv === 'development') {
          expect(process.env.FLAG_TEST_ON_IN_TEST).toBe('off')
        }
      })
    })
  })
})
