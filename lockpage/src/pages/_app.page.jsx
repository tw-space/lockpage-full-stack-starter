//
// _app.page.js (lockpage)
//
import { globalCss } from '../../../stitches.config'
import { normalize } from '../styles/tw-stitches-normalize'

// start Mock Service Worker when flagged to mock api
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../../../test/__mocks__')
}

let baseFontPath = '/'
if (process.env.LOGIN_PATH) {
  baseFontPath = process.env.LOGIN_PATH
}

const customGlobalStyles = {
  body: {
    overflow: 'hidden',
  },
  '@font-face': [
    {
      fontFamily: 'PixL',
      src: `url("${baseFontPath}pixl.regular.woff2")`,
    },
  ],
}
const globalStyles = globalCss(...normalize, customGlobalStyles)

// eslint-disable-next-line react/prop-types
function App({ Component, pageProps }) {
  globalStyles()
  return <Component {...pageProps} />
}

export default App
