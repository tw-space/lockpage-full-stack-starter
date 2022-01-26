//
// index.page.jsx (lockpage)
//
import superagent from 'superagent'

import { styled } from '../../../stitches.config'
import Lockpage from '../page-components/Lockpage'

export default function Index() {
  return (
    <IndexContainer>
      <Lockpage httpClient={superagent} />
    </IndexContainer>
  )
}

const IndexContainer = styled('div', {})
