/* eslint no-multi-str: 'off' */
//
// Welcome page component
//
import React from 'react'

import Head from 'next/head'
import Image from 'next/image'

import { styled } from '../../../stitches.config'

export default function Welcome(props) {
  return (
    <WelcomeContainer>
      <Head>
        <title>
          Welcome to
          {' '}
          {props.appName ? props.appName : 'Next'}
          !
        </title>
        <meta name="description" content="Welcome to Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <Title>
          Welcome to
          {' '}
          {props.appName ? props.appName : 'Next'}
          !
        </Title>

        <Subtitle>
          Get started by editing
          {' '}
          <code>pages/index.js</code>
        </Subtitle>
        
        <Grid>
          <Card href="https://nextjs.org/docs">
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </Card>

          <Card href="https://nextjs.org/learn">
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </Card>

          <Card href="https://github.com/vercel/nextjs/tree/master/examples">
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </Card>

          <Card href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app">
            <h2>Deploy &rarr;</h2>
            <p>Instantly deploy your Next.js site to a public URL with Vercel.</p>
          </Card>
        </Grid>
      </Main>
      <Footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by
          {' '}
          <span className="logo">
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </Footer>
    </WelcomeContainer>
  )
}

const WelcomeContainer = styled('div', {
})

const Main = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100vh',
  mx: 'auto',
})

const Title = styled('h1', {
  fontPx: 64,
  fontWeight: 'bold',
  lineHeight: '1.15',
  margin: '0',
  paddingTop: '4rem',
  textAlign: 'center',

  a: {
    color: '#0070f3',
  },

  'a:hover,\
  a:focus,\
  a:active': {
    textDecoration: 'underline',
  },
})

const Subtitle = styled('p', {
  fontSize: '1.5rem',
  fontWeight: 'normal',
  lineHeight: 1.5,
  margin: '4rem 0',
  textAlign: 'center',

  code: {
    background: '#fafafa',
    borderRadius: '5px',
    fontFamily: 'Menlo, Monaco, Lucida Console, monospace',
    fontSize: '1.1rem',
    padding: '0.75rem',
  },
})

const Grid = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  maxWidth: '800px',
  // gridCols: 2,

  '@media (max-width: 600px)': {
    '&': {
      flexDirection: 'column',
      width: '100%',
    },
  },
})

const Card = styled('div', {
  border: '1px solid #eaeaea',
  borderRadius: '10px',
  color: 'inherit',
  margin: '1rem',
  maxWidth: '300px',
  padding: '1.5rem',
  textAlign: 'left',
  textDecoration: 'none',
  transition: 'color 0.15s ease, border-color 0.15s ease',
  // flex: 'full',

  '&:hover,\
  &:focus,\
  &:active': {
    borderColor: '#0070f3',
    color: '#0070f3',
  },

  h2: {
    fontSize: '1.5rem',
    fontWeight: 'semibold',
    margin: '0 0 1rem 0',
  },

  p: {
    fontSize: '1.25rem',
    lineHeight: 1.5,
    margin: 0,
  },
})

const Footer = styled('footer', {
  display: 'flex',
  flex: 1,
  padding: '2rem 0',
  borderTop: '1px solid #eaeaea',
  justifyContent: 'center',
  alignItems: 'center',

  a: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },

  '.logo': {
    height: '1em',
    marginLeft: '0.5rem',
  },
})
