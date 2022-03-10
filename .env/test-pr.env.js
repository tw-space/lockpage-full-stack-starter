//
// test-pr.env.js
// Test environment variables for PR tests in GitHub Actions workflow
//
const envTest = require('./test.env.js')

const envTestPR = {
  ...envTest,
  DB_DEV_HOST: 'postgres',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  NODE_TLS_REJECT_UNAUTHORIZED: '1',
  TRUE_ENV: 'test-PR',
}

module.exports = envTestPR
