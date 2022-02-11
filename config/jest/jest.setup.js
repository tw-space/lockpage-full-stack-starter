//
// jest.setup.js
//
import '@testing-library/jest-dom/extend-expect'
import util from 'util'

global.util = util
global.inspect = util.inspect
