//
// main / index.page.jsx
//
import FamousPeople from '../../../models/FamousPeople'
import { styled } from '../../../stitches.config'
import FamousPeopleHomePage from '../../page-components/FamousPeopleHomePage'

function Index({ famousPeopleData }) {
  return (
    <IndexContainer>
      <FamousPeopleHomePage famousPeopleData={famousPeopleData} />
    </IndexContainer>
  )
}

const IndexContainer = styled('div', {})

export async function getServerSideProps() {
  const famousPeopleData = await FamousPeople.query()

  return { props: { famousPeopleData: JSON.parse(JSON.stringify(famousPeopleData)) } }
}

export default Index
