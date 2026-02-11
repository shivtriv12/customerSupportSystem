import { useEffect, useRef, useState } from "react";
import type { Message } from "../../types/ui";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { api } from "../../lib/api";
import { AIStatusIndicator } from "./AIStatusIndicator";
import { readNdjsonStream } from "../../lib/stream";

type ConversationResponse = {
  id: string;
  title?: string | null;
  messages: Message[];
};

type StreamEvent =
  | { type: "metadata"; conversationId: string; agentType: string; routing?: unknown }
  | { type: "typing" }
  | { type: "text"; content: string }
  | { type: "error"; message: string }
  | { type: "done"; conversationId?: string };

export function ChatWindow({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  useEffect(() => {
    setMessages([]);
    setAiStatus(null);
    setLoading(false);
    setAiReasoning(null);
  }, [userId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      const res = await api.chat.conversations[":id"].$get({
        param: { id: conversationId },
      });
      const data = (await res.json()) as ConversationResponse;
      setMessages(data.messages);
    };

    loadConversation();
  }, [conversationId, userId]);

  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      const res = await api.chat.conversations[":id"].$get({
        param: { id: conversationId },
      });
      const data = (await res.json()) as ConversationResponse;
      setMessages(data.messages);
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiStatus]);

  async function handleSend(text: string) {
    setAiReasoning(null);
    setLoading(true);
    setAiStatus("Thinking...");
    const userMessage: Message = { role: "USER", content: text };
    setMessages((m) => [...m, userMessage]);

    try {
      const res = await api.chat.messages.$post({
        json: { userId, conversationId, message: text },
      });

      const body = res.body;
      if (!body) return;

      let agentBuffer = "";
      let gotAnyText = false;

      await readNdjsonStream<StreamEvent>(
        body,
        (event) => {
          if (event.type === "typing") {
            setAiStatus("Thinking...");
          }

          if (event.type === "text") {
            gotAnyText = true;
            if (!event.content || event.content === "undefined") return;
            if (aiStatus) setAiStatus(null);

            agentBuffer += event.content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "AGENT") {
                return [...prev.slice(0, -1), { ...last, content: agentBuffer }];
              }
              return [...prev, { role: "AGENT", content: agentBuffer }];
            });
          }

          if (event.type === "metadata" && event.routing && typeof event.routing === "object") {
            const r = event.routing as { reasoning?: string };
            if (r.reasoning) setAiReasoning(r.reasoning);
          }

          if (event.type === "done") {
            setAiStatus(null);
          }

          if (event.type === "error") {
            setMessages((prev) => [
              ...prev,
              { role: "AGENT", content: event.message || "Something went wrong." },
            ]);
          }
        },
        (err, raw) => {
          console.error("NDJSON parse error", err, raw);
        }
      );

      if (!gotAnyText) {
        setMessages((prev) => [
          ...prev,
          { role: "AGENT", content: "Sorry, I couldn’t find that information." },
        ]);
      }
    } finally {
      setLoading(false);
      setAiStatus(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-6">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} message={m} />
        ))}

        {aiReasoning && (
          <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
            <span className="font-medium">Routing reason:</span> {aiReasoning}
          </div>
        )}

        {aiStatus && (
          <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
            <AIStatusIndicator text={aiStatus} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
}