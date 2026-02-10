import 'dotenv/config'
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chatRouter } from "./controllers/chat.js"
import { prisma } from "./lib/db.js"
import { getAllUsers } from './service/getAllUsers.js'
import { agentsRouter } from './controllers/agents.js'

const app = new Hono()

app.use("*", cors())

app.use("*", async (c, next) => {
  try {
    await next()
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500)
  }
})

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.get("/api/users", async (c) => {
  try {
    const users = await getAllUsers()
    return c.json(users)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.route("/api/chat", chatRouter)
app.route("/api/agents", agentsRouter)

const port = 3000

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server Started`)
})

export default app