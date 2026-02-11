import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { toLlmMessages } from "@repo/shared";
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
});
const routingSchema = z.object({
    agentType: z.enum(["SUPPORT", "ORDER", "BILLING"]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string()
});
const ROUTER_SYSTEM_PROMPT = `You are a customer support router. Analyze the user's message and classify it to the correct department.

Rules:
- SUPPORT: General inquiries, FAQs, troubleshooting, how-to questions, account issues
- ORDER: Order status, tracking, delivery, modifications, cancellations, shipping
- BILLING: Payments, refunds, invoices, charges, subscription billing, pricing

Respond with:
- agentType: The department to route to
- confidence: How confident you are (0 to 1)
- reasoning: Brief explanation of why you chose this department

If unclear, default to SUPPORT.`;
export async function routeMessage(messages) {
    try {
        const llmMessages = toLlmMessages(messages);
        const { output } = await generateText({
            model: openrouter("google/gemini-2.5-flash"),
            output: Output.object({
                schema: routingSchema
            }),
            system: ROUTER_SYSTEM_PROMPT,
            messages: llmMessages
        });
        if (!output) {
            throw new Error("No output returned from router");
        }
        return output;
    }
    catch (error) {
        return {
            agentType: "SUPPORT",
            confidence: 0.5,
            reasoning: "Routing failed, defaulting to support agent"
        };
    }
}
