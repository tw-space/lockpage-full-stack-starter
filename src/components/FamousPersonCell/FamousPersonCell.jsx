//
// FamousPersonCell (component)
//
import React, { useState } from 'react'

import Image from 'next/image'

import { styled } from '../../../stitches.config'

export default function FamousPersonCell({ personData }) {
  const [imageSrc, setImageSrc] = useState('');

  ((imageId) => {
    import(`./${imageId}.png`)
      .then((image) => setImageSrc(image.default))
  })(personData.famous_person_id)

  return (
    <FamousPersonCellContainer>
      {imageSrc ? (
        <ImageWrapper>
          <Image
            src={imageSrc}
            alt={`Photo of ${personData.display_name}`}
            className="circle"
            height={88}
            width={88}
          />
        </ImageWrapper>
      ) : (
        <PlaceholderCircle />
      )}
      <p className="personName">{personData.display_name}</p>
    </FamousPersonCellContainer>
  )
}

const FamousPersonCellContainer = styled('div', {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'left',
  paddingY: '1rem',

  '.personName': {
    fontPx: '25',
    fontWeight: '500',
    marginLeft: '2rem',
  },
})

const ImageWrapper = styled('div', {
  '.circle': {
    borderRadius: '50%',
    borderStyle: 'none',
  },
})

const PlaceholderCircle = styled('span', {
  height: '88px',
  width: '88px',
  backgroundColor: '#f3f3f3',
  borderRadius: '50%',
  display: 'inline-block',
})
