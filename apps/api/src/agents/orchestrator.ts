import { routeMessage } from "./router.js"
import { handleSupportQuery } from "./support.js"
import { handleOrderQuery } from "./order.js"
import { handleBillingQuery } from "./billing.js"
import { prisma } from "../lib/db.js"
import type { AgentContext, AgentMessage, AgentRole } from "@repo/shared"
import type { AgentType } from "../generated/prisma/client.js"
import { summarizeMessages } from "../service/summary.js"

type AgentStream = { textStream: AsyncIterable<string> }

export async function orchestrate(
  userId: string,
  conversationId: string | null,
  userMessage: string
) {
    if (conversationId) {
      await compactConversation(conversationId)
    }

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
    ...(conversation?.summary
      ? [{ role: "SYSTEM" as const, content: `Conversation summary: ${conversation.summary}` }]
      : []),
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

const MAX_MESSAGES = 20
const KEEP_LAST = 8

async function compactConversation(conversationId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  if (!convo) return
  if (convo.messages.length <= MAX_MESSAGES) return

  const older = convo.messages.slice(0, convo.messages.length - KEEP_LAST)

  const newSummary = await summarizeMessages(
    older.map(m => ({ role: m.role, content: m.content })),
    convo.summary
  )

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { summary: newSummary, summaryUpdatedAt: new Date() },
  })

}