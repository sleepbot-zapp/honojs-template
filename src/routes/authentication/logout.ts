import { Hono } from 'hono'
import { deleteSession, getSessionFromRequest } from '@/routes/session'
import { successResponse, errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'

const logoutRoute = new Hono()

logoutRoute.post('/logout', async (c) => {
  const session = getSessionFromRequest(c.req.raw)
  if (!session) {
    Logger.userWarn('Logout failed: No active session found')
    return c.json(errorResponse(401, 'No active session'), 401)
  }

  deleteSession(session.sessionId)
  c.header('Set-Cookie', `session_id=; HttpOnly; Path=/; Max-Age=0`)
  Logger.userInfo(`User logged out: ${session.username} (ID: ${session.userId})`)
  return c.json(successResponse(200, 'Logged out successfully', null), 200)
})

export default logoutRoute
