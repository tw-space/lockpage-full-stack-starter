//
// guest/index.page.jsx
//
import { styled } from '../../../stitches.config'
import Welcome from '../../page-components/Welcome'

export default function Index() {
  return (
    <IndexContainer>
      <Welcome appName="Guest" />
    </IndexContainer>
  )
}

const IndexContainer = styled('div', {})
