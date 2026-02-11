import { streamText, stepCountIs } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { getInvoiceService, getRefundStatusService } from "../tools/billing.js"
import { toLlmMessages, type AgentContext } from "@repo/shared"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const BILLING_SYSTEM_PROMPT = `You are a customer support agent specializing in billing. Your role is to:
- Help with invoice inquiries
- Check refund statuses
- Answer payment and subscription questions

You have access to tools to look up invoice and refund information.
Always ask for the invoice number if the user hasn't provided one.
Be clear about statuses:
- Invoice: OPEN, PAID, OVERDUE, REFUNDED
- Refund: REQUESTED, APPROVED, REJECTED, PROCESSED`
type AgentStream = { textStream: AsyncIterable<string> }


export async function handleBillingQuery(context: AgentContext) {
  const result = streamText({
    model: openrouter("google/gemini-2.5-flash"),
    system: BILLING_SYSTEM_PROMPT,
    messages: toLlmMessages(context.messages),
    tools: {
      getInvoice: {
        description: "Get full invoice details including amount, status, and any related refunds. Use when the user asks about an invoice or payment.",
        inputSchema: z.object({
          invoiceNo: z.string().describe("The invoice number, e.g. INV-001")
        }),
        execute: async ({ invoiceNo }: { invoiceNo: string }) => {
          const invoice = await getInvoiceService(invoiceNo,context.userId)
          if (!invoice) return JSON.stringify({ error: `Invoice ${invoiceNo} not found` })
          return JSON.stringify(invoice)
        }
      },
      checkRefundStatus: {
        description: "Check the refund status for a specific invoice. Use when the user asks about a refund.",
        inputSchema: z.object({
          invoiceNo: z.string().describe("The invoice number to check refund status for")
        }),
        execute: async ({ invoiceNo }: { invoiceNo: string }) => {
          const refund = await getRefundStatusService(invoiceNo,context.userId)
          if (!refund) return JSON.stringify({ error: `Invoice ${invoiceNo} not found` })
          return JSON.stringify(refund)
        }
      }
    },
    stopWhen: stepCountIs(5)
  })

  return result as unknown as AgentStream
}