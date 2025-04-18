import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import { prisma } from '@/db/prisma'
import { Logger } from '@/utils/logger'
import { successResponse, errorResponse } from '@/utils/response'
import { createSession } from '@/routes/session'
import { credentialSchema } from '@/routes/auth'

const loginRoute = new Hono()

loginRoute.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = credentialSchema.safeParse(body)
  if (!parsed.success) {
    Logger.userWarn('Login failed: Invalid input schema')
    return c.json(errorResponse(400, 'Invalid input'), 400)
  }

  const { username, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    Logger.userError(`Login failed for user: ${username} (Invalid credentials)`)
    return c.json(errorResponse(401, 'Invalid credentials'), 401)
  }

  const sessionId = createSession({ userId: user.id, username: user.username })
  c.header('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/; Max-Age=86400`)
  Logger.userInfo(`User logged in: ${username} (ID: ${user.id})`)
  return c.json(successResponse(200, 'Logged in successfully', { token: sessionId }), 200)
})

export default loginRoute
