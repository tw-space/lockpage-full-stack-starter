//
// main › index.spec.js
//
// App must be running at process.env.URL_LOCAL
//
import { Selector, RequestLogger } from 'testcafe'

fixture `homepage`
  .page (process.env.URL_LOCAL)

const logger = RequestLogger()
test
  .meta({ priority: 'P3' })
  .requestHooks(logger)
  ('WHEN visited,\n  should exist', async t => {
    await t.expect(logger.contains(record => record.response.statusCode === 200)).ok()
})

test
  .meta({ priority: 'P2' })  
  ('should show title that contains \'Famous People App\'', async t => {
  const title = Selector('title')

  await t.expect(title.innerText).contains('Famous People App')
})
