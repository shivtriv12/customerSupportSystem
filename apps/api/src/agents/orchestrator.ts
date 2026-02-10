import { routeMessage } from "./router.js"
import { handleSupportQuery } from "./support.js"
import { handleOrderQuery } from "./order.js"
import { handleBillingQuery } from "./billing.js"
import { prisma } from "../lib/db.js"
import type { AgentContext, AgentMessage, AgentRole } from "@repo/shared"
import type { AgentType } from "../generated/prisma/client.js"

export async function orchestrate(
  userId: string,
  conversationId: string | null,
  userMessage: string
) {
  const conversation = conversationId
    ? await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { role: true, content: true }
          }
        }
      })
    : null

  if (conversationId && !conversation) {
    throw new Error(`Conversation ${conversationId} not found`)
  }

  const previousMessages: AgentMessage[] = conversation
    ? conversation.messages.map(m => ({
        role: (m.role as unknown as AgentRole),
        content: m.content
      }))
    : []

  const allMessages: AgentMessage[] = [
    ...previousMessages,
    { role: "USER", content: userMessage }
  ]

  const routing = await routeMessage(allMessages)

  const activeConversation = conversation
    ?? await prisma.conversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 100)
        }
      })

  await prisma.message.create({
    data: {
      conversationId: activeConversation.id,
      userId,
      role: "USER",
      content: userMessage
    }
  })

  const context: AgentContext = {
    userId,
    conversationId: activeConversation.id,
    messages: allMessages
  }

  const agentHandler = getAgentHandler(routing.agentType)
  const stream = await agentHandler(context)

  return {
    stream,
    conversationId: activeConversation.id,
    agentType: routing.agentType,
    routing
  }
}

function getAgentHandler(agentType: AgentType) {
  const handlers = {
    SUPPORT: handleSupportQuery,
    ORDER: handleOrderQuery,
    BILLING: handleBillingQuery
  }

  return handlers[agentType]
}

export async function saveAgentResponse(
  conversationId: string,
  content: string,
  agentType: AgentType
) {
  await prisma.message.create({
    data: {
      conversationId,
      role: "AGENT",
      content,
      agentType
    }
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })
}