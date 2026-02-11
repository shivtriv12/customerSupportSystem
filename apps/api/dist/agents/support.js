import { streamText, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { getConversationHistoryService, getConversationMessagesService } from "../tools/support.js";
import { toLlmMessages } from "@repo/shared";
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
});
const SUPPORT_SYSTEM_PROMPT = `You are a friendly and helpful customer support agent. Your role is to:
- Answer general support inquiries and FAQs
- Help with troubleshooting
- Provide helpful guidance

You have access to tools to look up conversation history for context.
Always be polite, concise, and helpful.
If you cannot resolve an issue, let the user know you'll escalate it.`;
export async function handleSupportQuery(context) {
    const result = streamText({
        model: openrouter("google/gemini-2.5-flash"),
        system: SUPPORT_SYSTEM_PROMPT,
        messages: toLlmMessages(context.messages),
        tools: {
            getConversationHistory: {
                description: "Get the user's past 5 conversations to understand their history and provide personalized support.",
                inputSchema: z.object({
                    userId: z.string().describe("The user's ID")
                }),
                execute: async ({ userId }) => {
                    const history = await getConversationHistoryService(userId);
                    return JSON.stringify(history);
                }
            },
            getConversationMessages: {
                description: "Get all messages from a specific conversation. Use this to review the full context of an ongoing or past conversation.",
                inputSchema: z.object({
                    conversationId: z.string().describe("The conversation ID to fetch messages for")
                }),
                execute: async ({ conversationId }) => {
                    const messages = await getConversationMessagesService(conversationId);
                    return JSON.stringify(messages);
                }
            }
        },
        stopWhen: stepCountIs(5)
    });
    return result;
}
