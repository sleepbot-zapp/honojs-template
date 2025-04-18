import { Hono } from 'hono'
import routes from '@/routes/hello'
import { authRoutes } from '@/routes/auth'
import uploadRoutes from '@/routes/upload'

export function registerRoutes(app: Hono) {
  app.route('/', routes)
  app.route('/', authRoutes)
  app.route('/', uploadRoutes)
}
