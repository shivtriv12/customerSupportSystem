// apps/api/src/controllers/chat.ts
import { Hono } from "hono"
import { stream } from "hono/streaming"
import { z } from "zod"
import { orchestrate, saveAgentResponse } from "../agents/orchestrator.js"
import {
  getConversationHistoryService,
  getConversationMessagesService,
  deleteConversationById
} from "../service/chats.js"
import type { AgentType, MessageRole } from "@prisma/client"
import { rateLimit } from "../lib/rateLimit.js"

const chatRouter = new Hono()

const sendMessageSchema = z.object({
  userId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1)
})

chatRouter.post("/messages", rateLimit, async (c) => {
  const body = await c.req.json()
  const parsed = sendMessageSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const { userId, conversationId, message } = parsed.data
  const result = await orchestrate(userId, conversationId ?? null, message)

  return stream(c, async (s) => {
    let fullResponse = ""
    await s.write(
      JSON.stringify({
        type: "metadata",
        conversationId: result.conversationId,
        agentType: result.agentType,
        routing: result.routing ?? null
      }) + "\n"
    )

    let active = true
    const typingInterval = setInterval(async () => {
      if (!active) return
      try {
        await s.write(JSON.stringify({ type: "typing" }) + "\n")
      } catch {}
    }, 1500)

    try {
      const maybe = result.stream as any
      const textIter: AsyncIterable<string> =
        (maybe && typeof maybe[Symbol.asyncIterator] === "function")
          ? maybe
          : maybe.textStream

      for await (const chunk of textIter) {
        fullResponse += chunk
        try {
          await s.write(JSON.stringify({ type: "text", content: chunk }) + "\n")
        } catch {}
      }
    } finally {
      active = false
      clearInterval(typingInterval)
    }

    try {
      await saveAgentResponse(result.conversationId, fullResponse, result.agentType as AgentType)
    } catch (err) {
      try {
        await s.write(JSON.stringify({ type: "error", message: (err as Error).message }) + "\n")
      } catch {}
    }

    await s.write(JSON.stringify({ type: "done", conversationId: result.conversationId }) + "\n")
  })
})

const listConvosSchema = z.object({
  userId: z.string().min(1)
})

chatRouter.get("/conversations", rateLimit, async (c) => {
  const parsed = listConvosSchema.safeParse({ userId: c.req.query("userId") })
  if (!parsed.success) return c.json({ error: "userId query param is required" }, 400)

  const conversations = await getConversationHistoryService(parsed.data.userId)
 
  return c.json(
    conversations.map((conv: { id: string; topic: string; lastMessage: string; messageCount: number; lastUpdated: Date }) => ({
      id: conv.id,
      title: conv.topic,
      lastMessage: conv.lastMessage,
      updatedAt: conv.lastUpdated
    }))
  )
})

const idParamSchema = z.object({ id: z.string().min(1) })

chatRouter.get("/conversations/:id", rateLimit, async (c) => {
  const parsed = idParamSchema.safeParse({ id: c.req.param("id") })
  if (!parsed.success) return c.json({ error: "id param is required" }, 400)

  const conversation = await getConversationMessagesService(parsed.data.id)
  if (!conversation) return c.json({ error: "Conversation not found" }, 404)

  return c.json({
    id: conversation.id,
    title: conversation.topic,
    messages: conversation.messages.map(
      (m: { id: string; role: MessageRole; content: string; agentType: AgentType | null; timestamp: Date }) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        agentType: m.agentType,
        createdAt: m.timestamp
      })
    )
  })
})

chatRouter.delete("/conversations/:id", rateLimit, async (c) => {
  const parsed = idParamSchema.safeParse({ id: c.req.param("id") })
  if (!parsed.success) return c.json({ error: "id param is required" }, 400)

  const conversation = await getConversationMessagesService(parsed.data.id)
  if (!conversation) return c.json({ error: "Conversation not found" }, 404)

  await deleteConversationById(parsed.data.id)
  return c.json({ success: true })
})

export { chatRouter }