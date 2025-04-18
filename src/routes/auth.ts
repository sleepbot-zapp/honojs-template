import { env } from '@/env'
import jwt from 'jsonwebtoken'
import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/db/prisma'
import { successResponse, errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'
import { createSession, deleteSession, getSessionFromRequest } from '@/routes/session'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    Logger.userWarn('Register failed: Invalid input schema')
    return c.json(errorResponse(400, 'Invalid input'), 400)
  }
  const { username, password } = parsed.data
  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) {
    Logger.userWarn(`Register failed: Username "${username}" already exists`)
    return c.json(errorResponse(409, 'Username already exists'), 409)
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      username,
      password: passwordHash,
    },
  })
  const token = jwt.sign({ sub: user.id, username: user.username }, env.JWT_SECRET, {
    expiresIn: '1h',
  })
  Logger.userInfo(`User registered: ${username} (ID: ${user.id})`)
  return c.json(successResponse(201, 'User registered successfully', { token }), 201)
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
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

authRoutes.post('/logout', async (c) => {
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

authRoutes.get('/session', async (c) => {
  const session = getSessionFromRequest(c.req.raw)
  if (!session) {
    Logger.userWarn('Session check failed: Session not found')
    return c.json(errorResponse(401, 'Session not found'), 401)
  }
  Logger.userInfo(`Session found for user: ${session.username} (ID: ${session.userId})`)
  return c.json(successResponse(200, 'Session active', { user: session }), 200)
})
