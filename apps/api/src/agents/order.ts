import { streamText, stepCountIs } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { getOrderDetailsService, getDeliveryStatusService } from "../tools/order.js"
import { toLlmMessages, type AgentContext } from "@repo/shared"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const ORDER_SYSTEM_PROMPT = `You are a customer support agent specializing in orders. Your role is to:
- Check order status and details
- Provide delivery/tracking information
- Help with order modifications and cancellations

You have access to tools to look up order information.
Always ask for the order number if the user hasn't provided one.
Be clear about order statuses: PROCESSING, DISPATCHED, DELIVERED, CANCELLED.`
type AgentStream = { textStream: AsyncIterable<string> }

export async function handleOrderQuery(context: AgentContext) {
  const result = streamText({
    model: openrouter("google/gemini-2.5-flash"),
    system: ORDER_SYSTEM_PROMPT,
    messages: toLlmMessages(context.messages),
    tools: {
      getOrderDetails: {
        description: "Fetch full order details including item, amount, status, and creation date. Use when the user asks about a specific order.",
        inputSchema: z.object({
          orderNumber: z.string().describe("The order number, e.g. ORD-001")
        }),
        execute: async ({ orderNumber }: { orderNumber: string }) => {
          const order = await getOrderDetailsService(orderNumber,context.userId)
          if (!order) return JSON.stringify({ error: `Order ${orderNumber} not found` })
          return JSON.stringify(order)
        }
      },
      checkDeliveryStatus: {
        description: "Check the delivery status of an order. Use when the user asks about shipping, tracking, or delivery.",
        inputSchema: z.object({
          orderNumber: z.string().describe("The order number to check delivery status for")
        }),
        execute: async ({ orderNumber }: { orderNumber: string }) => {
          const status = await getDeliveryStatusService(orderNumber,context.userId)
          if (!status) return JSON.stringify({ error: `Order ${orderNumber} not found` })
          return JSON.stringify(status)
        }
      }
    },
    stopWhen: stepCountIs(5)
  })

  return result as unknown as AgentStream
}