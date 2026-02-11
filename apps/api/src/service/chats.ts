// apps/api/src/service/chats.ts
import { prisma } from "../lib/db.js"
import type { AgentType, MessageRole } from "@prisma/client"

export async function getConversationMessagesService(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            agentType: true,
            createdAt: true,
          },
        },
      },
    })

    if (!conversation) return null

    return {
      id: conversation.id,
      topic: conversation.title || "General Inquiry",
      messages: conversation.messages.map(
        (m: { id: string; role: MessageRole; content: string; agentType: AgentType | null; createdAt: Date }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agentType: m.agentType,
          timestamp: m.createdAt,
        })
      ),
    }
  } catch (error) {
    throw new Error(`Failed to fetch messages for conversation ${conversationId}: ${(error as Error).message}`)
  }
}

export async function getConversationHistoryService(userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return conversations.map((c: { id: string; title: string | null; messages: { content: string }[]; updatedAt: Date }) => ({
      id: c.id,
      topic: c.title || "General Inquiry",
      lastMessage: c.messages[0]?.content || "No messages",
      messageCount: c.messages.length,
      lastUpdated: c.updatedAt,
    }))
  } catch (error) {
    throw new Error(`Failed to fetch conversation history for user ${userId}: ${(error as Error).message}`)
  }
}

export async function deleteConversationById(conversationId: string) {
  await prisma.conversation.delete({
    where: { id: conversationId },
  })
}