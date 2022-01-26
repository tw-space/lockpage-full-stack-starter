//
// Lockpage.test.js
// Unit tests for Lockpage page component
//
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import superagent from 'superagent'

import Lockpage from './Lockpage'

describe('Lockpage', () => {

  // - Set up test suite

  const keyName = process.env.KEY_NAME
  const fakeValue = 'fakeValue'
  const inputText = 'let_me_in'
  const placeholderDefault = 'enter here'
  const placeholderUnauthorized = 'nope'

  let mockHttpClient
  let mockEvent
  let mockDepLockpage
  let mockDepLockbox
  let httpLockpage
  let httpLockbox
  let container

  beforeEach(() => {
    mockHttpClient = {
      catch: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      then: jest.fn().mockReturnThis(),
    }
    mockEvent = {
      preventDefault: jest.fn().mockReturnThis(),
    }
    mockDepLockpage = render(<Lockpage httpClient={mockHttpClient} />);
    ({ container } = mockDepLockpage)
    mockDepLockbox = container.querySelector('input')
    httpLockpage = render(<Lockpage httpClient={superagent} />);
    ({ container } = httpLockpage)
    httpLockbox = container.querySelector('input')
  })

  afterEach(() => {
    mockHttpClient = null
    mockEvent = null
    mockDepLockpage = null
    mockDepLockbox = null
    httpLockpage = null
    httpLockbox = null
    container = null
  })

  // - Lockbox initial state

  describe('Lockbox', () => {

    describe('WHEN loads', () => {

      it(`should show placeholder state: ${placeholderDefault}`, () => {
        expect(httpLockbox).toHaveAttribute('placeholder', placeholderDefault)
      })

      it('should show value state: empty string', () => {
        expect(httpLockbox).toHaveAttribute('value', '')
      })
    })
  })

  // - handleUnlock 

  describe('handleUnlock method', () => {

    describe('WHEN called with httpClient and inputValue, then event object, as curried functions', () => {

      beforeEach(() => {
        Lockpage.prototype.handleUnlock(mockHttpClient, fakeValue)(mockEvent)
      })

      it('should call preventDefault() on event object', () => {
        expect(mockEvent.preventDefault.mock.calls.length).toBe(1)
      })
      
      it('should call post on httpClient once', () => {
        expect(mockHttpClient.post.mock.calls.length).toBe(1)
      })

      it('should call post on httpClient with one arg', () => {
        expect(mockHttpClient.post.mock.calls[0].length).toBe(1)
      })

      it('should call post on httpClient with "/unlock" as arg', () => {
        expect(mockHttpClient.post.mock.calls[0][0]).toBe('/unlock')
      })

      it('should call set on httpClient with two arguments', () => {
        expect(mockHttpClient.set.mock.calls[0].length).toBe(2)
      })

      it('should call set on httpClient with "Content-Type", "application/json"', () => {
        expect(mockHttpClient.set.mock.calls[0][0]).toBe('Content-Type')
        expect(mockHttpClient.set.mock.calls[0][1]).toBe('application/json')
      })

      it('should call send on httpClient with a string', () => {
        expect(mockHttpClient.send.mock.calls[0].length).toBe(1)
        expect(typeof mockHttpClient.send.mock.calls[0][0]).toBe('string')
      })

      it(`should call send on httpClient with '{"${keyName}":"${fakeValue}"}'`, () => {
        expect(mockHttpClient.send.mock.calls[0][0]).toBe(`{"${keyName}":"${fakeValue}"}`)
      })
    })
  })

  // - Lockbox input

  describe('WHEN typing "let_me_in" then pressing Enter in Lockbox', () => {

    beforeEach(() => {
      userEvent.type(mockDepLockbox, `${inputText}{enter}`)
    })

    it('should send "let_me_in" as value in post method', () => {
      expect(mockHttpClient.send.mock.calls[0][0]).toBe(`{"${keyName}":"${inputText}"}`)
    })
  })

  // - api response

  describe('WHEN receiving error code from /unlock api [msw]', () => {

    beforeEach(() => {
      // start Mock Service Worker to mock api for testing
      require('../../../../test/__mocks__')

      userEvent.type(httpLockbox, `${inputText}`)
    })

    it('should clear Lockbox state to empty string', async () => {
      expect(httpLockbox).toHaveAttribute('value', `${inputText}`)

      userEvent.type(httpLockbox, '{enter}')

      await waitFor(() => {
        expect(httpLockbox).toHaveAttribute('value', '')
      })
    })

    it('should set placeholder to nope', async () => {
      expect(httpLockbox).toHaveAttribute('placeholder', placeholderDefault)

      userEvent.type(httpLockbox, '{enter}')

      await waitFor(() => {
        expect(httpLockbox).toHaveAttribute('placeholder', placeholderUnauthorized)
      })
    })
  })
})
