import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { registerRoutes } from '@/routes'
import { env } from '@/env'
import { errorResponse } from '@/utils/response'
import { Logger } from '@/utils/logger'
import { cors } from 'hono/cors'

const app = new Hono()

registerRoutes(app)

app.use(logger())
app.use('*', cors())

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
