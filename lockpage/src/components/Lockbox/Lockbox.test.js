//
// Lockbox.test.js
// Unit tests for Lockbox component
//
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Lockbox from './Lockbox'

describe('Lockbox', () => {

  // MARK: - Set up test suite
  
  const placeholderDefault = 'enter here'
  const fakeStateValue = 'fake value'

  let mockSubmitHandler
  let mockHttpClient
  let mockChangeHandler
  let renderedLockbox
  let container
  let inputBox

  beforeEach(() => {
    mockSubmitHandler = jest
      .fn(() => jest.fn())
      .mockName('mockSubmitHandler')
    mockHttpClient = {
      post: jest.fn().mockReturnThis(),
    }
    mockChangeHandler = jest.fn()
    renderedLockbox = render(
      <Lockbox
        submitHandler={mockSubmitHandler}
        httpClient={mockHttpClient}
        inputValue={fakeStateValue}
        changeHandler={mockChangeHandler}
        placeholder={placeholderDefault}
      />,
    );
    ({ container } = renderedLockbox)
    inputBox = container.querySelector('input')
  })

  afterEach(() => {
    mockSubmitHandler = null
    mockHttpClient = null
    mockChangeHandler = null
    renderedLockbox = null
    container = null
    inputBox = null
  })

  // MARK: - Initial state
  
  describe('WHEN loads', () => {

    it('should render an Input element', () => {
      expect(inputBox).toBeInTheDocument()
    })

    it('should render an Input of password type [P1]', () => {
      expect(inputBox).toHaveAttribute('type', 'password')
    })

    it('should render Input with placeholder text "enter here"', () => {
      expect(inputBox).toHaveAttribute('placeholder', placeholderDefault)
    })

    it(`should render Input with default value: ${fakeStateValue}`, () => {
      expect(inputBox).toHaveAttribute('value', fakeStateValue)
    })
  })

  // - onChange

  describe('WHEN pressing a character in the box', () => {

    beforeEach(() => {
      userEvent.type(inputBox, 'a')
    })

    it('should call changeHandler once', () => {
      expect(mockChangeHandler.mock.calls.length).toBe(1)
    })

    it('should call changeHandler with one arg (event)', () => {
      expect(mockChangeHandler.mock.calls[0].length).toBe(1)
    })

    it('should call changeHandler with an arg with type "change"', () => {
      expect(mockChangeHandler.mock.calls[0][0].type).toEqual('change')
    })
  })

  // MARK: - onSubmit

  describe('WHEN pressing Enter in the box', () => {

    beforeEach(() => {
      userEvent.type(inputBox, '{enter}')
    })

    it('should call submitHandler once', () => {
      expect(mockSubmitHandler.mock.calls.length).toBe(1)
    })

    it('should call submitHandler with two args (httpClient, inputValue)', () => {
      expect(mockSubmitHandler.mock.calls[0].length).toBe(2)
    })
    
    it('should call submitHandler with first arg with post method', () => {
      expect(mockSubmitHandler.mock.calls[0][0]).toHaveProperty('post')
    })

    it('should call submitHandler with second arg a string', () => {
      expect(typeof mockSubmitHandler.mock.calls[0][1]).toBe('string')
    })

    it(`should call submitHandler with second arg being initial state value: ${fakeStateValue}`, () => {
      expect(mockSubmitHandler.mock.calls[0][1]).toEqual(fakeStateValue)
    })

    it('should call submitHandler, which should return function, which should be called again with event whose type is "submit"', () => {
      expect(mockSubmitHandler.mock.results[0].value.mock.calls[0][0].type).toEqual('submit')
    })
  })
})
