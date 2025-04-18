import { Hono } from 'hono'
import registerRoute from './authentication/register'
import loginRoute from './authentication/login'
import logoutRoute from './authentication/logout'
import sessionRoute from './authentication/session'
import { z } from 'zod'

export const authRoutes = new Hono()

export const credentialSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

authRoutes.route('/auth', registerRoute)
authRoutes.route('/auth', loginRoute)
authRoutes.route('/auth', logoutRoute)
authRoutes.route('/auth', sessionRoute)
