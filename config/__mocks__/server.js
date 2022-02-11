// 
// __mocks__/server.js
//
import { setupServer } from 'msw/node'
import { mockHandlers } from './mockHandlers'

export const mocksServer = setupServer(...mockHandlers)
