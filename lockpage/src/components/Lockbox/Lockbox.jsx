//
// Lockbox component
//
import { css, styled } from '../../../../stitches.config'

export default function Lockbox(props) {
  return (
    <form
      className={css({ display: 'contents' })()}
      onSubmit={props.submitHandler(
        props.httpClient,
        props.inputValue,
      )}
    >
      <LockboxInput
        type="password"
        placeholder={props.placeholder}
        value={props.inputValue}
        onChange={props.changeHandler}
      />
    </form>
  )
}

const LockboxInput = styled('input', {
  borderStyle: 'none',
  boxSizing: 'border-box',
  caretColor: '#000000',
  color: '#000000',
  fontFamily: 'PixL',
  fontPx: 56,
  textAlign: 'center',
  width: '76%',

  '&:focus': { outline: 'none' },
  '&::placeholder': { color: '$placeholder' },
})
