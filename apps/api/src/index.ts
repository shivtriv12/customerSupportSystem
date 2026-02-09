import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS so frontend can call backend
app.use('/*', cors())

// Create a route
const routes = app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!',
  })
})

// EXPORT THE TYPE (Crucial for RPC)
export type AppType = typeof routes

serve(app)