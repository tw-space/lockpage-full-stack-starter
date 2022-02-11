//
// __mocks__/browser.js
// starts a msw Mock Service Worker instance
//
import { setupWorker } from 'msw'
import { mockHandlers } from './mockHandlers'

// configure a Service Worker with the given request handlers
export const mocksWorker = setupWorker(...mockHandlers)
