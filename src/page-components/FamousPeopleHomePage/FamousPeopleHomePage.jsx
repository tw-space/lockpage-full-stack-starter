//
// FamousPeopleHomePage (page component)
//
import React from 'react'

import Head from 'next/head'

import { styled } from '../../../stitches.config'
import FamousPersonCell from '../../components/FamousPersonCell'
import HeaderBar from '../../components/HeaderBar'

export default function FamousPeopleHomePage({ famousPeopleData }) {
  return (
    <FamousPeopleHomePageContainer>
      <Head>
        <title>Famous People App</title>
        <meta name="description" content="Famous People App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderBar headerTitle="Famous People" />
      <Main>
        <H1>Short List of Whimsically Chosen Famous People</H1>
        <FamousPeopleList>
          {famousPeopleData.map((person) => (
            <FamousPersonCell personData={person} key={person.famous_person_id} />
          ))}
        </FamousPeopleList>
      </Main>
    </FamousPeopleHomePageContainer>
  )
}

const FamousPeopleHomePageContainer = styled('div', {
  fontFamily: 'RalewayVariable',
})

const Main = styled('div', {
  marginX: 'auto',
  maxWidth: '50rem',
  paddingX: '1.75rem',
  '@sm': {
    paddingX: '2.5rem',
  },
})

const H1 = styled('h1', {
  fontPx: '36',
  fontWeight: '700',
  marginTop: '2rem',

  '@sm': {
    fontPx: '48',
    marginTop: '2.5rem',
  },
})

const FamousPeopleList = styled('div', {
  marginBottom: '2rem',
  marginTop: '2.25rem',

  '@sm': {
    marginTop: '2.5rem',
  },
})
