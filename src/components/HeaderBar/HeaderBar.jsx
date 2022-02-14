//
// HeaderBar (component)
//
import React from 'react'

import { styled } from '../../../stitches.config'

export default function HeaderBar({ headerTitle }) {
  return (
    <HeaderBarContainer>
      <div className="contentBox">
        <H1>{headerTitle}</H1>
      </div>
    </HeaderBarContainer>
  )
}

const HeaderBarContainer = styled('div', {
  position: 'relative',
  backgroundColor: 'white',
  borderBottomStyle: 'solid',
  borderBottomWidth: '2px',
  borderColor: '$gray100',

  '.contentBox': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    marginX: 'auto',
    maxWidth: '80rem',
    paddingX: '1.75rem',
    paddingY: '1.5rem',
    '@sm': {
      justifyContent: 'start',
      paddingX: '2.5rem',
    },
  },
})

const H1 = styled('h1', {
  fontFamily: 'RalewayVariable',
  fontPx: '16',
  fontWeight: '800',
})
