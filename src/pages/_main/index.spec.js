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
  ('should show title that contains \'Welcome to Main!\'', async t => {
  const title = Selector('title')

  await t.expect(title.innerText).contains('Welcome to Main!')
})

test
  .meta({ priority: 'P2' })
  ('should contain heading "Welcome to Main!"', async t => {
    const heading = Selector('h1')

    await t.expect(heading.innerText).eql('Welcome to Main!')
  })
