import { Hono } from 'hono'
import { logger } from 'hono/logger'
import routes from '@/routes/hello'
import { authRoutes } from '@/routes/auth'
import { env } from "@/env"
import { errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'


const app = new Hono()

app.use(logger())

app.route('/api', routes)
app.route('/auth', authRoutes)

app.notFound((c) => {
  const message = `404 - ${c.req.method} ${c.req.url}`
  Logger.warn(message)
  return c.json(errorResponse(404, 'Not Found', message), 404)
})

Logger.info(`Server starting on http://localhost:${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
