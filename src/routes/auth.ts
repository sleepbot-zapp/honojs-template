import { env } from '@/env'
import jwt from 'jsonwebtoken'
import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/db/prisma'
import { successResponse, errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'

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
    Logger.warn('Login failed: Invalid request schema')
    return c.json(errorResponse(400, 'Invalid request'), 400)
  }

  const { username, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    Logger.warn(`Login failed: User "${username}" not found`)
    return c.json(errorResponse(401, 'Invalid credentials'), 401)
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    Logger.warn(`Login failed: Incorrect password for "${username}"`)
    return c.json(errorResponse(401, 'Invalid credentials'), 401)
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, env.JWT_SECRET, {
    expiresIn: '1h',
  })

  Logger.info(`User logged in: ${username} (ID: ${user.id})`)
  Logger.dbRead(`User fetched from DB: ${username}`)

  return c.json(successResponse({ token }, 200, 'Login successful'), 200)
})
