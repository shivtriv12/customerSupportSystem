import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});
const SUMMARY_PROMPT = `Summarize the conversation briefly for future context.
Keep key facts, user intent, and any decisions.
Return plain text.`;
export async function summarizeMessages(messages, existingSummary) {
    const input = [
        ...(existingSummary
            ? [{ role: "system", content: `Existing summary: ${existingSummary}` }]
            : []),
        ...messages.map((m) => ({
            role: "user",
            content: `${m.role}: ${m.content}`,
        })),
    ];
    const { text } = await generateText({
        model: openrouter("google/gemini-2.5-flash"),
        system: SUMMARY_PROMPT,
        messages: input,
    });
    return text;
}
