import { env } from '@/env'
import jwt from 'jsonwebtoken'
import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/db/prisma'
import { successResponse, errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'
import { createSession, deleteSession, getSessionFromRequest } from '@/utils/session'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    Logger.warn('Register failed: Invalid input schema')
    return c.json(errorResponse(400, 'Invalid input'), 400)
  }

  const { username, password } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { username } })

  if (existingUser) {
    Logger.warn(`Register failed: Username "${username}" already exists`)
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

  Logger.info(`New user registered: ${username} (ID: ${user.id})`)
  Logger.dbWrite(`User created in database: ${JSON.stringify(user)}`)

  return c.json(successResponse({ token }, 201, 'User registered successfully'), 201)
})


authRoutes.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return c.json(errorResponse(400, 'Invalid request'), 400)
  }

  const { username, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { username } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json(errorResponse(401, 'Invalid credentials'), 401)
  }

  const sessionId = createSession({ userId: user.id, username: user.username })

  c.header('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/; Max-Age=86400`)

  return c.json(successResponse(null, 200, 'Logged out successfully'))
})

authRoutes.post('/logout', async (c) => {
  const session = getSessionFromRequest(c.req.raw)

  if (!session) {
    return c.json(errorResponse(401, 'No active session'), 401)
  }

  deleteSession(session.sessionId)

  c.header('Set-Cookie', `session_id=; HttpOnly; Path=/; Max-Age=0`)

  return c.json(successResponse(null, 200, 'Logged out successfully'), 200)
})

authRoutes.get('/session', async (c) => {
  const session = getSessionFromRequest(c.req.raw)

  if (!session) {
    return c.json(errorResponse(401, 'Session not found'), 401)
  }

  return c.json(successResponse({ user: session }, 200, 'Session active'), 200)
})
