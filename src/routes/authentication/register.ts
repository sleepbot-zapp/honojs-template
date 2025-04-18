import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/db/prisma'
import { env } from '@/env'
import { Logger } from '@/utils/logger'
import { errorResponse, successResponse } from '@/utils/response'
import { credentialSchema } from '@/routes/auth'

const registerRoute = new Hono()

registerRoute.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = credentialSchema.safeParse(body)
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

export default registerRoute
