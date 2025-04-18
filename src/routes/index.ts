import { Hono } from 'hono'
import routes from '@/routes/hello'
import { authRoutes } from '@/routes/auth'
import uploadRoutes from '@/routes/upload'
import { getSessionFromRequest } from '@/routes/session'
import { errorResponse } from '@/utils/response'

export function registerRoutes(app: Hono) {
  app.route('/', routes)
  app.route('/', authRoutes)
  app.route('/', uploadRoutes)

  const bypassRoutes = ['/register', '/login']

  app.use('*', async (c, next) => {
    if (bypassRoutes.some((route) => c.req.url.endsWith(route))) {
      return next()
    }

    const session = getSessionFromRequest(c.req.raw)

    if (!session) {
      return c.json(errorResponse(401, 'Unauthorized: No active session'), 401)
    }
    return next()
  })
}
