//
// _app.page.js
//
import { globalCss } from '../../stitches.config'
import { normalize } from '../styles/tw-stitches-normalize'

// start Mock Service Worker in development and testing to mock api
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../../config/__mocks__')
}

// const customGlobalStyles = {}
const globalStyles = globalCss(...normalize/*, customGlobalStyles*/)

// eslint-disable-next-line react/prop-types
function App({ Component, pageProps }) {
  globalStyles()
  return <Component {...pageProps} />
}

export default App
