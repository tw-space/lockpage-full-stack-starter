//
// __mocks__/index.js
//
if (typeof window === 'undefined' || process.env.TRUE_ENV.startsWith('test')) {
  const { mocksServer } = require('./server')
  mocksServer.listen()
} else {
  const { mocksWorker } = require('./browser')
  mocksWorker.start()
}
