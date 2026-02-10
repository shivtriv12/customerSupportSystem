import { prisma } from "../lib/db.js"

export async function listConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  })
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  })
}

export async function deleteConversationById(id: string) {
  await prisma.message.deleteMany({
    where: { conversationId: id }
  })

  return prisma.conversation.delete({
    where: { id }
  })
}