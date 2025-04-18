import { Hono } from 'hono'

const routes = new Hono()

routes.get('/', (c) => {
  return c.json({ message: 'Hello from Hono + Bun!' })
})

export default routes
