import { Hono } from 'hono'
import { getSessionFromRequest } from '@/routes/session'
import { successResponse, errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'

const sessionRoute = new Hono()

sessionRoute.get('/session', async (c) => {
  const session = getSessionFromRequest(c.req.raw)
  if (!session) {
    Logger.userWarn('Session check failed: Session not found')
    return c.json(errorResponse(401, 'Session not found'), 401)
  }

  Logger.userInfo(`Session found for user: ${session.username} (ID: ${session.userId})`)
  return c.json(successResponse(200, 'Session active', { user: session }), 200)
})

export default sessionRoute
