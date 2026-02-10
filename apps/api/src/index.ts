import 'dotenv/config'
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chatRouter } from "./controllers/chat.js"
import { agentsRouter } from "./controllers/agents.js"
import { getAllUsers } from './service/getAllUsers.js'

const app = new Hono()

app.use("*", cors())

app.use("*", async (c, next) => {
  try {
    await next()
  } catch (err) {
    console.error(err)
    return c.json({ error: (err as Error).message }, 500)
  }
})

const routes = app
  .get("/api/health", (c) => {
    return c.json({ 
      status: "ok", 
      timestamp: new Date().toISOString() 
    })
  })
  .get("/api/users", async (c) => {
    try {
      const users = await getAllUsers()
      return c.json(users)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500)
    }
  })
  .route("/api/chat", chatRouter)
  .route("/api/agents", agentsRouter)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export type AppType = typeof routes

export default app