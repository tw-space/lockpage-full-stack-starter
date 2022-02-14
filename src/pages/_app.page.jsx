//
// _app.page.js
//
import util from 'util'
import '../styles/fonts/raleway-variable-normal.css'

import { globalCss } from '../../stitches.config'
import { normalize } from '../styles/tw-stitches-normalize'

global.util = util
global.inspect = util.inspect

// start Mock Service Worker on-demand to mock api
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../../config/__mocks__')
}

const customGlobalStyles = {
  body: {
    overflow: 'scroll',
  },
}
const globalStyles = globalCss(...normalize, customGlobalStyles)

// eslint-disable-next-line react/prop-types
function App({ Component, pageProps }) {
  globalStyles()
  return <Component {...pageProps} />
}

export default App
