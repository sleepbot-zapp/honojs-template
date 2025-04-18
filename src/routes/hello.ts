import { Hono } from 'hono'
import { getSessionFromRequest } from '@/routes/session'
import { errorResponse } from '@/utils/response'

const routes = new Hono()

routes.use('*', async (c, next) => {
  const session = getSessionFromRequest(c.req.raw)

  if (!session) {
    return c.json(errorResponse(401, 'Unauthorized: No active session'), 401)
  }
  return next()
})

routes.get('/', (c) => {
  return c.json({ message: 'Hello from Hono + Bun!' })
})

export default routes
