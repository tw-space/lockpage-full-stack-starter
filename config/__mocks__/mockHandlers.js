//
// mockHandlers 
//
import { rest } from 'msw'

export const mockHandlers = [
  rest.post('/unlock', (req, res, ctx) => {
    switch (req.body[process.env.KEY_NAME]) {
      case 'fake authorize me':
        return res(
          ctx.status(200),
          ctx.json({
            redirect: '../'
          })
        )
      default:
        return res(
          ctx.status(401)
        )
    }
  })
]
