import { Hono } from "hono"
import { z } from "zod"

const agentsRouter = new Hono()

const agentTypeSchema = z.object({
  type: z.enum(["SUPPORT", "ORDER", "BILLING"])
})

agentsRouter.get("/", (c) => {
  return c.json([
    { type: "SUPPORT", name: "Support Agent", description: "General support, FAQs, troubleshooting" },
    { type: "ORDER", name: "Order Agent", description: "Order status, tracking, modifications, cancellations" },
    { type: "BILLING", name: "Billing Agent", description: "Payments, refunds, invoices, subscriptions" }
  ])
})

agentsRouter.get("/:type/capabilities", (c) => {
  const parsed = agentTypeSchema.safeParse({ type: c.req.param("type")?.toUpperCase() })
  if (!parsed.success) return c.json({ error: "Agent type not found" }, 404)

  const type = parsed.data.type

  const capabilities: Record<string, object> = {
    SUPPORT: {
      type: "SUPPORT",
      name: "Support Agent",
      tools: ["getConversationHistory", "getConversationMessages"],
      handles: ["FAQs", "troubleshooting", "general inquiries", "account issues"]
    },
    ORDER: {
      type: "ORDER",
      name: "Order Agent",
      tools: ["getOrderDetails", "checkDeliveryStatus"],
      handles: ["order status", "tracking", "delivery", "modifications", "cancellations"]
    },
    BILLING: {
      type: "BILLING",
      name: "Billing Agent",
      tools: ["getInvoice", "checkRefundStatus"],
      handles: ["invoices", "refunds", "payments", "subscriptions"]
    }
  }

  return c.json(capabilities[type])
})

export { agentsRouter }