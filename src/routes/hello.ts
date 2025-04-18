import { Hono } from 'hono'
import { successResponse } from '@/utils/response'

const routes = new Hono()


routes.get('/', (c) => {
  return c.json(successResponse(200, "Hello from Bun", null))
})

export default routes
